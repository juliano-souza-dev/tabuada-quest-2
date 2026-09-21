(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const SESSION_VERSION = 1;

    function copySession(session, patch) {
        return Object.freeze({ ...session, ...patch });
    }

    function createIslandSession(regionId, islandId, seed) {
        TQ.domain.scheduler.getRegionConfig(regionId);
        if (!Number.isInteger(islandId) || islandId < 1 || islandId > TQ.domain.scheduler.ISLANDS_PER_REGION) {
            throw new RangeError(`islandId must be between 1 and ${TQ.domain.scheduler.ISLANDS_PER_REGION}`);
        }

        return Object.freeze({
            version: SESSION_VERSION,
            regionId,
            islandId,
            seed: String(seed || `region-${regionId}-island-${islandId}`),
            plannedCursor: 0,
            plannedAnswered: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            recoveryAnswers: 0,
            totalAttempts: 0,
            phase: "question",
            currentChallenge: null,
            lastFeedback: null
        });
    }

    function createRegionState(regionId) {
        return TQ.domain.scheduler.createRecoveryState(regionId);
    }

    function prepareNextChallenge(session, regionState) {
        if (session.phase !== "question" || session.currentChallenge) {
            return Object.freeze({ session, regionState });
        }

        const recovery = TQ.domain.scheduler.dequeueEligibleRecovery(regionState);
        if (recovery.challenge) {
            const challenge = Object.freeze({
                ...recovery.challenge,
                id: `r${session.regionId}-i${session.islandId}-recovery-${recovery.challenge.table}x${recovery.challenge.multiplier}-a${session.totalAttempts + 1}`
            });
            return Object.freeze({
                session: copySession(session, { currentChallenge: challenge }),
                regionState: recovery.state
            });
        }

        if (session.plannedCursor >= TQ.domain.scheduler.PLANNED_PER_ISLAND) {
            return Object.freeze({
                session: copySession(session, { phase: "complete" }),
                regionState
            });
        }

        const plan = TQ.domain.scheduler.createIslandPlan(session.regionId, session.islandId, session.seed);
        const challenge = plan.slots[session.plannedCursor];

        return Object.freeze({
            session: copySession(session, {
                plannedCursor: session.plannedCursor + 1,
                currentChallenge: challenge
            }),
            regionState
        });
    }

    function answerCurrentChallenge(session, regionState, answer) {
        if (session.phase !== "question" || !session.currentChallenge) {
            throw new Error("No active challenge to answer");
        }

        const challenge = session.currentChallenge;
        const expected = challenge.table * challenge.multiplier;
        const received = Number(answer);
        const isCorrect = Number.isFinite(received) && received === expected;
        const nextRegionState = TQ.domain.scheduler.recordAttempt(regionState, challenge, isCorrect);
        const isPlanned = challenge.exposureType === TQ.domain.scheduler.EXPOSURE_TYPE.PLANNED;

        return Object.freeze({
            session: copySession(session, {
                plannedAnswered: session.plannedAnswered + (isPlanned ? 1 : 0),
                correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
                wrongAnswers: session.wrongAnswers + (isCorrect ? 0 : 1),
                recoveryAnswers: session.recoveryAnswers + (isPlanned ? 0 : 1),
                totalAttempts: session.totalAttempts + 1,
                phase: "feedback",
                currentChallenge: null,
                lastFeedback: Object.freeze({
                    table: challenge.table,
                    multiplier: challenge.multiplier,
                    expected,
                    received,
                    isCorrect,
                    exposureType: challenge.exposureType
                })
            }),
            regionState: nextRegionState
        });
    }

    function continueAfterFeedback(session, regionState) {
        if (session.phase !== "feedback") return Object.freeze({ session, regionState });

        if (session.plannedAnswered >= TQ.domain.scheduler.PLANNED_PER_ISLAND) {
            return Object.freeze({
                session: copySession(session, {
                    phase: "complete",
                    lastFeedback: null
                }),
                regionState
            });
        }

        return prepareNextChallenge(
            copySession(session, { phase: "question", lastFeedback: null }),
            regionState
        );
    }

    function hash(value) {
        const text = String(value);
        let h = 2166136261;
        for (let i = 0; i < text.length; i += 1) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function createAnswerOptions(session) {
        const challenge = session.currentChallenge;
        if (!challenge) return Object.freeze([]);

        const correct = challenge.table * challenge.multiplier;
        const candidates = [
            correct,
            correct + challenge.table,
            correct - challenge.table,
            correct + challenge.multiplier,
            correct - challenge.multiplier,
            correct + 1,
            correct - 1,
            correct + 10,
            correct - 10
        ].filter((value) => Number.isInteger(value) && value > 0);

        const unique = Array.from(new Set(candidates));
        let filler = 2;
        while (unique.length < 4) {
            if (!unique.includes(correct + filler)) unique.push(correct + filler);
            filler += 1;
        }

        const options = unique.slice(0, 4);
        let state = hash(`${session.seed}:${challenge.id}:${session.totalAttempts}`);
        for (let i = options.length - 1; i > 0; i -= 1) {
            state = (Math.imul(state ^ (state >>> 15), 1 | state) + 0x6D2B79F5) >>> 0;
            const j = state % (i + 1);
            [options[i], options[j]] = [options[j], options[i]];
        }

        return Object.freeze(options);
    }

    function buildResult(session) {
        if (session.phase !== "complete") throw new Error("Session is not complete");
        return Object.freeze({
            regionId: session.regionId,
            islandId: session.islandId,
            plannedAnswered: session.plannedAnswered,
            correctAnswers: session.correctAnswers,
            wrongAnswers: session.wrongAnswers,
            recoveryAnswers: session.recoveryAnswers,
            totalAttempts: session.totalAttempts
        });
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.gameplay = Object.freeze({
        SESSION_VERSION,
        createIslandSession,
        createRegionState,
        prepareNextChallenge,
        answerCurrentChallenge,
        continueAfterFeedback,
        createAnswerOptions,
        buildResult
    });
})(globalThis);
