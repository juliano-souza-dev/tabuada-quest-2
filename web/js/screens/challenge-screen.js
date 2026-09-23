(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const loadedChallengeArtUrls = new Set();
    const challengeArtPreloads = new Map();

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

    // Calibração por ilha: caixas em % do stage 9:16; gaps em % da grade de respostas.
    // As caixas delimitam o interior das placas (texto e hitbox compartilham o centro).
    const CHALLENGE_ART_LAYOUTS = Object.freeze({
        1: Object.freeze({
            1: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 22.7, y: 27.0, width: 57.9, height: 12.9 }),
                questionOffsetY: 0,
                answers: Object.freeze({ x: 14, y: 64.7, width: 72, height: 20.9, columnGap: 5.8, rowGap: 5.8 }),
                answerOffsetY: 0,
                font: Object.freeze({ progress: 0, question: 8.35, answer: 5.55, feedback: 4.9 }),
                progressMask: false
            }),
            2: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 22, y: 32.5, width: 56, height: 18 }),
                questionOffsetY: -6,
                answers: Object.freeze({ x: 10, y: 67, width: 80, height: 23.7, columnGap: 10.2, rowGap: 30 }),
                answerOffsetY: 0,
                font: Object.freeze({ progress: 0, question: 8.35, answer: 5.55, feedback: 4.9 }),
                progressMask: false
            }),
            3: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 42.6, width: 56, height: 16.6 }),
                questionOffsetY: -6,
                answers: Object.freeze({ x: 20, y: 63.2, width: 61, height: 18.4, columnGap: 7.8, rowGap: 16 }),
                answerOffsetY: 0,
                font: Object.freeze({ progress: 0, question: 8.35, answer: 5.45, feedback: 4.85 }),
                progressMask: false
            }),
            4: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 41.3, width: 56, height: 15 }),
                questionOffsetY: 0,
                answers: Object.freeze({ x: 18, y: 62.5, width: 64, height: 17.9, columnGap: 7.8, rowGap: 19 }),
                answerOffsetY: 0,
                font: Object.freeze({ progress: 0, question: 8.35, answer: 5.55, feedback: 4.9 }),
                progressMask: false
            }),
            5: Object.freeze({
                progress: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
                question: Object.freeze({ x: 21.5, y: 42.3, width: 56, height: 16 }),
                questionOffsetY: -6,
                answers: Object.freeze({ x: 20.3, y: 62.8, width: 59, height: 17.8, columnGap: 8.5, rowGap: 19 }),
                answerOffsetY: 0,
                font: Object.freeze({ progress: 0, question: 8.3, answer: 5.55, feedback: 4.9 }),
                progressMask: false
            })
        }),
        2: Object.freeze({
            1: Object.freeze({
                progress: Object.freeze({ x: 21.5, y: 35, width: 56.5, height: 3.8 }),
                question: Object.freeze({ x: 14.5, y: 40.2, width: 71, height: 16.5 }),
                answers: Object.freeze({ x: 16, y: 58.5, width: 68, height: 16.5, columnGap: 5.7, rowGap: 8 }),
                font: Object.freeze({ progress: 3, question: 8.35, answer: 5.55, feedback: 4.9 }),
                progressMask: false
            }),
            2: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 42.2, width: 59, height: 3.6 }),
                question: Object.freeze({ x: 13.5, y: 46.5, width: 73, height: 16.3 }),
                answers: Object.freeze({ x: 15, y: 64, width: 70, height: 16, columnGap: 5.5, rowGap: 8 }),
                font: Object.freeze({ progress: 3, question: 8.2, answer: 5.45, feedback: 4.8 }),
                progressMask: false
            }),
            3: Object.freeze({
                progress: Object.freeze({ x: 21, y: 41.3, width: 58, height: 3.8 }),
                question: Object.freeze({ x: 14.2, y: 45.8, width: 71.6, height: 16 }),
                answers: Object.freeze({ x: 16.2, y: 63, width: 67.6, height: 15.8, columnGap: 5.7, rowGap: 8 }),
                font: Object.freeze({ progress: 3, question: 8.2, answer: 5.45, feedback: 4.8 }),
                progressMask: false
            }),
            4: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 40.2, width: 59, height: 3.8 }),
                question: Object.freeze({ x: 14.2, y: 44.9, width: 71.6, height: 16.2 }),
                answers: Object.freeze({ x: 16, y: 62, width: 68, height: 16, columnGap: 5.7, rowGap: 8 }),
                font: Object.freeze({ progress: 3, question: 8.2, answer: 5.45, feedback: 4.8 }),
                progressMask: false
            }),
            5: Object.freeze({
                progress: Object.freeze({ x: 20.5, y: 37.7, width: 59, height: 3.7 }),
                question: Object.freeze({ x: 13.5, y: 42, width: 73, height: 16.5 }),
                answers: Object.freeze({ x: 15.5, y: 60.3, width: 69, height: 16.2, columnGap: 5.7, rowGap: 8 }),
                font: Object.freeze({ progress: 3, question: 8.2, answer: 5.45, feedback: 4.8 }),
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

    function isChallengeArtLoaded(sessionOrArt) {
        const art = typeof sessionOrArt === "string"
            ? sessionOrArt
            : getChallengeArt(sessionOrArt);
        return Boolean(art && loadedChallengeArtUrls.has(art));
    }

    function preloadChallengeArt(session) {
        const art = getChallengeArt(session);
        if (!art) return Promise.resolve(false);
        if (loadedChallengeArtUrls.has(art)) return Promise.resolve(true);
        if (challengeArtPreloads.has(art)) return challengeArtPreloads.get(art);
        if (typeof root.Image !== "function") return Promise.resolve(false);

        const request = new Promise((resolve) => {
            const image = new root.Image();
            let settled = false;

            function finish(success) {
                if (settled) return;
                settled = true;
                if (success) loadedChallengeArtUrls.add(art);
                resolve(success);
            }

            image.addEventListener("load", () => {
                if (typeof image.decode === "function") {
                    image.decode().catch(() => {}).then(() => finish(true));
                    return;
                }
                finish(true);
            }, { once: true });

            image.addEventListener("error", () => finish(false), { once: true });
            image.src = art;

            if (image.complete && image.naturalWidth > 0) {
                if (typeof image.decode === "function") {
                    image.decode().catch(() => {}).then(() => finish(true));
                } else {
                    finish(true);
                }
            }
        }).then((success) => {
            challengeArtPreloads.delete(art);
            return success;
        });

        challengeArtPreloads.set(art, request);
        return request;
    }

    function mountChallengeArtLoadingAnimation(screen) {
        const host = screen.querySelector(".challenge-art-loading-animation");
        if (!host) return () => {};

        const colombo = TQ.content.shopCatalog?.ships?.find((item) => item.id === "ship-colombo") || null;
        const animationUrl = colombo?.travelAnimation;
        const shipAsset = colombo?.asset;
        let animation = null;
        let disposed = false;

        function renderAssetFallback() {
            if (disposed || !shipAsset) return;
            host.replaceChildren();
            const image = document.createElement("img");
            image.className = "challenge-loading-colombo-fallback";
            image.src = shipAsset;
            image.alt = "";
            image.setAttribute("aria-hidden", "true");
            host.appendChild(image);
        }

        if (animationUrl && root.lottie?.loadAnimation) {
            try {
                const resolvedAnimationUrl = new URL(animationUrl, document.baseURI);
                animation = root.lottie.loadAnimation({
                    container: host,
                    renderer: "svg",
                    loop: true,
                    autoplay: true,
                    path: resolvedAnimationUrl.href,
                    assetsPath: new URL("./images/", resolvedAnimationUrl).href,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                        progressiveLoad: true
                    }
                });
                animation.addEventListener("data_failed", renderAssetFallback);
                animation.addEventListener("error", renderAssetFallback);
            } catch (_) {
                renderAssetFallback();
            }
        } else {
            renderAssetFallback();
        }

        return () => {
            if (disposed) return;
            disposed = true;
            if (animation) {
                try { animation.destroy(); } catch (_) {}
                animation = null;
            }
            host.replaceChildren();
        };
    }

    function armChallengeArtReveal(screen, art, disposeLoader = () => {}) {
        const background = screen.querySelector(".challenge-art-background");
        if (!background) return;

        let revealed = false;
        let fallbackTimer = null;

        function reveal(success) {
            if (revealed) return;
            revealed = true;
            if (fallbackTimer !== null) root.clearTimeout(fallbackTimer);
            disposeLoader();
            if (success) loadedChallengeArtUrls.add(art);

            const applyReadyState = () => {
                screen.classList.remove("is-art-loading");
                screen.classList.add("is-art-ready");
            };

            if (typeof root.requestAnimationFrame === "function") {
                root.requestAnimationFrame(applyReadyState);
            } else {
                applyReadyState();
            }
        }

        function revealDecoded() {
            if (typeof background.decode === "function") {
                background.decode().catch(() => {}).then(() => reveal(true));
                return;
            }
            reveal(true);
        }

        background.addEventListener("load", revealDecoded, { once: true });
        background.addEventListener("error", () => reveal(false), { once: true });

        if (background.complete && background.naturalWidth > 0) {
            revealDecoded();
        }

        fallbackTimer = root.setTimeout(() => reveal(false), 8000);
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
            ...(layout.questionOffsetX === undefined ? [] : [`--tabuada-pergunta-offset-x:${layout.questionOffsetX}px`]),
            ...(layout.questionOffsetY === undefined ? [] : [`--tabuada-pergunta-offset-y:${layout.questionOffsetY}px`]),
            `--challenge-answers-x:${answers.x}%`,
            `--challenge-answers-y:${answers.y}%`,
            `--challenge-answers-w:${answers.width}%`,
            `--challenge-answers-h:${answers.height}%`,
            `--challenge-answer-column-gap:${answers.columnGap}%`,
            `--challenge-answer-row-gap:${answers.rowGap}%`,
            ...(layout.answerOffsetX === undefined ? [] : [`--tabuada-opcao-numero-offset-x:${layout.answerOffsetX}px`]),
            ...(layout.answerOffsetY === undefined ? [] : [`--tabuada-opcao-numero-offset-y:${layout.answerOffsetY}px`]),
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
                    <span class="tabuada-pergunta-numero">${challenge.table} × ${challenge.multiplier} = ?</span>
                </div>
                <div class="challenge-art-answers">
                    ${options.map((answer) => `
                        <button type="button"
                            class="challenge-art-answer tabuada-opcao"
                            data-answer="${answer}">
                            <span class="numero">${answer}</span>
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
                const artAlreadyLoaded = isChallengeArtLoaded(art);
                screen.classList.add(
                    "challenge-art-screen",
                    artAlreadyLoaded ? "is-art-ready" : "is-art-loading"
                );
                screen.dataset.regionId = String(session.regionId);
                screen.dataset.islandId = String(session.islandId);
                screen.style.setProperty("--challenge-bleed-image", `url("${art}")`);
                screen.innerHTML = `
                    <div class="tq-safe-visual-area">
                    <main class="challenge-art-stage tq-canonical-stage"
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
                    </div>
                    ${artAlreadyLoaded ? "" : `
                    <div class="challenge-art-loading" role="status" aria-live="polite">
                        <div class="challenge-art-loading-animation" aria-hidden="true"></div>
                        <span class="visually-hidden">Carregando desafio</span>
                    </div>
                    `}
                `;
                TQ.core.safeViewport.bindCanonicalStage(
                    screen.querySelector(".tq-safe-visual-area"),
                    screen.querySelector(".challenge-art-stage")
                );
                if (!artAlreadyLoaded) {
                    const disposeLoader = mountChallengeArtLoadingAnimation(screen);
                    armChallengeArtReveal(screen, art, disposeLoader);
                }
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
        isChallengeArtLoaded,
        preloadChallengeArt,
        getChallengeArtLayout,
        renderChallengeScreen,
        renderFeedback,
        advanceAfterFeedback,
        progressPercent
    });
})(globalThis);
