(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderIslandRewards(rewards) {
        const configured = Array.isArray(rewards) ? rewards : [];
        const visible = configured.map((reward) => {
            if (reward.type === "map_fragment") return `<span class="result-art-reward-chip">🧩 Peça ${reward.fragment}/4 do Mapa ${reward.mapId}</span>`;
            if (reward.type === "chest") return '<span class="result-art-reward-chip">🎁 Baú conquistado</span>';
            if (reward.type === "pet") {
                const pet = TQ.content.getPet?.(reward.petId);
                return `<span class="result-art-reward-chip">🐾 ${pet?.label || "PET"} resgatado</span>`;
            }
            return "";
        }).filter(Boolean);

        if (!visible.length) return "";

        return `
            <div class="result-art-structural-rewards" aria-label="Recompensas desta Ilha">
                ${visible.join("")}
            </div>
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
        const bonusLabel = (value) => value > 0 ? ` <small>+${value} bônus</small>` : "";

        return `
            <div class="result-art-numeric-rewards" aria-label="Recompensas recebidas">
                <span class="result-art-reward-chip">⭐ +${xp} XP${bonusLabel(xpBonus)}</span>
                ${coins > 0 ? `<span class="result-art-reward-chip">🪙 +${coins} Ouro${bonusLabel(coinBonus)}</span>` : ""}
                ${gems > 0 ? `<span class="result-art-reward-chip">💎 +${gems} Rubis${bonusLabel(gemBonus)}</span>` : ""}
            </div>
        `;
    }

    function renderTextFallback(result, region, pendingMapId) {
        return `
            <main class="slice-content result-card">
                <small>${region ? region.label : `Região ${result.regionId}`}</small>
                <h1>Ilha ${result.islandId} concluída ✓</h1>
                <dl class="result-stats">
                    <div><dt>Questões planejadas</dt><dd>${result.plannedAnswered}/20</dd></div>
                    <div><dt>Acertos</dt><dd>${result.correctAnswers}</dd></div>
                    <div><dt>Erros</dt><dd>${result.wrongAnswers}</dd></div>
                    <div><dt>Tentativas extras</dt><dd>${result.recoveryAnswers}</dd></div>
                </dl>
                <section class="result-rewards" aria-label="Recompensas recebidas">
                    <h2>Você recebeu</h2>
                    ${renderNumericRewards(result.reward)}
                    ${renderIslandRewards(result.reward?.structural)}
                </section>
                ${pendingMapId ? `
                    <section class="special-mission-callout">
                        <h2>Missão Especial liberada! 🗺️</h2>
                        <p>20 questões. Uma chance por questão. Cada acerto vale 2 Rubis-base.</p>
                        <button type="button" data-action="special-mission" data-map-id="${pendingMapId}">Iniciar Missão Especial</button>
                    </section>
                ` : ""}
                <button type="button" data-action="islands">Voltar às Ilhas</button>
                <button type="button" data-action="regions">Ver Regiões</button>
            </main>
        `;
    }

    function renderResultScreen({ state, onStateChange, onNavigate }) {
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
            const pendingMapId = TQ.domain.playerState.getPendingSpecialMapId(state);
            const victoryArt = TQ.content.assets.global?.victoryScreen;

            if (victoryArt) {
                screen.classList.add("result-art-screen");
                screen.dataset.regionId = String(result.regionId);
                screen.dataset.islandId = String(result.islandId);
                screen.innerHTML = `
                    <main class="result-art-stage">
                        <img
                            class="result-art-background"
                            src="${victoryArt}"
                            alt=""
                            aria-hidden="true">

                        <div class="result-art-dynamic-layer">
                            <header class="result-art-title">
                                <small>${region ? region.label : `Região ${result.regionId}`}</small>
                                <h1>Ilha ${result.islandId} concluída!</h1>
                            </header>

                            <dl class="result-art-stats" aria-label="Resumo da partida">
                                <div><dt>Questões planejadas</dt><dd>${result.plannedAnswered}/20</dd></div>
                                <div><dt>Acertos</dt><dd>${result.correctAnswers}</dd></div>
                                <div><dt>Erros</dt><dd>${result.wrongAnswers}</dd></div>
                                <div><dt>Tentativas extras</dt><dd>${result.recoveryAnswers}</dd></div>
                            </dl>

                            <section class="result-art-reward-zone" aria-label="Recompensas">
                                <h2>Você recebeu</h2>
                                ${renderNumericRewards(result.reward)}
                                ${renderIslandRewards(result.reward?.structural)}
                            </section>

                            ${pendingMapId ? `
                                <button
                                    type="button"
                                    class="result-art-special-mission"
                                    data-action="special-mission"
                                    data-map-id="${pendingMapId}">
                                    🗺️ Missão Especial liberada
                                </button>
                            ` : ""}

                            <button
                                type="button"
                                class="result-art-action result-art-action-primary"
                                data-action="islands">
                                Voltar às Ilhas
                            </button>

                            <button
                                type="button"
                                class="result-art-action result-art-action-secondary"
                                data-action="regions">
                                Ver Regiões
                            </button>
                        </div>
                    </main>
                `;
            } else {
                screen.innerHTML = renderTextFallback(result, region, pendingMapId);
            }
        }

        screen.addEventListener("click", (event) => {
            const target = event.target.closest("[data-action]");
            const action = target?.dataset.action;
            if (action === "islands") onNavigate("islands");
            if (action === "regions") onNavigate("regions");
            if (action === "special-mission") {
                const mapId = Number(target?.dataset.mapId);
                const mission = TQ.domain.specialMission.createMission(mapId, `special-map-${mapId}`);
                onStateChange(TQ.domain.playerState.startSpecialMapMission(state, mapId, mission));
            }
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
