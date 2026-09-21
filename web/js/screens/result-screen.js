(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderIslandRewards(rewards) {
        const configured = Array.isArray(rewards) ? rewards : [];
        if (!configured.length) return "";

        return `
            <section class="result-rewards" aria-label="Recompensas desta Ilha">
                <h2>Recompensas da Ilha</h2>
                ${configured.map((reward) => {
                    if (reward.type === "map_fragment") return `<p>🧩 Peça ${reward.fragment}/4 do Mapa ${reward.mapId}</p>`;
                    if (reward.type === "chest") return "<p>🎁 Baú conquistado</p>";
                    if (reward.type === "pet") {
                        const pet = TQ.content.getPet?.(reward.petId);
                        return `<p>🐾 ${pet?.label || "PET"} resgatado</p>`;
                    }
                    if (reward.type === "ruby") return "";
                    return "";
                }).join("")}
            </section>
        `;
    }

    function renderNumericRewards(reward) {
        if (!reward?.total) return "";
        const xp = Number.isInteger(reward.total.xp) ? reward.total.xp : 0;
        const gems = Number.isInteger(reward.total.gems) ? reward.total.gems : 0;
        const coins = Number.isInteger(reward.total.coins) ? reward.total.coins : 0;
        const xpBonus = Number.isInteger(reward.bonus?.xp) ? reward.bonus.xp : 0;
        const gemBonus = Number.isInteger(reward.bonus?.gems) ? reward.bonus.gems : 0;
        const coinBonus = Number.isInteger(reward.bonus?.coins) ? reward.bonus.coins : 0;
        const bonusLabel = (value) => value > 0 ? ` <small>(+${value} em bônus)</small>` : "";

        return `
            <section class="result-rewards" aria-label="Recompensas recebidas">
                <h2>Você recebeu</h2>
                <p>⭐ +${xp} XP${bonusLabel(xpBonus)}</p>
                ${coins > 0 ? `<p>🪙 +${coins} Ouro${bonusLabel(coinBonus)}</p>` : ""}
                ${gems > 0 ? `<p>💎 +${gems} Rubis${bonusLabel(gemBonus)}</p>` : ""}
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
                    ${renderNumericRewards(result.reward)}
                    ${renderIslandRewards(result.reward?.structural)}
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
        renderIslandRewards,
        renderNumericRewards
    });
})(globalThis);
