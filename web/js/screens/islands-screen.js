(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const REGION_1_LAYOUT = Object.freeze({
        viewport: Object.freeze({ width: 941, height: 1672 }),
        back: Object.freeze({ x: 58, y: 18, width: 150, height: 150 }),
        islands: Object.freeze({
            1: Object.freeze({
                art: Object.freeze({ x: 234, y: 288, width: 224, height: 214 }),
                status: Object.freeze({ x: 277, y: 457, width: 139, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 242, y: 294, width: 208, height: 202 })
            }),
            2: Object.freeze({
                art: Object.freeze({ x: 518, y: 391, width: 224, height: 214 }),
                status: Object.freeze({ x: 561, y: 560, width: 139, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 526, y: 397, width: 208, height: 202 })
            }),
            3: Object.freeze({
                art: Object.freeze({ x: 213, y: 538, width: 224, height: 214 }),
                status: Object.freeze({ x: 256, y: 707, width: 139, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 221, y: 544, width: 208, height: 202 })
            }),
            4: Object.freeze({
                art: Object.freeze({ x: 519, y: 678, width: 226, height: 216 }),
                status: Object.freeze({ x: 562, y: 849, width: 140, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 527, y: 684, width: 210, height: 204 })
            }),
            5: Object.freeze({
                art: Object.freeze({ x: 175, y: 780, width: 236, height: 220 }),
                status: Object.freeze({ x: 220, y: 954, width: 146, height: 26, fontSize: 23 }),
                hitbox: Object.freeze({ x: 183, y: 786, width: 220, height: 208 })
            }),
            6: Object.freeze({
                art: Object.freeze({ x: 523, y: 899, width: 236, height: 220 }),
                status: Object.freeze({ x: 568, y: 1073, width: 146, height: 26, fontSize: 23 }),
                hitbox: Object.freeze({ x: 531, y: 905, width: 220, height: 208 })
            }),
            7: Object.freeze({
                art: Object.freeze({ x: 193, y: 1038, width: 224, height: 214 }),
                status: Object.freeze({ x: 236, y: 1207, width: 139, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 201, y: 1044, width: 208, height: 202 })
            }),
            8: Object.freeze({
                art: Object.freeze({ x: 546, y: 1158, width: 232, height: 218 }),
                status: Object.freeze({ x: 590, y: 1330, width: 144, height: 26, fontSize: 23 }),
                hitbox: Object.freeze({ x: 554, y: 1164, width: 216, height: 206 })
            }),
            9: Object.freeze({
                art: Object.freeze({ x: 220, y: 1269, width: 224, height: 214 }),
                status: Object.freeze({ x: 263, y: 1438, width: 139, height: 26, fontSize: 22 }),
                hitbox: Object.freeze({ x: 228, y: 1275, width: 208, height: 202 })
            }),
            10: Object.freeze({
                art: Object.freeze({ x: 524, y: 1401, width: 238, height: 222 }),
                status: Object.freeze({ x: 569, y: 1576, width: 148, height: 27, fontSize: 23 }),
                hitbox: Object.freeze({ x: 532, y: 1407, width: 222, height: 210 })
            })
        })
    });

    function rectStyle(rect) {
        return `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px`;
    }

    function statusStyle(rect) {
        return `${rectStyle(rect)};font-size:${rect.fontSize || 22}px;line-height:${rect.height}px`;
    }

    function computeRegion1StageGeometry(viewportWidth, viewportHeight) {
        const width = Number(viewportWidth) || 0;
        const height = Number(viewportHeight) || 0;
        const scale = Math.max(
            width / REGION_1_LAYOUT.viewport.width,
            height / REGION_1_LAYOUT.viewport.height
        );
        const renderWidth = REGION_1_LAYOUT.viewport.width * scale;
        const renderHeight = REGION_1_LAYOUT.viewport.height * scale;

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

    function formatRegion1Status(status, isResume) {
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

    function getRegion1IslandAsset(islandId, status) {
        const entry = TQ.content.assets.region1Modular.islands[islandId];
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

    function renderRegion1Map({ state, onStateChange, onNavigate }) {
        const regionId = 1;
        const active = state.learning.activeSession;
        const screen = document.createElement("section");
        screen.className = "region1-islands-map-screen";
        screen.setAttribute("aria-label", "Ilhas da Região CORSÁRIO");

        const islandsMarkup = Array.from({ length: 10 }, (_, index) => {
            const islandId = index + 1;
            const layout = REGION_1_LAYOUT.islands[islandId];
            const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
            const identity = TQ.content.getIslandIdentity(regionId, islandId);
            const rewards = TQ.content.getIslandRewards(regionId, islandId);
            const isResume = Boolean(
                active
                && active.regionId === regionId
                && active.islandId === islandId
            );
            const statusText = formatRegion1Status(status, isResume);
            const rewardText = rewardLabel(rewards);
            const islandAsset = getRegion1IslandAsset(islandId, status);
            const unlockedAsset = TQ.content.assets.region1Modular.islands[islandId].unlocked;

            return `
                <div class="region1-island-overlay is-${status}" data-island-ui="${islandId}">
                    <div class="region1-island-art-shell" style="${rectStyle(layout.art)}">
                        <img class="region1-island-art"
                            src="${islandAsset}"
                            data-fallback-src="${status === "locked" ? unlockedAsset : ""}"
                            alt=""
                            aria-hidden="true">
                        <span class="region1-fallback-lock" aria-hidden="true">🔒</span>
                    </div>

                    <span class="region1-island-status"
                        style="${statusStyle(layout.status)}"
                        aria-hidden="true">${statusText}</span>

                    <button class="region1-island-hitbox"
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
            <div class="region1-islands-canonical-stage">
                <img class="region1-islands-background"
                    src="${TQ.content.assets.region1Modular.background}"
                    alt=""
                    aria-hidden="true">

                <button class="region1-back-hitbox"
                    type="button"
                    style="${rectStyle(REGION_1_LAYOUT.back)}"
                    data-action="back-regions"
                    aria-label="Voltar para Regiões">
                </button>

                ${islandsMarkup}
            </div>
        `;

        const stage = screen.querySelector(".region1-islands-canonical-stage");

        screen.addEventListener("error", (event) => {
            const image = event.target.closest?.(".region1-island-art");
            if (!image || !image.dataset.fallbackSrc) return;

            const fallback = image.dataset.fallbackSrc;
            image.dataset.fallbackSrc = "";
            image.src = fallback;
            image.closest(".region1-island-overlay")?.classList.add("is-fallback-locked");
        }, true);

        function applyStageGeometry() {
            const geometry = computeRegion1StageGeometry(screen.clientWidth, screen.clientHeight);
            stage.style.left = `${geometry.offsetX}px`;
            stage.style.top = `${geometry.offsetY}px`;
            stage.style.transform = `scale(${geometry.scale})`;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate("regions");
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

    function renderTextIslandsScreen({ state, onStateChange, onNavigate }) {
        const regionId = state.campaign.currentRegionId;
        const region = TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;
        const regionIdentity = TQ.content.getRegionIdentity(regionId);

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
                    ${regionIdentity ? regionIdentity.tagline : "Escolha uma Ilha para começar."}
                </p>
                <div class="island-text-list">
                    ${Array.from({ length: 10 }, (_, index) => {
                        const islandId = index + 1;
                        const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
                        const isResume = active
                            && active.regionId === regionId
                            && active.islandId === islandId;
                        const actionText = isResume ? "CONTINUAR" : islandLabel(state, regionId, islandId);
                        const identity = TQ.content.getIslandIdentity(regionId, islandId);
                        return `
                            <button type="button"
                                class="slice-choice island-text-button is-${status}"
                                data-island-id="${islandId}"
                                ${status === "locked" ? "disabled" : ""}>
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
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back-regions"]')) {
                onNavigate("regions");
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
        return context.state.campaign.currentRegionId === 1
            ? renderRegion1Map(context)
            : renderTextIslandsScreen(context);
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.islands = Object.freeze({
        renderIslandsScreen,
        renderRegion1Map,
        renderTextIslandsScreen,
        islandLabel,
        renderRewardLabels,
        formatRegion1Status,
        rewardLabel,
        getRegion1IslandAsset,
        createIslandEntryState,
        REGION_1_LAYOUT,
        computeRegion1StageGeometry
    });
})(globalThis);
