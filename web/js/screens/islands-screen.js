(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

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

    function renderIslandsScreen({ state, onStateChange, onNavigate }) {
        const regionId = state.campaign.currentRegionId;
        const region = TQ.content.regions.find((item) => item.id === regionId);
        const active = state.learning.activeSession;

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
                <p class="slice-intro">Escolha uma Ilha para começar.</p>
                <div class="island-text-list">
                    ${Array.from({ length: 10 }, (_, index) => {
                        const islandId = index + 1;
                        const status = TQ.domain.playerState.getIslandStatus(state, regionId, islandId);
                        const isResume = active
                            && active.regionId === regionId
                            && active.islandId === islandId;
                        const actionText = isResume ? "CONTINUAR" : islandLabel(state, regionId, islandId);
                        return `
                            <button type="button"
                                class="slice-choice island-text-button is-${status}"
                                data-island-id="${islandId}"
                                ${status === "locked" ? "disabled" : ""}>
                                <span class="island-copy">
                                    <span>Ilha ${islandId}</span>
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

            const existingRegionState = TQ.domain.playerState.getRegionLearningState(state, regionId)
                || TQ.domain.gameplay.createRegionState(regionId);
            const session = TQ.domain.gameplay.createIslandSession(regionId, islandId);
            const prepared = TQ.domain.gameplay.prepareNextChallenge(session, existingRegionState);

            onStateChange(
                TQ.domain.playerState.withGameplaySession(
                    state,
                    prepared.session,
                    prepared.regionState
                )
            );
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.islands = Object.freeze({
        renderIslandsScreen,
        islandLabel,
        renderRewardLabels
    });
})(globalThis);
