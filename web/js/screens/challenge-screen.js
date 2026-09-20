(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderQuestion(session) {
        const challenge = session.currentChallenge;
        if (!challenge) {
            return `
                <div class="challenge-card">
                    <p>Preparando a próxima conta...</p>
                    <button type="button" data-action="prepare-next">Continuar</button>
                </div>
            `;
        }

        const options = TQ.domain.gameplay.createAnswerOptions(session);
        return `
            <div class="challenge-card">
                <p class="challenge-progress">Questões da Ilha: ${session.plannedAnswered}/20</p>
                <div class="math-question" aria-label="${challenge.table} vezes ${challenge.multiplier}">
                    ${challenge.table} × ${challenge.multiplier} = ?
                </div>
                <div class="answer-grid">
                    ${options.map((answer) => `
                        <button type="button"
                            class="answer-button"
                            data-answer="${answer}">
                            ${answer}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderFeedback(session) {
        const feedback = session.lastFeedback;
        if (!feedback) return "";
        const message = feedback.isCorrect
            ? "Acertou! ✓"
            : `Quase! A resposta é ${feedback.expected}.`;

        return `
            <div class="challenge-card feedback-card ${feedback.isCorrect ? "is-correct" : "is-wrong"}">
                <h2>${message}</h2>
                <p>${feedback.table} × ${feedback.multiplier} = ${feedback.expected}</p>
                <button type="button" data-action="continue-feedback">Continuar</button>
            </div>
        `;
    }

    function renderChallengeScreen({ state, onStateChange, onNavigate }) {
        const session = state.learning.activeSession;
        const screen = document.createElement("section");
        screen.className = "slice-screen challenge-text-screen";
        screen.setAttribute("aria-label", "Desafio da Ilha");

        if (!session) {
            screen.innerHTML = `
                <main class="slice-content">
                    <h1>Nenhuma Ilha em andamento</h1>
                    <button type="button" data-action="back-islands">Voltar às Ilhas</button>
                </main>
            `;
        } else {
            const region = TQ.content.regions.find((item) => item.id === session.regionId);
            screen.innerHTML = `
                <header class="slice-header">
                    <button type="button" data-action="back-islands">← Ilhas</button>
                    <div>
                        <small>${region ? region.label : `Região ${session.regionId}`}</small>
                        <h1>Ilha ${session.islandId}</h1>
                    </div>
                </header>
                <main class="slice-content challenge-content">
                    ${session.phase === "feedback" ? renderFeedback(session) : ""}
                    ${session.phase === "question" ? renderQuestion(session) : ""}
                    ${session.phase === "complete" ? `
                        <div class="challenge-card">
                            <h2>Ilha concluída!</h2>
                            <button type="button" data-action="finish-session">Ver resultado</button>
                        </div>
                    ` : ""}
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back-islands"]')) {
                onNavigate("islands");
                return;
            }

            if (!session) return;

            const regionState = TQ.domain.playerState.getRegionLearningState(state, session.regionId)
                || TQ.domain.gameplay.createRegionState(session.regionId);

            if (event.target.closest('[data-action="prepare-next"]')) {
                const prepared = TQ.domain.gameplay.prepareNextChallenge(session, regionState);
                onStateChange(TQ.domain.playerState.updateGameplaySession(
                    state,
                    prepared.session,
                    prepared.regionState
                ));
                return;
            }

            const answerButton = event.target.closest("[data-answer]");
            if (answerButton && session.phase === "question") {
                const answered = TQ.domain.gameplay.answerCurrentChallenge(
                    session,
                    regionState,
                    Number(answerButton.dataset.answer)
                );
                onStateChange(TQ.domain.playerState.updateGameplaySession(
                    state,
                    answered.session,
                    answered.regionState
                ));
                return;
            }

            if (event.target.closest('[data-action="continue-feedback"]')) {
                const next = TQ.domain.gameplay.continueAfterFeedback(session, regionState);
                if (next.session.phase === "complete") {
                    const result = TQ.domain.gameplay.buildResult(next.session);
                    onStateChange(TQ.domain.playerState.completeGameplaySession(
                        state,
                        result,
                        next.regionState,
                        TQ.content.getIslandRewards(result.regionId, result.islandId)
                    ));
                } else {
                    onStateChange(TQ.domain.playerState.updateGameplaySession(
                        state,
                        next.session,
                        next.regionState
                    ));
                }
                return;
            }

            if (event.target.closest('[data-action="finish-session"]')) {
                const result = TQ.domain.gameplay.buildResult(session);
                onStateChange(TQ.domain.playerState.completeGameplaySession(
                    state,
                    result,
                    regionState,
                    TQ.content.getIslandRewards(result.regionId, result.islandId)
                ));
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.challenge = Object.freeze({
        renderChallengeScreen
    });
})(globalThis);
