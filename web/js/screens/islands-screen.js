(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const REGION_LAYOUT = Object.freeze({
        viewport: Object.freeze({ width: 941, height: 1672 }),
        visibleIslandIds: Object.freeze([1, 2, 3, 4, 5]),
        back: Object.freeze({ x: 58, y: 18, width: 150, height: 150 }),
        worldMap: Object.freeze({ x: 98, y: 1405, width: 200, height: 200 }),
        islands: Object.freeze({
            1: Object.freeze({
                art: Object.freeze({ x: 0, y: 320, width: 380, height: 380 }),
                status: Object.freeze({ x: 88, y: 626, width: 204, height: 42, fontSize: 28 }),
                hitbox: Object.freeze({ x: 14, y: 334, width: 352, height: 352 })
            }),
            2: Object.freeze({
                art: Object.freeze({ x: 561, y: 360, width: 380, height: 380 }),
                status: Object.freeze({ x: 649, y: 666, width: 204, height: 42, fontSize: 28 }),
                hitbox: Object.freeze({ x: 575, y: 374, width: 352, height: 352 })
            }),
            3: Object.freeze({
                art: Object.freeze({ x: 270, y: 590, width: 400, height: 400 }),
                status: Object.freeze({ x: 362, y: 912, width: 216, height: 44, fontSize: 29 }),
                hitbox: Object.freeze({ x: 285, y: 605, width: 370, height: 370 })
            }),
            4: Object.freeze({
                art: Object.freeze({ x: 0, y: 915, width: 395, height: 395 }),
                status: Object.freeze({ x: 91, y: 1233, width: 213, height: 44, fontSize: 29 }),
                hitbox: Object.freeze({ x: 15, y: 930, width: 365, height: 365 })
            }),
            5: Object.freeze({
                art: Object.freeze({ x: 541, y: 1240, width: 400, height: 400 }),
                status: Object.freeze({ x: 633, y: 1562, width: 216, height: 44, fontSize: 29 }),
                hitbox: Object.freeze({ x: 556, y: 1255, width: 370, height: 370 })
            })
        })
    });

    const REGION_VISUAL_CONFIG = Object.freeze({
        1: Object.freeze({
            assetKey: "region1Modular",
            pages: Object.freeze([
                Object.freeze({
                    id: "corsario-1",
                    backgroundId: 1,
                    islandIds: Object.freeze([1, 2, 3, 4, 5]),
                    hideIslands: true,
                    unlockAfterCompleted: 0
                }),
                Object.freeze({
                    id: "corsario-2",
                    backgroundId: 2,
                    islandIds: Object.freeze([6, 7, 8, 9, 10]),
                    slotLayout: Object.freeze({
                        1: Object.freeze({
                            art: Object.freeze({ x: 72, y: 348, width: 340, height: 340 }),
                            status: Object.freeze({ x: 122, y: 620, width: 240, height: 48, fontSize: 27 }),
                            hitbox: Object.freeze({ x: 88, y: 364, width: 308, height: 308 })
                        }),
                        2: Object.freeze({
                            art: Object.freeze({ x: 641, y: 361, width: 300, height: 300 }),
                            status: Object.freeze({ x: 689, y: 603, width: 204, height: 42, fontSize: 28 }),
                            hitbox: Object.freeze({ x: 653, y: 373, width: 276, height: 276 })
                        }),
                        3: Object.freeze({
                            art: Object.freeze({ x: 267, y: 618, width: 400, height: 400 }),
                            status: Object.freeze({ x: 359, y: 940, width: 216, height: 44, fontSize: 29 }),
                            hitbox: Object.freeze({ x: 282, y: 633, width: 370, height: 370 })
                        }),
                        4: Object.freeze({
                            art: Object.freeze({ x: 0, y: 974, width: 386, height: 386 }),
                            status: Object.freeze({ x: 87, y: 1288, width: 213, height: 44, fontSize: 29 }),
                            hitbox: Object.freeze({ x: 10, y: 987, width: 366, height: 366 })
                        }),
                        5: Object.freeze({
                            art: Object.freeze({ x: 575, y: 1091, width: 400, height: 400 }),
                            status: Object.freeze({ x: 667, y: 1413, width: 216, height: 44, fontSize: 29 }),
                            hitbox: Object.freeze({ x: 590, y: 1106, width: 370, height: 370 })
                        })
                    }),
                    hideIslands: true,
                    unlockAfterCompleted: 5
                })
            ])
        })
    });

    function getRegionVisualConfig(regionId) {
        const normalizedRegionId = Number(regionId);
        const config = REGION_VISUAL_CONFIG[normalizedRegionId];
        const assets = config ? TQ.content?.assets?.[config.assetKey] : null;
        if (!config || !assets) return null;

        return Object.freeze({
            regionId: normalizedRegionId,
            assetKey: config.assetKey,
            assets,
            pages: config.pages || Object.freeze([
                Object.freeze({
                    id: `region-${normalizedRegionId}`,
                    backgroundId: 1,
                    islandIds: REGION_LAYOUT.visibleIslandIds,
                    unlockAfterCompleted: 0
                })
            ])
        });
    }

    function getRegionVisualPage(state, regionId) {
        const visual = getRegionVisualConfig(regionId);
        if (!visual) return null;

        const completed = Number(
            state?.campaign?.regionProgress?.[String(regionId)]?.islandsCompleted
        ) || 0;

        const page = visual.pages.reduce((selected, candidate) =>
            completed >= candidate.unlockAfterCompleted ? candidate : selected
        , visual.pages[0]);

        const background = visual.assets.backgrounds?.[page.backgroundId]
            || visual.assets.background;

        return Object.freeze({
            ...page,
            background,
            assets: visual.assets
        });
    }

    function rectStyle(rect) {
        return `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px`;
    }

    function statusStyle(rect) {
        return `${rectStyle(rect)};font-size:${rect.fontSize || 22}px;line-height:${rect.height}px`;
    }

    function computeRegionStageGeometry(viewportWidth, viewportHeight) {
        const width = Number(viewportWidth) || 0;
        const height = Number(viewportHeight) || 0;
        const scale = Math.max(
            width / REGION_LAYOUT.viewport.width,
            height / REGION_LAYOUT.viewport.height
        );
        const renderWidth = REGION_LAYOUT.viewport.width * scale;
        const renderHeight = REGION_LAYOUT.viewport.height * scale;

        return Object.freeze({
            scale,
            renderWidth,
            renderHeight,
            offsetX: (width - renderWidth) / 2,
            offsetY: (height - renderHeight) / 2
        });
    }

    function renderRewardLabels(regionId, islandId) {
        const rewards = TQ.content.getIslandRewards(regionId, islandId);
        if (!rewards.length) return "";

        return `<span class="island-reward-labels">${rewards.map((reward) => {
            if (reward.type === "map_fragment") return `🧩 Mapa ${reward.mapId}: peça ${reward.fragment}/4`;
            if (reward.type === "chest") return "🎁 Baú";
            if (reward.type === "pet") return "🐾 PET para salvar";
            return "";
        }).filter(Boolean).join(" • ")}</span>`;
    }

    function islandLabel(state, regionId, islandId) {
        const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
        if (status === "completed") return "CONCLUÍDA ✓";
        if (status === "available") return "JOGAR";
        return "BLOQUEADA";
    }

    function formatRegionStatus(status, isResume) {
        if (isResume) return "CONTINUAR";
        if (status === "completed") return "CONCLUÍDA ✓";
        if (status === "available") return "DESBLOQUEADA";
        return "BLOQUEADA";
    }

    function rewardLabel(rewards) {
        const reward = Array.isArray(rewards) ? rewards[0] : null;
        if (!reward) return "Sem recompensa definida";
        if (reward.type === "map_fragment") return `Fragmento ${reward.fragment} de 4 do Mapa ${reward.mapId}`;
        if (reward.type === "chest") return "Baú";
        if (reward.type === "pet") return "PET para salvar";
        return "Recompensa";
    }

    function getRegionIslandAsset(regionId, islandId, status) {
        const visual = getRegionVisualConfig(regionId);
        const entry = visual?.assets?.islands?.[islandId];
        if (!entry) return "";
        return status === "locked" ? entry.locked : entry.unlocked;
    }

    function createIslandEntryState(state, regionId, islandId) {
        const existingRegionState = TQ.domain.playerState.getRegionLearningState(state, regionId)
            || TQ.domain.gameplay.createRegionState(regionId);
        const session = TQ.domain.gameplay.createIslandSession(regionId, islandId);
        const prepared = TQ.domain.gameplay.prepareNextChallenge(session, existingRegionState);
        const hasTravelPlayed = TQ.domain.playerState.hasPlayedIslandTravel(state, regionId, islandId);

        return hasTravelPlayed
            ? TQ.domain.playerState.withGameplaySession(
                state,
                prepared.session,
                prepared.regionState
            )
            : TQ.domain.playerState.withIslandTravelSession(
                state,
                prepared.session,
                prepared.regionState
            );
    }

    function getDisplayedRegionId(state, previewRegionId) {
        const preview = Number(previewRegionId);
        return Number.isInteger(preview) && preview >= 1 && preview <= 22
            ? preview
            : state.campaign.currentRegionId;
    }

    function isWorldMapPreview(previewRegionId) {
        const preview = Number(previewRegionId);
        return Number.isInteger(preview) && preview >= 1 && preview <= 22;
    }

    function renderRegionMap({ state, onStateChange, onNavigate, previewRegionId }) {
        const regionId = getDisplayedRegionId(state, previewRegionId);
        const previewMode = isWorldMapPreview(previewRegionId);
        const visual = getRegionVisualConfig(regionId);
        const visualPage = getRegionVisualPage(state, regionId);
        if (!visual || !visualPage) {
            return renderTextIslandsScreen({ state, onStateChange, onNavigate });
        }

        const region = previewMode
            ? TQ.content.getWorldRegion(regionId)
            : TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;
        const screen = document.createElement("section");
        screen.className = "region-islands-map-screen";
        screen.dataset.regionId = String(regionId);
        screen.dataset.regionPage = visualPage.id;
        screen.setAttribute("aria-label", `Ilhas da Região ${region ? region.label : regionId}`);

        const islandsMarkup = visualPage.hideIslands ? "" : visualPage.islandIds.map((islandId, slotIndex) => {
            const slotId = REGION_LAYOUT.visibleIslandIds[slotIndex];
            const layout = visualPage.slotLayout?.[slotId] || REGION_LAYOUT.islands[slotId];
            const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            const identity = TQ.content.getIslandIdentity(regionId, islandId);
            const rewards = TQ.content.getIslandRewards(regionId, islandId);
            const isResume = Boolean(
                active
                && active.regionId === regionId
                && active.islandId === islandId
            );
            const statusText = formatRegionStatus(status, isResume);
            const rewardText = rewardLabel(rewards);
            const islandAsset = getRegionIslandAsset(regionId, islandId, status);
            const unlockedAsset = visual.assets.islands[islandId].unlocked;

            return `
                <div class="region-island-overlay is-${status}${isResume ? " is-resume" : ""}" data-island-ui="${islandId}">
                    <div class="region-island-art-shell" style="${rectStyle(layout.art)}">
                        <img class="region-island-art"
                            src="${islandAsset}"
                            data-fallback-src="${status === "locked" ? unlockedAsset : ""}"
                            alt=""
                            aria-hidden="true">
                        <span class="region-fallback-lock" aria-hidden="true">🔒</span>
                    </div>

                    <button class="region-island-hitbox"
                        type="button"
                        style="${rectStyle(layout.hitbox)}"
                        data-island-id="${islandId}"
                        ${status === "locked" ? 'aria-disabled="true"' : ""}
                        aria-label="${identity ? identity.label : `Ilha ${islandId}`}. ${statusText}. Recompensa: ${rewardText}.">
                    </button>
                </div>
            `;
        }).join("");

        screen.innerHTML = `
            <div class="region-islands-canonical-stage">
                <img class="region-islands-background"
                    src="${visualPage.background}"
                    alt=""
                    aria-hidden="true">

                <button class="region-back-hitbox"
                    type="button"
                    style="${rectStyle(REGION_LAYOUT.back)}"
                    data-action="back-regions"
                    aria-label="Voltar para Regiões">
                </button>

                ${islandsMarkup}

                <button class="global-world-map-button"
                    type="button"
                    style="${rectStyle(REGION_LAYOUT.worldMap)}"
                    data-action="open-world-map"
                    aria-label="Abrir Mapa mundo">
                    <img class="global-world-map-asset"
                        src="${TQ.content.assets.global.worldMap}"
                        alt=""
                        aria-hidden="true">
                </button>
            </div>
        `;

        const stage = screen.querySelector(".region-islands-canonical-stage");

        screen.addEventListener("error", (event) => {
            const image = event.target.closest?.(".region-island-art");
            if (!image || !image.dataset.fallbackSrc) return;

            const fallback = image.dataset.fallbackSrc;
            image.dataset.fallbackSrc = "";
            image.src = fallback;
            image.closest(".region-island-overlay")?.classList.add("is-fallback-locked");
        }, true);

        function applyStageGeometry() {
            const geometry = computeRegionStageGeometry(screen.clientWidth, screen.clientHeight);
            stage.style.left = `${geometry.offsetX}px`;
            stage.style.top = `${geometry.offsetY}px`;
            stage.style.transform = `scale(${geometry.scale})`;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate(previewMode ? "world-map" : "regions");
                return;
            }

            if (event.target.closest('[data-action="open-world-map"]')) {
                TQ.core.worldMap.open({ onNavigate });
                return;
            }

            if (visualPage.hideIslands) return;

            const islandButton = event.target.closest("[data-island-id]");
            if (!islandButton) return;

            const islandId = Number(islandButton.dataset.islandId);
            if (previewMode) return;
            const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            if (status === "locked") return;

            if (active && active.regionId === regionId && active.islandId === islandId) {
                onNavigate("challenge");
                return;
            }

            onStateChange(createIslandEntryState(state, regionId, islandId));
        });

        if (typeof root.ResizeObserver === "function") {
            const observer = new root.ResizeObserver(() => {
                if (!screen.isConnected) {
                    observer.disconnect();
                    return;
                }
                applyStageGeometry();
            });
            observer.observe(screen);
        } else {
            root.addEventListener("resize", applyStageGeometry, { passive: true, once: true });
        }

        root.requestAnimationFrame
            ? root.requestAnimationFrame(applyStageGeometry)
            : setTimeout(applyStageGeometry, 0);

        return screen;
    }

    function renderTextIslandsScreen({ state, onStateChange, onNavigate, previewRegionId }) {
        const regionId = getDisplayedRegionId(state, previewRegionId);
        const previewMode = isWorldMapPreview(previewRegionId);
        const region = previewMode
            ? TQ.content.getWorldRegion(regionId)
            : TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;
        const regionIdentity = previewMode ? null : TQ.content.getRegionIdentity(regionId);
        const textMaps = TQ.content.getRegionTextMaps(regionId);

        const screen = document.createElement("section");
        screen.className = "slice-screen islands-text-screen";
        screen.setAttribute("aria-label", "Ilhas da Região");

        screen.innerHTML = `
            <header class="slice-header">
                <button type="button" data-action="back-regions">← Regiões</button>
                <div>
                    <small>REGIÃO ${regionId}</small>
                    <h1>${region ? region.label : "REGIÃO"}</h1>
                </div>
            </header>

            <main class="slice-content">
                <p class="slice-intro">
                    ${previewMode ? "Prévia de desenvolvimento • 5 Ilhas" : (regionIdentity ? regionIdentity.tagline : "Escolha uma Ilha para começar.")}
                </p>
                <div class="island-text-list">
                    ${Array.from({ length: previewMode ? 5 : 10 }, (_, index) => {
                        const islandId = index + 1;
                        const status = previewMode
                            ? "preview"
                            : TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
                        const isResume = !previewMode && active
                            && active.regionId === regionId
                            && active.islandId === islandId;
                        const actionText = previewMode
                            ? "PRÉVIA"
                            : (isResume ? "CONTINUAR" : islandLabel(state, regionId, islandId));
                        const identity = TQ.content.getIslandIdentity(regionId, islandId);
                        return `
                            <button type="button"
                                class="slice-choice island-text-button is-${status}"
                                data-island-id="${islandId}"
                                ${!previewMode && status === "locked" ? "disabled" : ""}>
                                <span class="island-copy">
                                    <span class="island-number">Ilha ${islandId}</span>
                                    <span class="island-name">${identity ? identity.label : `Ilha ${islandId}`}</span>
                                    <span class="island-challenge-type">Desafio misto</span>
                                    ${renderRewardLabels(regionId, islandId)}
                                </span>
                                <strong>${actionText}</strong>
                            </button>
                        `;
                    }).join("")}
                </div>
                ${previewMode && textMaps.length ? `
                    <section class="region-text-map-preview" aria-label="Mapas textuais da Região">
                        <h2>Mapas desta Região</h2>
                        <div class="region-text-map-list">
                            ${textMaps.map((map) => `<span>${map.label}</span>`).join("")}
                        </div>
                    </section>
                ` : ""}
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate(previewMode ? "world-map" : "regions");
                return;
            }

            const islandButton = event.target.closest("[data-island-id]");
            if (!islandButton) return;

            const islandId = Number(islandButton.dataset.islandId);
            const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            if (status === "locked") return;

            if (active && active.regionId === regionId && active.islandId === islandId) {
                onNavigate("challenge");
                return;
            }

            onStateChange(createIslandEntryState(state, regionId, islandId));
        });

        return screen;
    }

    function renderIslandsScreen(context) {
        const regionId = getDisplayedRegionId(context.state, context.previewRegionId);
        return getRegionVisualConfig(regionId)
            ? renderRegionMap(context)
            : renderTextIslandsScreen(context);
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.islands = Object.freeze({
        renderIslandsScreen,
        renderRegionMap,
        renderTextIslandsScreen,
        islandLabel,
        renderRewardLabels,
        formatRegionStatus,
        rewardLabel,
        getRegionVisualConfig,
        getRegionVisualPage,
        getRegionIslandAsset,
        getDisplayedRegionId,
        isWorldMapPreview,
        createIslandEntryState,
        REGION_LAYOUT,
        REGION_VISUAL_CONFIG,
        computeRegionStageGeometry
    });
})(globalThis);
