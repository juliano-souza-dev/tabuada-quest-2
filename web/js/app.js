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
    let rewardReturnScreen = null;
    let worldMapReturnScreen = "home";
    let authBusy = false;
    let authRestorePending = false;
    let authRestoreRequired = false;
    let authErrorCode = "";
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
        rewardReturnScreen = null;
        worldMapReturnScreen = "home";
        authBusy = false;
        authRestorePending = false;
        authRestoreRequired = false;
        authErrorCode = "";
        render();
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

    function mountParallaxPrototype() {
        document.querySelector(".tq-parallax-dev")?.remove();
        const stage = appRoot.querySelector(".tq-canonical-stage");
        if (!stage) return;
        const assets = [...appRoot.querySelectorAll("[data-tq-asset-id]")];
        if (!assets.length) return;

        const host = document.createElement("aside");
        host.className = "tq-parallax-dev";
        host.innerHTML = `
            <button type="button" class="tq-parallax-dev-toggle">FX</button>
            <section class="tq-parallax-dev-panel" hidden>
                <strong>Parallax · protótipo</strong>
                <select data-fx-asset>${assets.map((asset) => `<option value="${asset.dataset.tqAssetId}">${asset.dataset.tqAssetLabel || asset.dataset.tqAssetId} · ${asset.dataset.tqAssetRole}</option>`).join("")}</select>
                <button type="button" data-fx-select>Desenhar área</button>
                <label>Direção <select data-fx-axis><option value="x">Horizontal</option><option value="y">Vertical</option></select></label>
                <label>Distância <input data-fx-distance type="range" min="1" max="60" value="14"></label>
                <label>Velocidade <input data-fx-duration type="range" min="1" max="12" step=".25" value="5"></label>
                <div class="tq-parallax-dev-actions"><button type="button" data-fx-play>▶ Aplicar</button><button type="button" data-fx-clear>Limpar</button></div>
                <small>Selecione um asset mapeado, desenhe a região e ajuste em tempo real.</small>
            </section>`;
        document.body.appendChild(host);
        const panel = host.querySelector(".tq-parallax-dev-panel");
        let draft = null;
        let region = null;
        let animation = null;

        const selectedAsset = () => appRoot.querySelector(`[data-tq-asset-id="${host.querySelector("[data-fx-asset]").value}"]`);
        const clearRegion = () => {
            animation?.cancel(); animation = null;
            region?.remove(); region = null;
            draft?.remove(); draft = null;
        };
        const apply = () => {
            if (!region) return;
            animation?.cancel();
            const axis = host.querySelector("[data-fx-axis]").value;
            const distance = Number(host.querySelector("[data-fx-distance]").value);
            const duration = Number(host.querySelector("[data-fx-duration]").value) * 1000;
            animation = region.querySelector("img").animate(
                axis === "x" ? [{ transform: `translateX(-${distance}px) scale(1.08)` }, { transform: `translateX(${distance}px) scale(1.08)` }]
                             : [{ transform: `translateY(-${distance}px) scale(1.08)` }, { transform: `translateY(${distance}px) scale(1.08)` }],
                { duration, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }
            );
        };

        host.querySelector(".tq-parallax-dev-toggle").onclick = () => panel.hidden = !panel.hidden;
        host.querySelector("[data-fx-clear]").onclick = clearRegion;
        host.querySelector("[data-fx-play]").onclick = apply;
        host.querySelectorAll("input, select[data-fx-axis]").forEach((control) => control.addEventListener("input", apply));
        host.querySelector("[data-fx-select]").onclick = () => {
            clearRegion();
            const asset = selectedAsset();
            if (!(asset instanceof HTMLImageElement)) return;
            const assetRect = asset.getBoundingClientRect();
            let start = null;
            const down = (event) => {
                if (event.clientX < assetRect.left || event.clientX > assetRect.right || event.clientY < assetRect.top || event.clientY > assetRect.bottom) return;
                start = { x: event.clientX, y: event.clientY };
                draft = document.createElement("div");
                draft.className = "tq-parallax-draft";
                document.body.appendChild(draft);
                event.preventDefault();
            };
            const move = (event) => {
                if (!start || !draft) return;
                const x = Math.max(assetRect.left, Math.min(event.clientX, assetRect.right));
                const y = Math.max(assetRect.top, Math.min(event.clientY, assetRect.bottom));
                const left = Math.min(start.x, x), top = Math.min(start.y, y);
                draft.style.cssText = `left:${left}px;top:${top}px;width:${Math.abs(x-start.x)}px;height:${Math.abs(y-start.y)}px`;
            };
            const up = (event) => {
                if (!start || !draft) return cleanup();
                const r = draft.getBoundingClientRect();
                if (r.width > 8 && r.height > 8) {
                    region = document.createElement("div");
                    region.className = "tq-parallax-region";
                    const stageRect = stage.getBoundingClientRect();
                    region.style.left = ((r.left-stageRect.left)/stageRect.width*100)+"%";
                    region.style.top = ((r.top-stageRect.top)/stageRect.height*100)+"%";
                    region.style.width = (r.width/stageRect.width*100)+"%";
                    region.style.height = (r.height/stageRect.height*100)+"%";
                    const clone = asset.cloneNode(false);
                    clone.removeAttribute("data-tq-asset-id");
                    clone.style.position="absolute";
                    clone.style.width=(assetRect.width/r.width*100)+"%";
                    clone.style.height=(assetRect.height/r.height*100)+"%";
                    clone.style.left=(-((r.left-assetRect.left)/r.width)*100)+"%";
                    clone.style.top=(-((r.top-assetRect.top)/r.height)*100)+"%";
                    clone.style.maxWidth="none";
                    clone.style.pointerEvents="none";
                    region.appendChild(clone);
                    stage.appendChild(region);
                    apply();
                }
                draft.remove(); draft=null; start=null; cleanup();
            };
            const cleanup = () => { root.removeEventListener("pointerdown",down,true);root.removeEventListener("pointermove",move,true);root.removeEventListener("pointerup",up,true); };
            root.addEventListener("pointerdown",down,true);root.addEventListener("pointermove",move,true);root.addEventListener("pointerup",up,true);
        };
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

    function render() {
        const renderState = developmentMode && developmentState
            ? developmentState
            : state;
        const status = syncStatus();

        if (status.native && !status.authenticated) {
            screens.render(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: authBusy,
                restoring: false,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            });
            return;
        }

        if (status.native && (authRestorePending || authRestoreRequired)) {
            screens.render(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: false,
                restoring: authRestorePending,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            });
            return;
        }

        if (!renderState.player.profileCreated) {
            screens.render(TQ.screens.profileSetup.renderProfileScreen, {
                state: renderState,
                status,
                onStateChange: save
            });
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
        const renderer = renderers[renderState.ui.lastScreen] || renderers.home;

        screens.render(renderer, {
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
        });
        if (TQ.content.development?.shortcutsEnabled) mountParallaxPrototype();
    }

    render();
})(globalThis);
