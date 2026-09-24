(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderMapRewardScreen({ state, onNavigate, rewardReturnScreen }) {
        const result = state.learning.lastResult;
        const mapReward = result?.reward?.structural?.find((reward) => reward.type === "map_fragment") || null;
        const mapState = mapReward ? state.campaign.specialMaps?.[String(mapReward.mapId)] : null;
        const fragments = Number.isInteger(mapState?.fragments)
            ? Math.max(0, Math.min(4, mapState.fragments))
            : (Number.isInteger(mapReward?.fragment) ? mapReward.fragment : 0);
        const isComplete = fragments >= 4;

        const screen = document.createElement("section");
        screen.className = "slice-screen result-text-screen map-reward-screen";
        screen.setAttribute("aria-label", "Fragmento de mapa conquistado");

        if (!mapReward) {
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <h1>Nenhum fragmento pendente</h1>
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        } else {
            const slots = Array.from({ length: 4 }, (_, index) =>
                `<span class="map-fragment-slot ${index < fragments ? "is-collected" : ""}" aria-hidden="true">
                    ${index < fragments ? "🧩" : "◻"}
                </span>`
            ).join("");

            screen.innerHTML = `
                <main class="slice-content result-card map-reward-card">
                    <small>MAPA ESPECIAL ${mapReward.mapId}</small>
                    <div class="map-reward-icon" aria-hidden="true">🗺️</div>
                    <h1>${isComplete ? "Mapa completo!" : "Você encontrou um fragmento!"}</h1>
                    <p>${isComplete
                        ? "As quatro partes foram reunidas. A Missão Especial está liberada."
                        : `Você já reuniu ${fragments} de 4 partes deste mapa.`}</p>
                    <div class="map-fragment-progress" aria-label="${fragments} de 4 fragmentos coletados">
                        ${slots}
                    </div>
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="continue"]')) {
                onNavigate(rewardReturnScreen === "regions" ? "regions" : "islands");
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.mapReward = Object.freeze({ renderMapRewardScreen });
})(globalThis);
