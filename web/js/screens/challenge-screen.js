(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function getChallengeArt(session) {
        if (!session || Number(session.regionId) !== 1) return null;
        return TQ.content.assets.region1ChallengeArt?.[Number(session.islandId)] || null;
    }

    function renderQuestion(session) {
        const challenge = session.currentChallenge;
        if (!challenge) {
            return `
                <div class="challenge-dynamic-layer challenge-prepare-layer">
                    <button type="button" data-action="prepare-next">Continuar</button>
                </div>
            `;
        }

        const options = TQ.domain.gameplay.createAnswerOptions(session);
        return `
            <div class="challenge-dynamic-layer" aria-live="polite">
                <div class="challenge-art-progress">
                    Questão ${Math.min(session.plannedAnswered + 1, 20)} de 20
                </div>
                <div class="challenge-art-question" aria-label="${challenge.table} vezes ${challenge.multiplier}">
                    ${challenge.table} × ${challenge.multiplier} = ?
                </div>
                <div class="challenge-art-answers">
                    ${options.map((answer) => `
                        <button type="button"
                            class="challenge-art-answer"
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
            : `Quase! ${feedback.table} × ${feedback.multiplier} = ${feedback.expected}`;
        return `
            <div class="challenge-dynamic-layer challenge-feedback-layer ${feedback.isCorrect ? "is-correct" : "is-wrong"}">
                <div class="challenge-art-progress">Questão ${Math.min(session.plannedAnswered, 20)} de 20</div>
                <div class="challenge-art-question challenge-art-feedback">${message}</div>
                <button type="button" class="challenge-feedback-continue" data-action="continue-feedback">Continuar</button>
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
            const island = TQ.content.getIslandIdentity?.(session.regionId, session.islandId);
            const art = getChallengeArt(session);

            if (art) {
                screen.classList.add("challenge-art-screen");
                screen.dataset.regionId = String(session.regionId);
                screen.dataset.islandId = String(session.islandId);
                screen.innerHTML = `
                    <main class="challenge-art-stage">
                        <img class="challenge-art-background"
                            src="${art}"
                            alt=""
                            aria-hidden="true">
                        <button type="button"
                            class="challenge-art-back-hitbox"
                            data-action="back-islands"
                            aria-label="Voltar às Ilhas"></button>
                        <span class="visually-hidden">${region?.label || ""} — ${island?.label || ""}</span>
                        ${session.phase === "feedback" ? renderFeedback(session) : ""}
                        ${session.phase === "question" ? renderQuestion(session) : ""}
                        ${session.phase === "complete" ? `
                            <div class="challenge-dynamic-layer challenge-complete-layer">
                                <div class="challenge-art-question challenge-art-feedback">Desafio concluído!</div>
                                <button type="button" class="challenge-feedback-continue" data-action="finish-session">Ver resultado</button>
                            </div>
                        ` : ""}
                    </main>
                `;
            } else {
                screen.innerHTML = `
                    <header class="slice-header">
                        <button type="button" data-action="back-islands">← Ilhas</button>
                        <div>
                            <small>${region ? region.label : `Região ${session.regionId}`}</small>
                            <h1>${island?.label || `Ilha ${session.islandId}`}</h1>
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
                        TQ.content.getIslandRewards(result.regionId, result.islandId),
                        TQ.content.crewMembers,
                        TQ.content.gameplayRewards,
                        TQ.content
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
                    TQ.content.getIslandRewards(result.regionId, result.islandId),
                    TQ.content.crewMembers,
                    TQ.content.gameplayRewards,
                    TQ.content
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
