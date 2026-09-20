(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const REGION_1_LAYOUT = Object.freeze({
        viewport: Object.freeze({ width: 941, height: 1672 }),
        back: Object.freeze({ x: 8, y: 5, width: 118, height: 118 }),
        islands: Object.freeze({
            1: Object.freeze({
                art: Object.freeze({ x: 45, y: 185, width: 370, height: 265 }),
                status: Object.freeze({ x: 145, y: 472, width: 174, height: 39 }),
                reward: Object.freeze({ x: 331, y: 468, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 35, y: 145, width: 390, height: 380 })
            }),
            2: Object.freeze({
                art: Object.freeze({ x: 515, y: 185, width: 370, height: 265 }),
                status: Object.freeze({ x: 575, y: 472, width: 176, height: 39 }),
                reward: Object.freeze({ x: 764, y: 468, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 500, y: 145, width: 405, height: 380 })
            }),
            3: Object.freeze({
                art: Object.freeze({ x: 45, y: 485, width: 370, height: 250 }),
                status: Object.freeze({ x: 145, y: 759, width: 174, height: 40 }),
                reward: Object.freeze({ x: 331, y: 757, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 35, y: 525, width: 390, height: 287 })
            }),
            4: Object.freeze({
                art: Object.freeze({ x: 515, y: 485, width: 370, height: 250 }),
                status: Object.freeze({ x: 575, y: 759, width: 174, height: 40 }),
                reward: Object.freeze({ x: 763, y: 757, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 500, y: 525, width: 405, height: 287 })
            }),
            5: Object.freeze({
                art: Object.freeze({ x: 45, y: 775, width: 370, height: 250 }),
                status: Object.freeze({ x: 145, y: 1049, width: 174, height: 40 }),
                reward: Object.freeze({ x: 332, y: 1045, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 35, y: 812, width: 390, height: 296 })
            }),
            6: Object.freeze({
                art: Object.freeze({ x: 515, y: 775, width: 370, height: 250 }),
                status: Object.freeze({ x: 575, y: 1049, width: 174, height: 40 }),
                reward: Object.freeze({ x: 765, y: 1045, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 500, y: 812, width: 405, height: 296 })
            }),
            7: Object.freeze({
                art: Object.freeze({ x: 45, y: 1060, width: 370, height: 245 }),
                status: Object.freeze({ x: 145, y: 1327, width: 174, height: 40 }),
                reward: Object.freeze({ x: 331, y: 1326, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 35, y: 1108, width: 390, height: 280 })
            }),
            8: Object.freeze({
                art: Object.freeze({ x: 515, y: 1060, width: 370, height: 245 }),
                status: Object.freeze({ x: 575, y: 1327, width: 176, height: 40 }),
                reward: Object.freeze({ x: 764, y: 1325, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 500, y: 1108, width: 405, height: 280 })
            }),
            9: Object.freeze({
                art: Object.freeze({ x: 45, y: 1340, width: 370, height: 245 }),
                status: Object.freeze({ x: 145, y: 1613, width: 174, height: 40 }),
                reward: Object.freeze({ x: 331, y: 1609, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 35, y: 1388, width: 390, height: 284 })
            }),
            10: Object.freeze({
                art: Object.freeze({ x: 515, y: 1340, width: 370, height: 245 }),
                status: Object.freeze({ x: 575, y: 1613, width: 176, height: 40 }),
                reward: Object.freeze({ x: 763, y: 1609, width: 56, height: 56 }),
                hitbox: Object.freeze({ x: 500, y: 1388, width: 405, height: 284 })
            })
        })
    });

    function rectStyle(rect) {
        return `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px`;
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

    function rewardSymbol(rewards) {
        const reward = Array.isArray(rewards) ? rewards[0] : null;
        if (!reward) return "";
        if (reward.type === "map_fragment") return "🧩";
        if (reward.type === "chest") return "🎁";
        if (reward.type === "pet") return "🐾";
        return "";
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
            const reward = rewardSymbol(rewards);
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
                        style="${rectStyle(layout.status)}"
                        aria-hidden="true">${statusText}</span>

                    <span class="region1-island-reward"
                        style="${rectStyle(layout.reward)}"
                        aria-hidden="true">${reward}</span>

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
        rewardSymbol,
        rewardLabel,
        getRegion1IslandAsset,
        createIslandEntryState,
        REGION_1_LAYOUT,
        computeRegion1StageGeometry
    });
})(globalThis);
