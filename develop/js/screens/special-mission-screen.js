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
                        <button type="button" class="answer-button tabuada-opcao" data-answer="${answer}">
                            <span class="numero">${answer}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderFeedback(state, mission) {
        const feedback = mission.lastFeedback;
        if (!feedback) return "";
        const type = feedback.isCorrect ? "correct" : "wrong";
        const effect = TQ.effects.resolveEquippedEffect(state, type);
        const detail = feedback.isCorrect
            ? ""
            : `${feedback.table} × ${feedback.multiplier} = ${feedback.expected}`;
        const reward = feedback.isCorrect ? "+2 Rubis-base" : "";

        return `
            <div class="challenge-card feedback-card ${feedback.isCorrect ? "is-correct" : "is-wrong"}">
                ${TQ.core.challengeEffectRenderer.render(effect, { detail, reward })}
                ${feedback.isCorrect ? "" : `
                    <button type="button" data-action="continue-feedback">Continuar</button>
                `}
            </div>
        `;
    }

    function advanceAfterFeedback(state, mapId, mission, onStateChange) {
        const next = TQ.domain.specialMission.continueAfterFeedback(mission);
        onStateChange(TQ.domain.playerState.updateSpecialMapMission(
            state,
            mapId,
            next
        ));
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
                    ${mission.phase === "feedback" ? renderFeedback(state, mission) : ""}
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
                advanceAfterFeedback(state, mapId, mission, onStateChange);
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

        if (mission?.phase === "feedback" && mission.lastFeedback?.isCorrect) {
            const effect = TQ.effects.resolveEquippedEffect(state, "correct");
            TQ.core.challengeEffectRenderer.scheduleAutoAdvance(
                screen,
                effect,
                () => advanceAfterFeedback(state, mapId, mission, onStateChange)
            );
        }

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.specialMission = Object.freeze({
        renderSpecialMissionScreen,
        renderFeedback,
        advanceAfterFeedback
    });
})(globalThis);
