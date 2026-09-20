(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

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
        renderResultScreen
    });
})(globalThis);
