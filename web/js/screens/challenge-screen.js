(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_CHALLENGE_ART_LAYOUT = Object.freeze({
        progress: Object.freeze({ x: 20.5, y: 40.2, width: 59, height: 4.2 }),
        question: Object.freeze({ x: 14.5, y: 44.6, width: 71, height: 16.5 }),
        answers: Object.freeze({
            x: 17,
            y: 63,
            width: 66,
            height: 16.5,
            columnGap: 5.5,
            rowGap: 8
        }),
        font: Object.freeze({
            progress: 3.15,
            question: 8.6,
            answer: 5.7,
            feedback: 5.1
        }),
        progressMask: false
    });

    const CHALLENGE_ART_LAYOUTS = Object.freeze({
        1: Object.freeze({
            1: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 45.2, width: 57.5, height: 17.4 }),
                answers: Object.freeze({
                    x: 14, y: 64.7, width: 72, height: 20.9,
                    columnGap: 5.8, rowGap: 5.8
                }),
                font: Object.freeze({
                    progress: 0,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            2: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 26.2, width: 58, height: 26.8 }),
                answers: Object.freeze({
                    x: 8.5, y: 64.2, width: 83, height: 28.4,
                    columnGap: 6.2, rowGap: 5.6
                }),
                font: Object.freeze({
                    progress: 0,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            3: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 42.6, width: 57.5, height: 16.6 }),
                answers: Object.freeze({
                    x: 20.5, y: 60, width: 59.5, height: 22.4,
                    columnGap: 5.5, rowGap: 4.8
                }),
                font: Object.freeze({
                    progress: 0,
                    question: 8.35,
                    answer: 5.45,
                    feedback: 4.85
                }),
                progressMask: false
            }),
            4: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 39.1, width: 57.5, height: 18 }),
                answers: Object.freeze({
                    x: 15, y: 59.2, width: 70, height: 22.5,
                    columnGap: 5.5, rowGap: 4.8
                }),
                font: Object.freeze({
                    progress: 0,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            5: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21, y: 42.8, width: 58.5, height: 16.9 }),
                answers: Object.freeze({
                    x: 20.2, y: 60.8, width: 60.2, height: 21,
                    columnGap: 5.2, rowGap: 4.8
                }),
                font: Object.freeze({
                    progress: 0,
                    question: 8.3,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            })
        }),
        2: Object.freeze({
                progress: Object.freeze({ x: 21.4, y: 39.36, width: 57.2, height: 3.9 }),
                question: Object.freeze({ x: 14.6, y: 44.25, width: 71.1, height: 16.4 }),
                answers: Object.freeze({
                    x: 17.35,
                    y: 62.95,
                    width: 65.2,
                    height: 15.85,
                    columnGap: 6.3,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            3: Object.freeze({
                progress: Object.freeze({ x: 21.8, y: 38.15, width: 56.8, height: 6.4 }),
                question: Object.freeze({ x: 14.9, y: 44.75, width: 70.2, height: 16.4 }),
                answers: Object.freeze({
                    x: 18.15,
                    y: 61.85,
                    width: 63.7,
                    height: 16.7,
                    columnGap: 5.2,
                    rowGap: 5.4
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.35,
                    answer: 5.45,
                    feedback: 4.85
                }),
                progressMask: false
            }),
            4: Object.freeze({
                progress: Object.freeze({ x: 21.8, y: 39.55, width: 56.4, height: 3.85 }),
                question: Object.freeze({ x: 14.7, y: 44.1, width: 71, height: 16.25 }),
                answers: Object.freeze({
                    x: 18.35,
                    y: 62.55,
                    width: 63.3,
                    height: 16.15,
                    columnGap: 6,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            5: Object.freeze({
                progress: Object.freeze({ x: 22.4, y: 40, width: 55.4, height: 3.8 }),
                question: Object.freeze({ x: 14, y: 44.75, width: 72, height: 16.9 }),
                answers: Object.freeze({
                    x: 16.75,
                    y: 63.55,
                    width: 66.1,
                    height: 16.2,
                    columnGap: 5.6,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.3,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            })
        }),
        2: Object.freeze({
            1: Object.freeze({
                progress: Object.freeze({ x: 21.5, y: 35, width: 56.5, height: 3.8 }),
                question: Object.freeze({ x: 14.5, y: 40.2, width: 71, height: 16.5 }),
                answers: Object.freeze({
                    x: 16,
                    y: 58.5,
                    width: 68,
                    height: 16.5,
                    columnGap: 5.7,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.35,
                    answer: 5.55,
                    feedback: 4.9
                }),
                progressMask: false
            }),
            2: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 42.2, width: 59, height: 3.6 }),
                question: Object.freeze({ x: 13.5, y: 46.5, width: 73, height: 16.3 }),
                answers: Object.freeze({
                    x: 15,
                    y: 64,
                    width: 70,
                    height: 16,
                    columnGap: 5.5,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.2,
                    answer: 5.45,
                    feedback: 4.8
                }),
                progressMask: false
            }),
            3: Object.freeze({
                progress: Object.freeze({ x: 21, y: 41.3, width: 58, height: 3.8 }),
                question: Object.freeze({ x: 14.2, y: 45.8, width: 71.6, height: 16 }),
                answers: Object.freeze({
                    x: 16.2,
                    y: 63,
                    width: 67.6,
                    height: 15.8,
                    columnGap: 5.7,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.2,
                    answer: 5.45,
                    feedback: 4.8
                }),
                progressMask: false
            }),
            4: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 40.2, width: 59, height: 3.8 }),
                question: Object.freeze({ x: 14.2, y: 44.9, width: 71.6, height: 16.2 }),
                answers: Object.freeze({
                    x: 16,
                    y: 62,
                    width: 68,
                    height: 16,
                    columnGap: 5.7,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.2,
                    answer: 5.45,
                    feedback: 4.8
                }),
                progressMask: false
            }),
            5: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 37.7, width: 59, height: 3.7 }),
                question: Object.freeze({ x: 13.5, y: 42, width: 73, height: 16.5 }),
                answers: Object.freeze({
                    x: 15.5,
                    y: 60.3,
                    width: 69,
                    height: 16.2,
                    columnGap: 5.7,
                    rowGap: 8
                }),
                font: Object.freeze({
                    progress: 3,
                    question: 8.2,
                    answer: 5.45,
                    feedback: 4.8
                }),
                progressMask: false
            })
        })
    });

    function getChallengeArt(session) {
        if (!session) return null;
        const regionId = Number(session.regionId);
        const islandId = Number(session.islandId);
        const regionAssets = TQ.content.assets?.[`region${regionId}ChallengeArt`];
        return regionAssets?.[islandId] || null;
    }

    function getChallengeArtLayout(regionId, islandId) {
        return CHALLENGE_ART_LAYOUTS[Number(regionId)]?.[Number(islandId)]
            || DEFAULT_CHALLENGE_ART_LAYOUT;
    }

    function toLayoutStyle(layout) {
        const progress = layout.progress;
        const question = layout.question;
        const answers = layout.answers;
        const font = layout.font;

        return [
            `--challenge-progress-x:${progress.x}%`,
            `--challenge-progress-y:${progress.y}%`,
            `--challenge-progress-w:${progress.width}%`,
            `--challenge-progress-h:${progress.height}%`,
            `--challenge-question-x:${question.x}%`,
            `--challenge-question-y:${question.y}%`,
            `--challenge-question-w:${question.width}%`,
            `--challenge-question-h:${question.height}%`,
            `--challenge-answers-x:${answers.x}%`,
            `--challenge-answers-y:${answers.y}%`,
            `--challenge-answers-w:${answers.width}%`,
            `--challenge-answers-h:${answers.height}%`,
            `--challenge-answer-column-gap:${answers.columnGap}%`,
            `--challenge-answer-row-gap:${answers.rowGap}%`,
            `--challenge-progress-font:${font.progress}cqw`,
            `--challenge-question-font:${font.question}cqw`,
            `--challenge-answer-font:${font.answer}cqw`,
            `--challenge-feedback-font:${font.feedback}cqw`
        ].join(";");
    }

    function progressPercent(questionNumber) {
        const normalizedQuestion = Math.max(1, Math.min(Number(questionNumber) || 1, 20));
        return (normalizedQuestion / 20) * 100;
    }

    function renderProgress(session, questionNumber) {
        const normalizedQuestion = Math.max(1, Math.min(Number(questionNumber) || 1, 20));
        return `
            <div class="challenge-art-progress"
                style="--challenge-progress-ratio:${progressPercent(normalizedQuestion) / 100}">
                <span>Questão ${normalizedQuestion} de 20</span>
            </div>
        `;
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
                ${renderProgress(session, session.plannedAnswered + 1)}
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

    function renderFeedback(state, session) {
        const feedback = session.lastFeedback;
        if (!feedback) return "";
        const type = feedback.isCorrect ? "correct" : "wrong";
        const effect = TQ.effects.resolveEquippedEffect(state, type);
        const detail = feedback.isCorrect
            ? ""
            : `${feedback.table} × ${feedback.multiplier} = ${feedback.expected}`;

        return `
            <div class="challenge-dynamic-layer challenge-feedback-layer ${feedback.isCorrect ? "is-correct" : "is-wrong"}">
                ${renderProgress(session, session.plannedAnswered)}
                ${TQ.core.challengeEffectRenderer.render(effect, { detail })}
                ${feedback.isCorrect ? "" : `
                    <button type="button" class="challenge-feedback-continue" data-action="continue-feedback">
                        Continuar
                    </button>
                `}
            </div>
        `;
    }

    function advanceAfterFeedback(state, session, onStateChange) {
        const regionState = TQ.domain.playerState.getRegionLearningState(state, session.regionId)
            || TQ.domain.gameplay.createRegionState(session.regionId);
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
            return;
        }

        onStateChange(TQ.domain.playerState.updateGameplaySession(
            state,
            next.session,
            next.regionState
        ));
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
            const artLayout = getChallengeArtLayout(session.regionId, session.islandId);

            if (art) {
                screen.classList.add("challenge-art-screen");
                screen.dataset.regionId = String(session.regionId);
                screen.dataset.islandId = String(session.islandId);
                screen.innerHTML = `
                    <main class="challenge-art-stage"
                        data-progress-mask="${artLayout.progressMask ? "true" : "false"}"
                        style="${toLayoutStyle(artLayout)}">
                        <img class="challenge-art-background"
                            src="${art}"
                            alt=""
                            aria-hidden="true">
                        <button type="button"
                            class="challenge-art-back-hitbox"
                            data-action="back-islands"
                            aria-label="Voltar às Ilhas"></button>
                        <span class="visually-hidden">${region?.label || ""} — ${island?.label || ""}</span>
                        ${session.phase === "feedback" ? renderFeedback(state, session) : ""}
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
                        ${session.phase === "feedback" ? renderFeedback(state, session) : ""}
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
                advanceAfterFeedback(state, session, onStateChange);
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

        if (session?.phase === "feedback" && session.lastFeedback?.isCorrect) {
            const effect = TQ.effects.resolveEquippedEffect(state, "correct");
            TQ.core.challengeEffectRenderer.scheduleAutoAdvance(
                screen,
                effect,
                () => advanceAfterFeedback(state, session, onStateChange)
            );
        }

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.challenge = Object.freeze({
        CHALLENGE_ART_LAYOUTS,
        DEFAULT_CHALLENGE_ART_LAYOUT,
        getChallengeArt,
        getChallengeArtLayout,
        renderChallengeScreen,
        renderFeedback,
        advanceAfterFeedback,
        progressPercent
    });
})(globalThis);
