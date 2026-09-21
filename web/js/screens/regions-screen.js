(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function formatRegionAction(status) {
        if (status === "completed") return "CONCLUÍDA ✓";
        if (status === "in_progress") return "CONTINUAR";
        if (status === "available") return "EXPLORAR";
        return "BLOQUEADA 🔒";
    }

    function renderRegionsScreen({ state, onStateChange, onNavigate }) {
        const screen = document.createElement("section");
        screen.className = "slice-screen regions-text-screen";
        screen.setAttribute("aria-label", "Regiões");

        const pendingMapId = TQ.domain.playerState.getPendingSpecialMapId(state);
        const activeMapId = TQ.domain.playerState.getActiveSpecialMapId(state);
        const missionMapId = pendingMapId || (
            activeMapId && state.campaign.specialMaps[String(activeMapId)]?.missionStatus === "mission_in_progress"
                ? activeMapId
                : null
        );

        screen.innerHTML = `
            <header class="slice-header">
                <button type="button" data-action="back" aria-label="Voltar">←</button>
                <div>
                    <small>MAPA DA AVENTURA</small>
                    <h1>Regiões</h1>
                </div>
            </header>
            <main class="slice-content">
                <p class="slice-intro">Escolha a próxima Região da aventura.</p>
                ${missionMapId ? `
                    <button type="button" class="slice-choice special-mission-entry" data-special-map-id="${missionMapId}">
                        <span><small>MAPA ${missionMapId}</small><strong>Missão Especial</strong></span>
                        <strong>${pendingMapId ? "INICIAR" : "CONTINUAR"}</strong>
                    </button>
                ` : ""}
                <div class="region-text-list">
                    ${TQ.content.regions.map((region) => {
                        const progress = state.campaign.regionProgress[String(region.id)];
                        const status = TQ.domain.playerState.getRegionStatus(state, region.id);
                        const completed = progress?.islandsCompleted || 0;
                        return `
                            <button type="button"
                                class="slice-choice region-text-button is-${status}"
                                data-region-id="${region.id}"
                                ${status === "locked" ? "disabled" : ""}
                                aria-label="Região ${region.id}, ${region.label}, ${completed} de 5 Ilhas concluídas, ${formatRegionAction(status)}">
                                <span>
                                    <small>REGIÃO ${String(region.id).padStart(2, "0")}</small>
                                    <strong>${region.label}</strong>
                                    <span>${completed}/5 Ilhas</span>
                                </span>
                                <strong>${formatRegionAction(status)}</strong>
                            </button>
                        `;
                    }).join("")}
                </div>
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }

            const missionButton = event.target.closest("[data-special-map-id]");
            if (missionButton) {
                const mapId = Number(missionButton.dataset.specialMapId);
                const mapState = state.campaign.specialMaps[String(mapId)];
                if (mapState?.missionStatus === "map_complete_mission_pending") {
                    const mission = TQ.domain.specialMission.createMission(mapId, `special-map-${mapId}`);
                    onStateChange(TQ.domain.playerState.startSpecialMapMission(state, mapId, mission));
                } else if (mapState?.missionStatus === "mission_in_progress") {
                    onStateChange(TQ.domain.playerState.withLastScreen(state, "special-mission"));
                }
                return;
            }

            const regionButton = event.target.closest("[data-region-id]");
            if (!regionButton) return;
            const regionId = Number(regionButton.dataset.regionId);
            const status = TQ.domain.playerState.getRegionStatus(state, regionId);
            if (status === "locked") return;

            const selected = TQ.domain.playerState.selectRegion(state, regionId);
            onStateChange(TQ.domain.playerState.withLastScreen(selected, "islands"));
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.regions = Object.freeze({
        renderRegionsScreen,
        formatRegionAction
    });
})(globalThis);
