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

    const RUBY_SHOP_SHIP_LAYOUT = Object.freeze({
        width: 220,
        height: 220,
        clearance: 18,
        edgeInset: 24,
        headerInset: 280,
        gridStep: 8,
        preferredCenter: Object.freeze({ x: 798, y: 942 })
    });

    function rectanglesOverlap(a, b, clearance = 0) {
        if (!a || !b) return false;
        return !(
            a.x + a.width + clearance <= b.x
            || b.x + b.width + clearance <= a.x
            || a.y + a.height + clearance <= b.y
            || b.y + b.height + clearance <= a.y
        );
    }

    function getRegionOccupiedRects(visualPage) {
        if (!visualPage) return Object.freeze([]);

        const islandRects = (visualPage.islandIds || REGION_LAYOUT.visibleIslandIds)
            .map((islandId, slotIndex) => {
                const slotId = REGION_LAYOUT.visibleIslandIds[slotIndex] || islandId;
                const layout = visualPage.slotLayout?.[slotId] || REGION_LAYOUT.islands[slotId];
                return layout?.art || layout?.hitbox || null;
            })
            .filter(Boolean);

        return Object.freeze([
            REGION_LAYOUT.back,
            visualPage.worldMapLayout || REGION_LAYOUT.worldMap,
            ...islandRects
        ]);
    }

    function resolveRubyShopShipRect(visualPage) {
        const layout = RUBY_SHOP_SHIP_LAYOUT;
        const occupied = getRegionOccupiedRects(visualPage);
        const maxX = REGION_LAYOUT.viewport.width - layout.edgeInset - layout.width;
        const maxY = REGION_LAYOUT.viewport.height - layout.edgeInset - layout.height;
        let bestRect = null;
        let bestScore = Number.POSITIVE_INFINITY;

        for (let y = layout.headerInset; y <= maxY; y += layout.gridStep) {
            for (let x = layout.edgeInset; x <= maxX; x += layout.gridStep) {
                const candidate = { x, y, width: layout.width, height: layout.height };
                const collides = occupied.some((rect) => rectanglesOverlap(
                    candidate,
                    rect,
                    layout.clearance
                ));
                if (collides) continue;

                const centerX = x + (layout.width / 2);
                const centerY = y + (layout.height / 2);
                const dx = centerX - layout.preferredCenter.x;
                const dy = centerY - layout.preferredCenter.y;
                const score = (dx * dx) + (dy * dy);

                if (score < bestScore) {
                    bestScore = score;
                    bestRect = candidate;
                }
            }
        }

        return bestRect ? Object.freeze(bestRect) : null;
    }

    const REGION_VISUAL_CONFIG = Object.freeze({
        1: Object.freeze({
            assetKey: "region1Modular",
            id: "corsario",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5])
        }),
        2: Object.freeze({
            assetKey: "region2Modular",
            id: "birades",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5]),
            worldMapLayout: Object.freeze({ x: 760, y: 18, width: 160, height: 140 }),
            worldMapEmbedded: true,
            slotLayout: Object.freeze({
                1: Object.freeze({
                    art: Object.freeze({ x: 125, y: 365, width: 350, height: 350 }),
                    hitbox: Object.freeze({ x: 140, y: 380, width: 320, height: 320 })
                }),
                2: Object.freeze({
                    art: Object.freeze({ x: 500, y: 525, width: 350, height: 350 }),
                    hitbox: Object.freeze({ x: 515, y: 540, width: 320, height: 320 })
                }),
                3: Object.freeze({
                    art: Object.freeze({ x: 45, y: 725, width: 360, height: 360 }),
                    hitbox: Object.freeze({ x: 60, y: 740, width: 330, height: 330 })
                }),
                4: Object.freeze({
                    art: Object.freeze({ x: 510, y: 950, width: 360, height: 360 }),
                    hitbox: Object.freeze({ x: 525, y: 965, width: 330, height: 330 })
                }),
                5: Object.freeze({
                    art: Object.freeze({ x: 205, y: 1260, width: 360, height: 360 }),
                    hitbox: Object.freeze({ x: 220, y: 1275, width: 330, height: 330 })
                })
            })
        }),
        3: Object.freeze({
            assetKey: "region3Modular",
            id: "zona-ouro",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5]),
            worldMapLayout: Object.freeze({ x: 717, y: 1435, width: 200, height: 200 }),
            slotLayout: Object.freeze({
                1: Object.freeze({
                    art: Object.freeze({ x: 164, y: 449, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 179, y: 464, width: 310, height: 310 })
                }),
                2: Object.freeze({
                    art: Object.freeze({ x: 466, y: 595, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 481, y: 610, width: 310, height: 310 })
                }),
                3: Object.freeze({
                    art: Object.freeze({ x: 164, y: 797, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 179, y: 812, width: 310, height: 310 })
                }),
                4: Object.freeze({
                    art: Object.freeze({ x: 497, y: 998, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 512, y: 1013, width: 310, height: 310 })
                }),
                5: Object.freeze({
                    art: Object.freeze({ x: 298, y: 1226, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 313, y: 1241, width: 310, height: 310 })
                })
            })
        }),
        4: Object.freeze({
            assetKey: "region4Modular",
            id: "terras-gelidas",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5]),
            worldMapLayout: Object.freeze({ x: 717, y: 1448, width: 200, height: 200 }),
            slotLayout: Object.freeze({
                1: Object.freeze({
                    art: Object.freeze({ x: 535, y: 591, width: 470, height: 470 }),
                    hitbox: Object.freeze({ x: 558, y: 614, width: 424, height: 424 })
                }),
                2: Object.freeze({
                    art: Object.freeze({ x: 140, y: 747, width: 470, height: 470 }),
                    hitbox: Object.freeze({ x: 163, y: 770, width: 424, height: 424 })
                }),
                3: Object.freeze({
                    art: Object.freeze({ x: 535, y: 925, width: 470, height: 470 }),
                    hitbox: Object.freeze({ x: 558, y: 948, width: 424, height: 424 })
                }),
                4: Object.freeze({
                    art: Object.freeze({ x: 140, y: 1078, width: 470, height: 470 }),
                    hitbox: Object.freeze({ x: 163, y: 1101, width: 424, height: 424 })
                }),
                5: Object.freeze({
                    art: Object.freeze({ x: -48, y: 1304, width: 470, height: 423 }),
                    hitbox: Object.freeze({ x: -25, y: 1327, width: 424, height: 377 })
                })
            }),
            hideIslands: false,
            developmentStatus: "preview"
        }),
        13: Object.freeze({
            assetKey: "region13Modular",
            id: "obsidiana",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5]),
            slotLayout: Object.freeze({
                1: Object.freeze({
                    art: Object.freeze({ x: 80, y: 539, width: 330, height: 330 }),
                    hitbox: Object.freeze({ x: 95, y: 554, width: 300, height: 300 })
                }),
                2: Object.freeze({
                    art: Object.freeze({ x: 566, y: 541, width: 330, height: 330 }),
                    hitbox: Object.freeze({ x: 581, y: 556, width: 300, height: 300 })
                }),
                3: Object.freeze({
                    art: Object.freeze({ x: 286, y: 803, width: 360, height: 360 }),
                    hitbox: Object.freeze({ x: 301, y: 818, width: 330, height: 330 })
                }),
                4: Object.freeze({
                    art: Object.freeze({ x: 50, y: 1092, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 65, y: 1107, width: 310, height: 310 })
                }),
                5: Object.freeze({
                    art: Object.freeze({ x: 522, y: 1130, width: 340, height: 340 }),
                    hitbox: Object.freeze({ x: 537, y: 1145, width: 310, height: 310 })
                })
            })
        }),
        14: Object.freeze({
            assetKey: "region14Modular",
            id: "zona-rubi",
            backgroundId: 1,
            islandIds: Object.freeze([1, 2, 3, 4, 5])
        })
    });

    function getRegionVisualConfig(regionId) {
        const normalizedRegionId = Number(regionId);
        const config = REGION_VISUAL_CONFIG[normalizedRegionId];
        const assets = config ? TQ.content?.assets?.[config.assetKey] : null;
        if (!config || !assets) return null;

        return Object.freeze({
            regionId: normalizedRegionId,
            ...config,
            assets
        });
    }

    function getImplementedRegionIds() {
        return Object.freeze(
            Object.keys(REGION_VISUAL_CONFIG)
                .map(Number)
                .filter((regionId) => Boolean(getRegionVisualConfig(regionId)))
                .sort((a, b) => a - b)
        );
    }

    function getDevelopmentRegionStatus(regionId) {
        const normalizedRegionId = Number(regionId);
        const visual = getRegionVisualConfig(normalizedRegionId);
        if (visual?.developmentStatus) return visual.developmentStatus;
        return getImplementedRegionIds().includes(normalizedRegionId)
            ? "completed"
            : "preview";
    }

    function getRegionVisualPage(state, regionId) {
        const visual = getRegionVisualConfig(regionId);
        if (!visual) return null;
        const background = visual.assets.backgrounds?.[visual.backgroundId] || visual.assets.background;
        return Object.freeze({
            id: visual.id || `region-${regionId}`,
            backgroundId: visual.backgroundId || 1,
            islandIds: visual.islandIds || REGION_LAYOUT.visibleIslandIds,
            slotLayout: visual.slotLayout,
            worldMapLayout: visual.worldMapLayout,
            worldMapEmbedded: Boolean(visual.worldMapEmbedded),
            hideBack: Boolean(visual.hideBack),
            hideIslands: Boolean(visual.hideIslands),
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
        return TQ.core.safeViewport.computeFit(
            viewportWidth,
            viewportHeight,
            REGION_LAYOUT.viewport.width,
            REGION_LAYOUT.viewport.height
        );
    }

    function renderRewardLabels(regionId, islandId) {
        const rewards = TQ.content.getIslandRewards(regionId, islandId);
        if (!rewards.length) return "";

        return `<span class="island-reward-labels">${rewards.map((reward) => {
            if (reward.type === "map_fragment") return `🧩 Mapa ${reward.mapId}: peça ${reward.fragment}/4`;
            if (reward.type === "chest") return "🎁 Baú";
            if (reward.type === "pet") return "🐾 PET para salvar";
            if (reward.type === "ruby") return "💎 Rubi";
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
        if (reward.type === "ruby") return "Rubi";
        return "Recompensa";
    }

    function getRegionIslandAsset(regionId, islandId, status) {
        const visual = getRegionVisualConfig(regionId);
        const entry = visual?.assets?.islands?.[islandId];
        if (!entry) return "";
        return status === "locked"
            ? (entry.locked || entry.unlocked || "")
            : (entry.unlocked || "");
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

    function createDevelopmentIslandEntryState(state, regionId, islandId) {
        const regionState = TQ.domain.gameplay.createRegionState(regionId);
        const session = TQ.domain.gameplay.createIslandSession(
            regionId,
            islandId,
            `dev-region-${regionId}-island-${islandId}`
        );
        const prepared = TQ.domain.gameplay.prepareNextChallenge(session, regionState);

        return TQ.domain.playerState.withGameplaySession(
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

    function renderRegionMap({
        state,
        onStateChange,
        onNavigate,
        previewRegionId,
        developmentMode = false,
        onDevelopmentIslandOpen
    }) {
        const regionId = getDisplayedRegionId(state, previewRegionId);
        const previewMode = isWorldMapPreview(previewRegionId);
        const visual = getRegionVisualConfig(regionId);
        const visualPage = getRegionVisualPage(state, regionId);
        if (!visual || !visualPage) {
            return renderTextIslandsScreen({ state, onStateChange, onNavigate, previewRegionId });
        }

        const region = previewMode
            ? TQ.content.getWorldRegion(regionId)
            : TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;
        const rubyShopVisible = !previewMode && Boolean(TQ.content.regionHasRubyShop?.(regionId));
        const rubyShopUnlockRule = TQ.content.getRubyShopUnlockRule?.(regionId)
            || TQ.content.rubyShopCatalog.defaultUnlockRule;
        const rubyShopUnlockHint = TQ.content.describeRubyShopUnlockRule?.(rubyShopUnlockRule)
            || "Conclua a Ilha 1 desta Região.";
        const rubyShopUnlocked = rubyShopVisible && TQ.domain.playerState.isRubyShopUnlocked(
            state,
            regionId,
            rubyShopUnlockRule,
            TQ.content.rubyShopCatalog.enabledRegionIds
        );
        const rubyShopShipRect = rubyShopVisible
            ? resolveRubyShopShipRect(visualPage)
            : null;
        const screen = document.createElement("section");
        screen.className = "region-islands-map-screen";
        screen.dataset.regionId = String(regionId);
        screen.dataset.regionPage = visualPage.id;
        screen.style.setProperty("--region-bleed-image", `url("${visualPage.background}")`);
        screen.setAttribute("aria-label", `Ilhas da Região ${region ? region.label : regionId}`);

        const islandsMarkup = visualPage.hideIslands ? "" : visualPage.islandIds.map((islandId, slotIndex) => {
            const slotId = REGION_LAYOUT.visibleIslandIds[slotIndex];
            const layout = visualPage.slotLayout?.[slotId] || REGION_LAYOUT.islands[slotId];
            const status = previewMode
                ? (getDevelopmentRegionStatus(regionId) === "completed" ? "completed" : "available")
                : TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            const identity = TQ.content.getIslandIdentity(regionId, islandId);
            const rewards = TQ.content.getIslandRewards(regionId, islandId);
            const isResume = !previewMode && Boolean(
                active
                && active.regionId === regionId
                && active.islandId === islandId
            );
            const statusText = formatRegionStatus(status, isResume);
            const rewardText = rewardLabel(rewards);
            const assetEntry = visual.assets.islands[islandId];
            if (!assetEntry?.unlocked) return "";

            const islandAsset = getRegionIslandAsset(regionId, islandId, status);
            const unlockedAsset = assetEntry.unlocked;
            const usesFallbackLock = status === "locked" && !assetEntry.locked;

            return `
                <div class="region-island-overlay is-${status}${isResume ? " is-resume" : ""}${usesFallbackLock ? " is-fallback-locked" : ""}" data-island-ui="${islandId}">
                    <div class="region-island-art-shell" style="${rectStyle(layout.art)}">
                        <img class="region-island-art"
                            src="${islandAsset}"
                            data-fallback-src="${status === "locked" && assetEntry.locked ? unlockedAsset : ""}"
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
        }).filter(Boolean).join("");

        screen.innerHTML = `
            <button type="button"
                class="global-home-button"
                data-action="home"
                aria-label="Voltar para Home">Home</button>

            <div class="tq-safe-visual-area">
            <div class="region-islands-canonical-stage tq-canonical-stage">
                <img class="region-islands-background"
                    src="${visualPage.background}"
                    alt=""
                    aria-hidden="true">

                ${visualPage.hideBack ? "" : `
                    <button class="region-back-hitbox"
                        type="button"
                        style="${rectStyle(REGION_LAYOUT.back)}"
                        data-action="back-regions"
                        aria-label="Voltar para Regiões">
                    </button>
                `}

                ${islandsMarkup}

                ${rubyShopVisible && rubyShopShipRect ? `
                    <button class="region-ruby-shop-button${rubyShopUnlocked ? "" : " is-locked"}"
                        type="button"
                        style="${rectStyle(rubyShopShipRect)}"
                        data-action="open-ruby-shop"
                        ${rubyShopUnlocked ? "" : "disabled"}
                        aria-label="${rubyShopUnlocked ? "Abrir Loja Rubi" : `Loja Rubi bloqueada. ${rubyShopUnlockHint}`}">
                        <img class="region-ruby-shop-asset"
                            src="${TQ.content.assets.global.rubyShopMerchantShip}"
                            alt=""
                            aria-hidden="true">
                    </button>
                ` : ""}

                <button class="global-world-map-button${visualPage.worldMapEmbedded ? " is-embedded" : ""}"
                    type="button"
                    style="${rectStyle(visualPage.worldMapLayout || REGION_LAYOUT.worldMap)}"
                    data-action="open-world-map"
                    aria-label="Abrir Mapa mundo">
                    ${visualPage.worldMapEmbedded ? "" : `
                        <img class="global-world-map-asset"
                            src="${TQ.content.assets.global.worldMap}"
                            alt=""
                            aria-hidden="true">
                    `}
                </button>
            </div>
            </div>
        `;

        const safeArea = screen.querySelector(".tq-safe-visual-area");
        const stage = screen.querySelector(".region-islands-canonical-stage");

        screen.addEventListener("error", (event) => {
            const image = event.target.closest?.(".region-island-art");
            if (!image || !image.dataset.fallbackSrc) return;

            const fallback = image.dataset.fallbackSrc;
            image.dataset.fallbackSrc = "";
            image.src = fallback;
            image.closest(".region-island-overlay")?.classList.add("is-fallback-locked");
        }, true);

        TQ.core.safeViewport.bindCanonicalStage(safeArea, stage, {
            fit: "cover",
            mode: "scale",
            designWidth: REGION_LAYOUT.viewport.width,
            designHeight: REGION_LAYOUT.viewport.height
        });

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="home"]')) {
                onNavigate("home");
                return;
            }

            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate(previewMode ? "development-regions" : "regions");
                return;
            }

            if (event.target.closest('[data-action="open-world-map"]')) {
                TQ.core.worldMap.open({ onNavigate });
                return;
            }

            if (event.target.closest('[data-action="open-ruby-shop"]')) {
                if (!rubyShopUnlocked) return;
                onNavigate("ruby-shop");
                return;
            }

            if (visualPage.hideIslands) return;

            const islandButton = event.target.closest("[data-island-id]");
            if (!islandButton) return;

            const islandId = Number(islandButton.dataset.islandId);
            if (developmentMode) {
                if (typeof onDevelopmentIslandOpen === "function") {
                    onDevelopmentIslandOpen(regionId, islandId);
                } else {
                    onStateChange(createDevelopmentIslandEntryState(state, regionId, islandId));
                }
                return;
            }
            if (previewMode) return;
            const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            if (status === "locked") return;

            TQ.screens.challenge?.preloadChallengeArt?.({ regionId, islandId });

            if (active && active.regionId === regionId && active.islandId === islandId) {
                onNavigate("challenge");
                return;
            }

            onStateChange(createIslandEntryState(state, regionId, islandId));
        });

        return screen;
    }

    function renderTextIslandsScreen({
        state,
        onStateChange,
        onNavigate,
        previewRegionId,
        developmentMode = false,
        onDevelopmentIslandOpen
    }) {
        const regionId = getDisplayedRegionId(state, previewRegionId);
        const previewMode = isWorldMapPreview(previewRegionId);
        const region = previewMode
            ? TQ.content.getWorldRegion(regionId)
            : TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;
        const regionIdentity = previewMode ? null : TQ.content.getRegionIdentity(regionId);
        const textMaps = TQ.content.getRegionTextMaps(regionId);
        const rubyShopVisible = !previewMode && Boolean(TQ.content.regionHasRubyShop?.(regionId));
        const rubyShopUnlocked = rubyShopVisible && TQ.domain.playerState.isRubyShopUnlocked(
            state,
            regionId,
            TQ.content.rubyShopCatalog.enabledRegionIds
        );

        const screen = document.createElement("section");
        screen.className = "slice-screen islands-text-screen";
        screen.setAttribute("aria-label", "Ilhas da Região");

        screen.innerHTML = `
            <button type="button"
                class="global-home-button"
                data-action="home"
                aria-label="Voltar para Home">Home</button>

            <header class="slice-header">
                <button type="button" data-action="back-regions">${previewMode ? "← Mapa Mundo" : "← Regiões"}</button>
                <div>
                    <small>REGIÃO ${regionId}</small>
                    <h1>${region ? region.label : "REGIÃO"}</h1>
                </div>
            </header>

            <main class="slice-content">
                <p class="slice-intro">
                    ${previewMode ? "Prévia de desenvolvimento • 5 Ilhas" : (regionIdentity ? regionIdentity.tagline : "Escolha uma Ilha para começar.")}
                </p>
                ${rubyShopVisible ? `
                    <button type="button"
                        class="ruby-shop-text-entry${rubyShopUnlocked ? "" : " is-locked"}"
                        data-action="open-ruby-shop"
                        ${rubyShopUnlocked ? "" : "disabled"}>
                        <span aria-hidden="true">🚢</span>
                        <span>
                            <small>EMBARCAÇÃO MERCANTE</small>
                            <strong>Loja Rubi</strong>
                        </span>
                        <b>ABRIR</b>
                    </button>
                ` : ""}
                <div class="island-text-list">
                    ${Array.from({ length: 5 }, (_, index) => {
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
                                    <span class="island-challenge-type">${previewMode ? "Prévia visual" : "Desafio misto"}</span>
                                    ${previewMode ? "" : renderRewardLabels(regionId, islandId)}
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
            if (event.target.closest('[data-action="home"]')) {
                onNavigate("home");
                return;
            }

            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate(previewMode ? "world-map" : "regions");
                return;
            }

            if (event.target.closest('[data-action="open-ruby-shop"]')) {
                if (!rubyShopUnlocked) return;
                onNavigate("ruby-shop");
                return;
            }

            const islandButton = event.target.closest("[data-island-id]");
            if (!islandButton) return;

            const islandId = Number(islandButton.dataset.islandId);
            if (developmentMode) {
                if (typeof onDevelopmentIslandOpen === "function") {
                    onDevelopmentIslandOpen(regionId, islandId);
                } else {
                    onStateChange(createDevelopmentIslandEntryState(state, regionId, islandId));
                }
                return;
            }
            if (previewMode) return;
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
        getImplementedRegionIds,
        getDevelopmentRegionStatus,
        getRegionVisualPage,
        getRegionIslandAsset,
        getDisplayedRegionId,
        isWorldMapPreview,
        createIslandEntryState,
        createDevelopmentIslandEntryState,
        REGION_LAYOUT,
        REGION_VISUAL_CONFIG,
        RUBY_SHOP_SHIP_LAYOUT,
        rectanglesOverlap,
        getRegionOccupiedRects,
        resolveRubyShopShipRect,
        computeRegionStageGeometry
    });
})(globalThis);
