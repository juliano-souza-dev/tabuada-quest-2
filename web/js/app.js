(function (root) {
    const TQ = root.TabuadaQuest;
    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) return;

    // App-style input: suppress browser pinch and double-tap zoom while preserving ordinary single-touch interaction.
    document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("gesturechange", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("gestureend", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("touchmove", (event) => {
        if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener("touchend", (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) event.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    let developmentState = null;
    let developmentMode = false;
    let developmentRegionId = null;
    let worldMapPreviewRegionId = null;
    let regionBuilderPreviewActive = false;
    let rewardReturnScreen = null;
    let worldMapReturnScreen = "home";
    let authBusy = false;
    let authRestorePending = false;
    let authRestoreRequired = false;
    let authErrorCode = "";
    let appRenderToken = 0;
    let activeOceanController = null;
    let activeDepthController = null;
    let activeAudioController = null;
    let activeCompositionController = null;
    let activeDevelopmentNavigatorCleanup = null;
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    function syncStatus() {
        return TQ.persistence.localStorage.getSyncStatus();
    }

    function requestRemoteRestore() {
        authRestoreRequired = true;
        authRestorePending = true;
        authErrorCode = "";
        render();
        if (!TQ.persistence.localStorage.restoreFromServer()) {
            authRestorePending = false;
            authErrorCode = "restore_failed";
            render();
        }
    }

    function startGoogleSignIn() {
        if (authBusy) return;
        authBusy = true;
        authErrorCode = "";
        render();
        if (!TQ.persistence.localStorage.signInWithGoogle()) {
            authBusy = false;
            authErrorCode = "google_sign_in_cancelled_or_failed";
            render();
        }
    }

    function resetDevelopmentSession() {
        const status = syncStatus();

        if (status.native) {
            signOut();
            return;
        }

        TQ.persistence.localStorage.clearLocalState(root.localStorage);
        state = TQ.domain.playerState.createInitialState();
        developmentState = null;
        developmentMode = false;
        developmentRegionId = null;
        worldMapPreviewRegionId = null;
        regionBuilderPreviewActive = false;
        rewardReturnScreen = null;
        worldMapReturnScreen = "home";
        authBusy = false;
        authRestorePending = false;
        authRestoreRequired = false;
        authErrorCode = "";
        render();
    }

    function mountDevelopmentExit() {
        document.querySelector(".tq-exit-dev")?.remove();

        const host = document.createElement("aside");
        host.className = "tq-exit-dev";
        host.innerHTML = `
            <button
                type="button"
                class="tq-exit-dev-toggle"
                aria-label="Sair e limpar a sessão local de testes">
                SAIR
            </button>
        `;
        document.body.appendChild(host);
        host.querySelector(".tq-exit-dev-toggle").addEventListener("click", resetDevelopmentSession);
    }

    function signOut() {
        TQ.persistence.localStorage.signOut();
        authBusy = false;
        authRestorePending = false;
        authRestoreRequired = false;
        authErrorCode = "";
        render();
    }

    root.addEventListener("tq:native-auth", (event) => {
        authBusy = false;
        const detail = event.detail || {};

        if (!detail.ok) {
            authRestorePending = false;
            authRestoreRequired = false;
            authErrorCode = detail.code || "google_sign_in_cancelled_or_failed";
            render();
            return;
        }

        if (detail.code === "signed_out") {
            authRestorePending = false;
            authRestoreRequired = false;
            authErrorCode = "";
            render();
            return;
        }

        requestRemoteRestore();
    });

    root.addEventListener("tq:native-restore", (event) => {
        const detail = event.detail || {};
        authRestorePending = false;

        if (detail.code === "remote_state_empty") {
            authRestoreRequired = false;
            authErrorCode = "";
            state = TQ.persistence.localStorage.saveState(
                root.localStorage,
                TQ.domain.playerState.createInitialState()
            );
            render();
            return;
        }

        authRestoreRequired = true;
        authErrorCode = detail.code || "restore_failed";
        render();
    });

    function save(nextState) {
        if (developmentMode) {
            developmentState = nextState;
            render();
            return;
        }

        state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
        render();
    }

    function commitSettingsState(nextState) {
        const normalized = TQ.domain.playerState.normalizeState(nextState);
        state = TQ.persistence.localStorage.saveState(root.localStorage, normalized);
        if (developmentMode) developmentState = state;
        render();
    }

    function openSettingsRegion(nextState, regionId) {
        const normalizedRegionId = Math.max(
            1,
            Math.min(TQ.domain.playerState.TOTAL_REGIONS, Number(regionId) || 1)
        );
        const normalized = TQ.domain.playerState.normalizeState(nextState);

        developmentMode = false;
        developmentState = null;
        developmentRegionId = null;
        worldMapPreviewRegionId = null;
        rewardReturnScreen = null;

        state = TQ.persistence.localStorage.saveState(root.localStorage, {
            ...normalized,
            campaign: {
                ...normalized.campaign,
                currentRegionId: normalizedRegionId,
                currentIslandId: 1
            },
            learning: {
                ...normalized.learning,
                activeSession: null
            },
            ui: {
                ...normalized.ui,
                lastScreen: "islands"
            }
        });
        render();
    }

    function openSettingsIsland(nextState, regionId, islandId) {
        const normalizedRegionId = Math.max(
            1,
            Math.min(TQ.domain.playerState.TOTAL_REGIONS, Number(regionId) || 1)
        );
        const normalizedIslandId = Math.max(
            1,
            Math.min(TQ.domain.playerState.ISLANDS_PER_REGION, Number(islandId) || 1)
        );
        let normalized = TQ.domain.playerState.normalizeState(nextState);

        developmentMode = false;
        developmentState = null;
        developmentRegionId = null;
        worldMapPreviewRegionId = null;
        rewardReturnScreen = null;

        // IMPORTANT: enter through the exact same state factory used by a normal
        // island click. Rewards, pets, chests, map fragments and completion stay
        // on the production gameplay path; SETTINGS only prepares access.
        normalized = TQ.screens.islands.createIslandEntryState(
            normalized,
            normalizedRegionId,
            normalizedIslandId
        );

        state = TQ.persistence.localStorage.saveState(root.localStorage, normalized);
        render();
    }

    function openRegionBuilderPreview() {
        regionBuilderPreviewActive = true;
        render();
    }

    function closeRegionBuilderPreview() {
        regionBuilderPreviewActive = false;
        render();
    }

    function normalizePreviewRegionId(regionId) {
        const normalized = Number(regionId);
        return Number.isInteger(normalized) && normalized >= 1 && normalized <= 22
            ? normalized
            : null;
    }

    function setWorldMapPreviewRegion(regionId) {
        worldMapPreviewRegionId = normalizePreviewRegionId(regionId);
    }

    function setDevelopmentRegion(regionId) {
        developmentRegionId = normalizePreviewRegionId(regionId);
    }

    function openDevelopmentIsland(regionId, islandId) {
        if (!developmentMode) return;

        const normalizedRegionId = normalizePreviewRegionId(regionId);
        const normalizedIslandId = Number(islandId);
        if (!normalizedRegionId
            || !Number.isInteger(normalizedIslandId)
            || normalizedIslandId < 1
            || normalizedIslandId > 5) return;

        developmentRegionId = normalizedRegionId;
        const baseState = developmentState || state;
        developmentState = TQ.screens.islands.createDevelopmentIslandEntryState(
            baseState,
            normalizedRegionId,
            normalizedIslandId
        );
        render();
    }

    function navigate(screenId, options = {}) {
        if (screenId === "development-regions") {
            developmentMode = true;
            developmentState = TQ.domain.playerState.withLastScreen(
                developmentState || state,
                "development-regions"
            );
            render();
            return;
        }

        if (developmentMode) {
            if (screenId === "home") {
                developmentMode = false;
                developmentState = null;
                developmentRegionId = null;
                worldMapPreviewRegionId = null;
                state = TQ.persistence.localStorage.saveState(
                    root.localStorage,
                    TQ.domain.playerState.withLastScreen(state, "home")
                );
                render();
                return;
            }

            const developmentTarget = screenId === "regions"
                ? "development-regions"
                : screenId;
            developmentState = TQ.domain.playerState.withLastScreen(
                developmentState || state,
                developmentTarget
            );
            render();
            return;
        }

        if (["world-map", "regions"].includes(screenId)) {
            worldMapReturnScreen = options.returnScreen
                || (state.ui.lastScreen === "islands" ? "islands" : "home");
        }

        if (!["world-map", "development-regions", "islands"].includes(screenId)) {
            worldMapPreviewRegionId = null;
        }

        if (screenId === "pet" || screenId === "chest" || screenId === "map-reward") {
            rewardReturnScreen = options.afterReward === "regions" ? "regions" : "islands";
        } else if (screenId !== "result") {
            rewardReturnScreen = null;
        }

        state = TQ.persistence.localStorage.saveState(
            root.localStorage,
            TQ.domain.playerState.withLastScreen(state, screenId)
        );
        render();
    }

    const DEV_SCREEN_LABELS = Object.freeze({
        home: "Home",
        "world-map": "Carta Náutica",
        regions: "Carta Náutica",
        "development-regions": "Regiões",
        islands: "Mapa da Região",
        travel: "Viagem para Ilha",
        challenge: "Ilha · Jogo",
        tavern: "Taverna",
        crew: "Tripulação",
        collectibles: "Colecionáveis",
        shop: "Loja",
        items: "Itens",
        "ruby-shop": "Loja de Rubis",
        "special-mission": "Missão especial",
        chest: "Baú",
        pet: "Pet",
        "map-reward": "Recompensa de mapa",
        result: "Resultado",
        "profile-setup": "Perfil"
    });

    const DEV_NAV_TARGETS = Object.freeze([
        Object.freeze({ id: "home", label: "Home" }),
        Object.freeze({ id: "world-map", label: "Carta Náutica" }),
        Object.freeze({ id: "development-regions", label: "Regiões" }),
        Object.freeze({ id: "islands", label: "Mapa da Região", needsRegion: true }),
        Object.freeze({ id: "challenge", label: "Ilha · Jogo", needsRegion: true, needsIsland: true }),
        Object.freeze({ id: "travel", label: "Viagem para Ilha", needsRegion: true, needsIsland: true }),
        Object.freeze({ id: "tavern", label: "Taverna" }),
        Object.freeze({ id: "crew", label: "Tripulação" }),
        Object.freeze({ id: "collectibles", label: "Colecionáveis" }),
        Object.freeze({ id: "shop", label: "Loja" }),
        Object.freeze({ id: "items", label: "Itens" }),
        Object.freeze({ id: "ruby-shop", label: "Loja de Rubis", needsRegion: true })
    ]);

    function developmentScreenLabel(screenId) {
        return DEV_SCREEN_LABELS[String(screenId || "")] || String(screenId || "Tela");
    }

    function directDevelopmentNavigate(targetScreenId, regionId, islandId) {
        const target = DEV_NAV_TARGETS.find((item) => item.id === String(targetScreenId || ""));
        if (!target) return;

        const totalRegions = Math.max(1, Number(TQ.domain.playerState.TOTAL_REGIONS) || 1);
        const islandsPerRegion = Math.max(1, Number(TQ.domain.playerState.ISLANDS_PER_REGION) || 1);
        const normalizedRegionId = Math.max(1, Math.min(totalRegions, Number(regionId) || 1));
        const normalizedIslandId = Math.max(1, Math.min(islandsPerRegion, Number(islandId) || 1));

        let nextState = developmentState || state;
        developmentMode = true;
        regionBuilderPreviewActive = false;
        rewardReturnScreen = null;

        if (target.needsRegion) {
            developmentRegionId = normalizedRegionId;
            nextState = {
                ...nextState,
                campaign: {
                    ...nextState.campaign,
                    currentRegionId: normalizedRegionId,
                    currentIslandId: target.needsIsland
                        ? normalizedIslandId
                        : Number(nextState.campaign?.currentIslandId) || 1
                }
            };
        }

        if (target.needsIsland) {
            nextState = TQ.screens.islands.createDevelopmentIslandEntryState(
                nextState,
                normalizedRegionId,
                normalizedIslandId
            );
        }

        developmentState = TQ.domain.playerState.withLastScreen(nextState, target.id);
        render();
    }

    function mountDevelopmentContextNavigator(options = {}) {
        activeDevelopmentNavigatorCleanup?.();
        activeDevelopmentNavigatorCleanup = null;
        document.querySelector(".tq-dev-navigator")?.remove();
        document.querySelector(".tq-dev-mobile-context")?.remove();

        if (!TQ.content.development?.shortcutsEnabled) return;

        const editorContext = options.editorContext || {};
        const actualScreenId = String(editorContext.screenType || options.screenId || "home");
        const currentLabel = developmentScreenLabel(actualScreenId);
        const islandScopedContext = new Set([
            "travel",
            "challenge",
            "special-mission",
            "chest",
            "pet",
            "map-reward",
            "result"
        ]).has(actualScreenId);
        const displayedIslandId = islandScopedContext ? editorContext.islandId : null;
        const totalRegions = Math.max(1, Number(TQ.domain.playerState.TOTAL_REGIONS) || 1);
        const islandsPerRegion = Math.max(1, Number(TQ.domain.playerState.ISLANDS_PER_REGION) || 1);
        const currentRegionId = Math.max(
            1,
            Math.min(totalRegions, Number(editorContext.regionId) || Number(developmentRegionId) || 1)
        );
        const currentIslandId = Math.max(
            1,
            Math.min(islandsPerRegion, Number(editorContext.islandId) || 1)
        );

        const host = document.createElement("aside");
        host.className = "tq-dev-navigator";
        host.innerHTML = `
            <button type="button" class="tq-dev-nav-toggle" aria-label="Abrir navegação DEV">NAV</button>
            <section class="tq-dev-nav-panel">
                <header>
                    <strong>DEV · Contexto</strong>
                    <small>Navegação direta</small>
                    <button type="button" class="tq-dev-nav-close" data-dev-nav-close aria-label="Fechar navegação">×</button>
                </header>
                <div class="tq-dev-nav-context">
                    <div><span>Tela</span><strong data-dev-nav-current-screen></strong></div>
                    <div data-dev-nav-current-region-row><span>Região</span><strong data-dev-nav-current-region></strong></div>
                    <div data-dev-nav-current-island-row><span>Ilha</span><strong data-dev-nav-current-island></strong></div>
                    <div data-dev-nav-current-background-row><span>Fundo</span><strong data-dev-nav-current-background></strong></div>
                </div>
                <label>
                    Ir para
                    <select data-dev-nav-screen>
                        ${DEV_NAV_TARGETS.map((item) =>
                            '<option value="' + item.id + '">' + item.label + '</option>'
                        ).join("")}
                    </select>
                </label>
                <div class="tq-dev-nav-grid">
                    <label data-dev-nav-region-row>
                        Região
                        <select data-dev-nav-region>
                            ${Array.from({ length: totalRegions }, (_, index) =>
                                '<option value="' + (index + 1) + '">Região ' + (index + 1) + '</option>'
                            ).join("")}
                        </select>
                    </label>
                    <label data-dev-nav-island-row>
                        Ilha
                        <select data-dev-nav-island>
                            ${Array.from({ length: islandsPerRegion }, (_, index) =>
                                '<option value="' + (index + 1) + '">Ilha ' + (index + 1) + '</option>'
                            ).join("")}
                        </select>
                    </label>
                </div>
                <button type="button" data-dev-nav-open>Abrir tela</button>
            </section>
        `;

        const mobileBadge = document.createElement("button");
        mobileBadge.type = "button";
        mobileBadge.className = "tq-dev-mobile-context";
        mobileBadge.hidden = false;
        mobileBadge.setAttribute("aria-label", "Abrir navegação direta DEV");
        document.body.append(host, mobileBadge);

        const panel = host.querySelector(".tq-dev-nav-panel");
        const toggle = host.querySelector(".tq-dev-nav-toggle");
        const screenSelect = host.querySelector("[data-dev-nav-screen]");
        const regionSelect = host.querySelector("[data-dev-nav-region]");
        const islandSelect = host.querySelector("[data-dev-nav-island]");
        const regionRow = host.querySelector("[data-dev-nav-region-row]");
        const islandRow = host.querySelector("[data-dev-nav-island-row]");

        host.querySelector("[data-dev-nav-current-screen]").textContent = currentLabel;

        const currentRegionRow = host.querySelector("[data-dev-nav-current-region-row]");
        const currentRegion = host.querySelector("[data-dev-nav-current-region]");
        if (editorContext.regionId) {
            currentRegion.textContent = "R" + editorContext.regionId
                + (editorContext.regionLabel ? " · " + editorContext.regionLabel : "");
        } else {
            currentRegionRow.hidden = true;
        }

        const currentIslandRow = host.querySelector("[data-dev-nav-current-island-row]");
        if (displayedIslandId) {
            host.querySelector("[data-dev-nav-current-island]").textContent = "Ilha " + displayedIslandId;
        } else {
            currentIslandRow.hidden = true;
        }

        const currentBackgroundRow = host.querySelector("[data-dev-nav-current-background-row]");
        if (options.homeBackgroundId) {
            host.querySelector("[data-dev-nav-current-background]").textContent = options.homeBackgroundId;
        } else {
            currentBackgroundRow.hidden = true;
        }

        const mobileContextParts = [currentLabel];
        if (editorContext.regionId) mobileContextParts.push("R" + editorContext.regionId);
        if (displayedIslandId) mobileContextParts.push("Ilha " + displayedIslandId);
        if (options.homeBackgroundId) mobileContextParts.push("Fundo " + options.homeBackgroundId);

        function syncMobileGuide(activeTool = null) {
            const parts = [...mobileContextParts];
            if (activeTool) parts.push(activeTool);
            parts.push("NAV ›");
            mobileBadge.textContent = parts.join(" · ");
        }

        syncMobileGuide();

        const currentTarget = DEV_NAV_TARGETS.find((item) => item.id === actualScreenId)
            || DEV_NAV_TARGETS.find((item) =>
                actualScreenId === "regions" && item.id === "world-map"
            )
            || DEV_NAV_TARGETS[0];

        screenSelect.value = currentTarget.id;
        regionSelect.value = String(currentRegionId);
        islandSelect.value = String(currentIslandId);

        function syncTargetFields() {
            const target = DEV_NAV_TARGETS.find((item) => item.id === screenSelect.value);
            regionRow.hidden = !target?.needsRegion;
            islandRow.hidden = !target?.needsIsland;
        }

        function openNavigator(nextOpen) {
            const open = Boolean(nextOpen);
            panel.hidden = !open;
            const compactMobile = root.matchMedia("(max-width: 620px)").matches;
            if (compactMobile) mobileBadge.hidden = open;
            if (open) {
                document.querySelectorAll(
                    ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, "
                    + ".tq-region-builder-panel, .tq-ocean-dev-panel, .tq-depth-dev-panel, .tq-audio-dev-panel"
                ).forEach((candidate) => {
                    candidate.hidden = true;
                });
                root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                    detail: { tool: "nav" }
                }));
            } else if (compactMobile) {
                mobileBadge.hidden = false;
                syncMobileGuide();
            }
        }

        toggle.addEventListener("click", () => openNavigator(panel.hidden));
        mobileBadge.addEventListener("click", () => openNavigator(true));
        host.querySelector("[data-dev-nav-close]")?.addEventListener("click", () => openNavigator(false));
        screenSelect.addEventListener("change", syncTargetFields);
        host.querySelector("[data-dev-nav-open]").addEventListener("click", () => {
            directDevelopmentNavigate(
                screenSelect.value,
                Number(regionSelect.value),
                Number(islandSelect.value)
            );
        });

        const desktopQuery = root.matchMedia("(min-width: 1101px)");
        function syncDesktopMode() {
            panel.hidden = !desktopQuery.matches;
        }
        syncDesktopMode();
        if (typeof desktopQuery.addEventListener === "function") {
            desktopQuery.addEventListener("change", syncDesktopMode);
        } else {
            desktopQuery.addListener?.(syncDesktopMode);
        }
        syncTargetFields();

        const TOOL_LABELS = Object.freeze({
            depth: "CENA",
            ocean: "MAR",
            assets: "UP",
            ux: "UX",
            settings: "SET",
            audio: "SOM",
            nav: "NAV"
        });

        function onToolActivate(event) {
            if (event.detail?.tool !== "nav" && !panel.hidden && !desktopQuery.matches) {
                panel.hidden = true;
            }

            if (!root.matchMedia("(max-width: 620px)").matches) return;
            const toolLabel = TOOL_LABELS[event.detail?.tool] || null;
            mobileBadge.hidden = false;
            syncMobileGuide(toolLabel);
        }

        root.addEventListener("tq:dev-tool-activate", onToolActivate);

        activeDevelopmentNavigatorCleanup = () => {
            root.removeEventListener("tq:dev-tool-activate", onToolActivate);
            if (typeof desktopQuery.removeEventListener === "function") {
                desktopQuery.removeEventListener("change", syncDesktopMode);
            } else {
                desktopQuery.removeListener?.(syncDesktopMode);
            }
            host.remove();
            mobileBadge.remove();
        };
    }

    function resolveDevelopmentEditorContext(screenRoot, context, screenId) {
        const domRegionId = Number(screenRoot?.dataset?.regionId);
        const previewRegionId = Number(context?.previewRegionId);
        const activeRegionId = Number(context?.state?.learning?.activeSession?.regionId);
        const activeIslandId = Number(context?.state?.learning?.activeSession?.islandId);
        const currentRegionId = Number(context?.state?.campaign?.currentRegionId);
        const currentIslandId = Number(context?.state?.campaign?.currentIslandId);
        const regionScopedScreens = new Set([
            "islands",
            "travel",
            "challenge",
            "special-mission",
            "chest",
            "pet",
            "map-reward",
            "result",
            "ruby-shop"
        ]);

        let regionId = Number.isInteger(domRegionId) && domRegionId > 0
            ? domRegionId
            : null;

        if (!regionId && screenId === "islands" && Number.isInteger(previewRegionId) && previewRegionId > 0) {
            regionId = previewRegionId;
        }

        if (!regionId && regionScopedScreens.has(screenId) && Number.isInteger(activeRegionId) && activeRegionId > 0) {
            regionId = activeRegionId;
        }

        if (!regionId && regionScopedScreens.has(screenId) && Number.isInteger(currentRegionId) && currentRegionId > 0) {
            regionId = currentRegionId;
        }

        let islandId = null;
        if (regionScopedScreens.has(screenId) && Number.isInteger(activeIslandId) && activeIslandId > 0) {
            islandId = activeIslandId;
        } else if (regionScopedScreens.has(screenId) && Number.isInteger(currentIslandId) && currentIslandId > 0) {
            islandId = currentIslandId;
        }

        const region = regionId
            ? (TQ.content.getWorldRegion?.(regionId)
                || TQ.content.regions?.find?.((item) => Number(item?.id) === regionId))
            : null;

        return {
            screenType: screenId,
            regionId,
            islandId,
            regionLabel: region?.label || null,
            regionPage: screenRoot?.dataset?.regionPage || null,
            developmentMode: Boolean(context?.developmentMode)
        };
    }

    function resolveDevelopmentStorageScope(editorScreenId, editorContext) {
        if (editorScreenId === "islands" && editorContext.regionId) {
            return `islands.region-${editorContext.regionId}`;
        }
        if (
            editorScreenId === "challenge"
            && editorContext.regionId
            && editorContext.islandId
        ) {
            return `challenge.region-${editorContext.regionId}.island-${editorContext.islandId}`;
        }
        return editorScreenId;
    }

    function resolveDevelopmentEffectScope(editorScreenId, editorStorageScope, renderState) {
        if (editorScreenId !== "home") return editorStorageScope;
        const rawBackgroundId = String(renderState?.ui?.homeBackgroundId || "default")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "default";
        const backgroundId = TQ.content?.screenComposition?.resolveHomeBackgroundGroupId?.(
            rawBackgroundId
        ) || rawBackgroundId;
        return `${editorStorageScope}.background-${backgroundId}`;
    }

    async function renderWithDevelopmentTools(renderScreen, context, screenId, renderToken) {
        activeDevelopmentNavigatorCleanup?.();
        activeDevelopmentNavigatorCleanup = null;
        activeOceanController?.destroy?.();
        activeOceanController = null;
        activeDepthController?.destroy?.();
        activeDepthController = null;
        activeAudioController?.destroy?.();
        activeAudioController = null;
        activeCompositionController?.destroy?.();
        activeCompositionController = null;

        await screens.render(renderScreen, context);
        if (renderToken !== appRenderToken) return;

        const screenRoot = appRoot.firstElementChild || appRoot;
        const emptySurfaceActive = screenRoot.dataset.tqEmptySurface === "true";
        document.body.classList.toggle("tq-empty-surface-active", emptySurfaceActive);
        appRoot.classList.toggle("tq-empty-surface-active", emptySurfaceActive);
        appRoot.parentElement?.classList.toggle("tq-empty-surface-active", emptySurfaceActive);

        const editorScreenId = screenRoot.dataset.tqDevScreenId || screenId;
        const editorContext = resolveDevelopmentEditorContext(screenRoot, context, screenId);
        const editorStorageScope = resolveDevelopmentStorageScope(editorScreenId, editorContext);
        const activeRenderState = context?.state || (developmentMode && developmentState ? developmentState : state);
        const editorEffectScope = resolveDevelopmentEffectScope(
            editorScreenId,
            editorStorageScope,
            activeRenderState
        );
        const compositionRegistry = TQ.content?.screenComposition || null;
        const activeHomeBackgroundId = editorScreenId === "home"
            ? compositionRegistry?.resolveHomeBackgroundGroupId?.(
                activeRenderState?.ui?.homeBackgroundId || "default"
            ) || "default"
            : null;
        const activeHomeBackgroundGroup = activeHomeBackgroundId
            ? compositionRegistry?.HOME_BACKGROUND_GROUP_CATALOG?.[activeHomeBackgroundId] || null
            : null;
        const audioCatalogUrl = activeHomeBackgroundGroup?.manifest || null;
        const audioCatalog = activeHomeBackgroundGroup?.audio || [];
        const compositionScreenType = compositionRegistry?.resolveScreenType?.(editorScreenId) || null;
        const screenAllowsFx = (fxId) =>
            !compositionScreenType || compositionRegistry.screenAllowsFx(compositionScreenType, fxId);
        const screenHasSemanticType = (semanticType) => {
            if (!compositionScreenType) return false;
            return Boolean(
                screenRoot.querySelector(
                    '[data-tq-semantic-type="' + CSS.escape(String(semanticType)) + '"]' +
                    ':not([data-tq-slot-empty="true"])'
                )
            );
        };

        activeCompositionController = TQ.core?.screenCompositionRuntime?.mount?.({
            screenRoot,
            screenId: editorScreenId,
            scopeId: editorStorageScope,
            regionId: editorContext.regionId,
            state: activeRenderState
        }) || null;

        if (TQ.content.development?.shortcutsEnabled) {
            await TQ.dev?.assetUploader?.restoreLocalLayers?.({
                screenId: editorStorageScope,
                compositionScreenId: editorScreenId,
                compositionVariantId: activeHomeBackgroundId,
                screenRoot
            });
            activeCompositionController?.refresh?.();
        }

        if (renderToken !== appRenderToken) return;

        if (screenAllowsFx("ocean")) {
            activeOceanController = TQ.core?.oceanScene?.mount?.({
                screenRoot,
                scopeId: editorEffectScope,
                regionId: editorContext.regionId
            }) || null;
        }

        if (screenAllowsFx("depth") || screenAllowsFx("ship-rock")) {
            activeDepthController = TQ.core?.depthScene?.mount?.({
                screenRoot,
                scopeId: editorEffectScope,
                screenId: editorScreenId,
                regionId: editorContext.regionId
            }) || null;
        }

        activeAudioController = TQ.core?.audioScene?.mount?.({
            scopeId: editorEffectScope,
            screenId: editorScreenId,
            regionId: editorContext.regionId
        }) || null;

        if (!TQ.content.development?.shortcutsEnabled) return;
        TQ.dev?.sceneEditor?.mount(appRoot, {
            screenId: editorScreenId,
            storageScopeId: editorStorageScope,
            effectsScopeId: editorEffectScope,
            editorContext: {
                ...editorContext,
                homeBackgroundId: activeHomeBackgroundId
            },
            screenRoot
        });
        if (screenAllowsFx("ocean")) {
            TQ.dev?.oceanEditor?.mount?.({
                screenRoot,
                scopeId: editorEffectScope,
                regionId: editorContext.regionId,
                controller: activeOceanController,
                showShipWake: screenHasSemanticType("ship")
            });
        } else {
            document.querySelector(".tq-ocean-dev")?.remove();
        }

        if (screenAllowsFx("depth") || screenAllowsFx("ship-rock")) {
            TQ.dev?.depthEditor?.mount?.({
                screenRoot,
                scopeId: editorEffectScope,
                screenId: editorScreenId,
                regionId: editorContext.regionId,
                controller: activeDepthController
            });
        } else {
            document.querySelector(".tq-depth-dev")?.remove();
        }

        TQ.dev?.audioEditor?.mount?.({
            screenRoot,
            scopeId: editorEffectScope,
            screenId: editorScreenId,
            regionId: editorContext.regionId,
            controller: activeAudioController,
            catalog: audioCatalog,
            catalogUrl: audioCatalogUrl
        });

        TQ.dev?.settingsPanel?.mount({
            getState: () => state,
            onCommit: commitSettingsState,
            onOpenRegion: openSettingsRegion,
            onOpenIsland: openSettingsIsland
        });
        TQ.dev?.regionBuilder?.mount({
            onPreview: openRegionBuilderPreview
        });
        TQ.dev?.assetUploader?.mount({
            repository: "juliano-souza-dev/tabuada-quest-2",
            branch: "develop",
            rootPath: "web/assets",
            appRoot,
            screenRoot,
            screenId: editorStorageScope,
            compositionScreenId: editorScreenId,
            compositionVariantId: activeHomeBackgroundId,
            effectsScopeId: editorEffectScope
        });
        mountDevelopmentContextNavigator({
            screenId: editorScreenId,
            editorContext,
            storageScopeId: editorStorageScope,
            homeBackgroundId: activeHomeBackgroundId
        });
        mountDevelopmentExit();
    }

    async function render() {
        const renderToken = ++appRenderToken;
        const renderState = developmentMode && developmentState
            ? developmentState
            : state;
        const status = syncStatus();

        if (status.native && !status.authenticated) {
            await renderWithDevelopmentTools(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: authBusy,
                restoring: false,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            }, "auth", renderToken);
            return;
        }

        if (status.native && (authRestorePending || authRestoreRequired)) {
            await renderWithDevelopmentTools(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: false,
                restoring: authRestorePending,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            }, "auth-restore", renderToken);
            return;
        }

        if (!renderState.player.profileCreated) {
            await renderWithDevelopmentTools(TQ.screens.profileSetup.renderProfileScreen, {
                state: renderState,
                status,
                onStateChange: save
            }, "profile-setup", renderToken);
            return;
        }

        if (regionBuilderPreviewActive && TQ.screens.developmentRegionBuilder) {
            await renderWithDevelopmentTools(
                TQ.screens.developmentRegionBuilder.renderDevelopmentRegionBuilderScreen,
                {
                    state: renderState,
                    onExitRegionBuilder: closeRegionBuilderPreview
                },
                "region-builder-preview",
                renderToken
            );
            return;
        }

        const renderers = {
            home: TQ.screens.home.renderHomeScreen,
            tavern: TQ.screens.tavern.renderTavernScreen,
            crew: TQ.screens.crew.renderCrewScreen,
            collectibles: TQ.screens.collectibles.renderCollectiblesScreen,
            shop: TQ.screens.shop.renderShopScreen,
            items: TQ.screens.items.renderItemsScreen,
            "ruby-shop": TQ.screens.rubyShop.renderRubyShopScreen,
            "world-map": TQ.screens.worldMap.renderWorldMapScreen,
            regions: TQ.screens.worldMap.renderWorldMapScreen,
            "development-regions": TQ.screens.developmentRegions.renderDevelopmentRegionsScreen,
            islands: TQ.screens.islands.renderIslandsScreen,
            travel: TQ.screens.travel.renderIslandTravelScreen,
            challenge: TQ.screens.challenge.renderChallengeScreen,
            "special-mission": TQ.screens.specialMission.renderSpecialMissionScreen,
            chest: TQ.screens.chest.renderChestScreen,
            pet: TQ.screens.pet.renderPetScreen,
            "map-reward": TQ.screens.mapReward.renderMapRewardScreen,
            result: TQ.screens.result.renderResultScreen
        };

        const requestedScreenId = renderState.ui.lastScreen || "home";
        const hasRequestedRenderer = Boolean(renderers[requestedScreenId]);
        const screenId = hasRequestedRenderer ? requestedScreenId : "home";
        const renderer = renderers[screenId];

        await renderWithDevelopmentTools(renderer, {
            state: renderState,
            onStateChange: save,
            onNavigate: navigate,
            onExitSession: resetDevelopmentSession,
            rewardReturnScreen,
            worldMapReturnScreen,
            previewRegionId: developmentMode ? developmentRegionId : worldMapPreviewRegionId,
            onPreviewRegionChange: developmentMode ? setDevelopmentRegion : setWorldMapPreviewRegion,
            developmentMode,
            onDevelopmentIslandOpen: openDevelopmentIsland
        }, screenId, renderToken);
    }

    root.addEventListener("tq:dev-remount-request", () => {
        render();
    });

    render();
})(globalThis);
