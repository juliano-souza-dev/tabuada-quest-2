(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderQuestion(mission) {
        const question = TQ.domain.specialMission.currentQuestion(mission);
        if (!question) return "";
        const options = TQ.domain.specialMission.createAnswerOptions(mission);

        return `
            <div class="challenge-card">
                <p class="challenge-progress">Missão Especial: ${mission.totalAnswered}/20</p>
                <div class="math-question" aria-label="${question.table} vezes ${question.multiplier}">
                    ${question.table} × ${question.multiplier} = ?
                </div>
                <div class="answer-grid">
                    ${options.map((answer) => `
                        <button type="button" class="answer-button" data-answer="${answer}">
                            ${answer}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderFeedback(mission) {
        const feedback = mission.lastFeedback;
        if (!feedback) return "";
        const message = feedback.isCorrect
            ? "Acertou! +2 Rubis-base ✓"
            : `Errou. A resposta era ${feedback.expected}.`;

        return `
            <div class="challenge-card feedback-card ${feedback.isCorrect ? "is-correct" : "is-wrong"}">
                <h2>${message}</h2>
                <p>${feedback.table} × ${feedback.multiplier} = ${feedback.expected}</p>
                <button type="button" data-action="continue-feedback">Próxima</button>
            </div>
        `;
    }

    function renderMissionResult(mapState) {
        const result = mapState?.lastMissionResult;
        if (!result) return "";
        const reward = result.reward;
        return `
            <div class="challenge-card result-card">
                <small>MISSÃO ESPECIAL CONCLUÍDA</small>
                <h1>Mapa ${result.mapId} vencido! 🗺️</h1>
                <dl class="result-stats">
                    <div><dt>Questões</dt><dd>20</dd></div>
                    <div><dt>Acertos</dt><dd>${result.correctAnswers}</dd></div>
                    <div><dt>Erros</dt><dd>${result.wrongAnswers}</dd></div>
                </dl>
                <p>⭐ +${reward?.total?.xp || 0} XP</p>
                <p>🪙 +${reward?.total?.coins || 0} Ouro</p>
                <p>💎 +${reward?.total?.gems || 0} Rubis</p>
                <button type="button" data-action="regions">Continuar aventura</button>
            </div>
        `;
    }

    function renderSpecialMissionScreen({ state, onStateChange, onNavigate }) {
        const mapId = TQ.domain.playerState.getActiveSpecialMapId(state);
        const mapState = mapId ? state.campaign.specialMaps[String(mapId)] : null;
        const mission = mapState?.mission || null;

        const screen = document.createElement("section");
        screen.className = "slice-screen challenge-text-screen special-mission-screen";
        screen.setAttribute("aria-label", "Missão Especial");

        if (mapState?.missionStatus === "mission_completed" && mapState.lastMissionResult) {
            screen.innerHTML = `
                <header class="slice-header">
                    <div><small>MAPA COMPLETO</small><h1>Missão Especial</h1></div>
                </header>
                <main class="slice-content challenge-content">
                    ${renderMissionResult(mapState)}
                </main>
            `;
        } else if (!mission) {
            screen.innerHTML = `
                <main class="slice-content challenge-content">
                    <div class="challenge-card">
                        <h1>Nenhuma missão especial em andamento</h1>
                        <button type="button" data-action="regions">Voltar às Regiões</button>
                    </div>
                </main>
            `;
        } else {
            screen.innerHTML = `
                <header class="slice-header">
                    <div>
                        <small>MAPA ${mission.mapId}</small>
                        <h1>Missão Especial</h1>
                    </div>
                </header>
                <main class="slice-content challenge-content">
                    ${mission.phase === "question" ? renderQuestion(mission) : ""}
                    ${mission.phase === "feedback" ? renderFeedback(mission) : ""}
                    ${mission.phase === "complete" ? `
                        <div class="challenge-card">
                            <h2>20 questões concluídas!</h2>
                            <button type="button" data-action="finish-mission">Ver recompensa</button>
                        </div>
                    ` : ""}
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "regions") {
                onNavigate("regions");
                return;
            }
            if (!mission || !mapId) return;

            const answerButton = event.target.closest("[data-answer]");
            if (answerButton && mission.phase === "question") {
                const answered = TQ.domain.specialMission.answer(
                    mission,
                    Number(answerButton.dataset.answer)
                );
                onStateChange(TQ.domain.playerState.updateSpecialMapMission(
                    state,
                    mapId,
                    answered
                ));
                return;
            }

            if (action === "continue-feedback") {
                const next = TQ.domain.specialMission.continueAfterFeedback(mission);
                if (next.phase === "complete") {
                    onStateChange(TQ.domain.playerState.updateSpecialMapMission(
                        state,
                        mapId,
                        next
                    ));
                } else {
                    onStateChange(TQ.domain.playerState.updateSpecialMapMission(
                        state,
                        mapId,
                        next
                    ));
                }
                return;
            }

            if (action === "finish-mission") {
                const missionResult = TQ.domain.specialMission.buildResult(mission);
                onStateChange(TQ.domain.playerState.completeSpecialMapMission(
                    state,
                    missionResult,
                    TQ.content.crewMembers,
                    TQ.content.gameplayRewards,
                    TQ.content
                ));
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.specialMission = Object.freeze({
        renderSpecialMissionScreen
    });
})(globalThis);
