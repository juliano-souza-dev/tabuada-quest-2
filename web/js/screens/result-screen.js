(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderIslandRewards(regionId, islandId) {
        const rewards = TQ.content.getIslandRewards(regionId, islandId);
        if (!rewards.length) return "";

        return `
            <section class="result-rewards" aria-label="Recompensa desta Ilha">
                <h2>Marco desta Ilha</h2>
                ${rewards.map((reward) => {
                    if (reward.type === "map_fragment") return `<p>🧩 Peça ${reward.fragment}/4 do Mapa ${reward.mapId}</p>`;
                    if (reward.type === "chest") return "<p>🎁 Baú encontrado</p>";
                    if (reward.type === "pet") return "<p>🐾 PET salvo</p>";
                    return "";
                }).join("")}
            </section>
        `;
    }

    function renderResultScreen({ state, onNavigate }) {
        const result = state.learning.lastResult;
        const screen = document.createElement("section");
        screen.className = "slice-screen result-text-screen";
        screen.setAttribute("aria-label", "Resultado da Ilha");

        if (!result) {
            screen.innerHTML = `
                <main class="slice-content">
                    <h1>Sem resultado disponível</h1>
                    <button type="button" data-action="islands">Voltar às Ilhas</button>
                </main>
            `;
        } else {
            const region = TQ.content.regions.find((item) => item.id === result.regionId);
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <small>${region ? region.label : `Região ${result.regionId}`}</small>
                    <h1>Ilha ${result.islandId} concluída ✓</h1>
                    <dl class="result-stats">
                        <div><dt>Questões planejadas</dt><dd>${result.plannedAnswered}/20</dd></div>
                        <div><dt>Acertos</dt><dd>${result.correctAnswers}</dd></div>
                        <div><dt>Erros</dt><dd>${result.wrongAnswers}</dd></div>
                        <div><dt>Tentativas extras</dt><dd>${result.recoveryAnswers}</dd></div>
                    </dl>
                    ${renderIslandRewards(result.regionId, result.islandId)}
                    <button type="button" data-action="islands">Voltar às Ilhas</button>
                    <button type="button" data-action="regions">Ver Regiões</button>
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "islands") onNavigate("islands");
            if (action === "regions") onNavigate("regions");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.result = Object.freeze({
        renderResultScreen,
        renderIslandRewards
    });
})(globalThis);
