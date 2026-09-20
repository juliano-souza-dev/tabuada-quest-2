const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/domain/scheduler.js");
require("../../web/js/domain/gameplay-session.js");

const scheduler = globalThis.TabuadaQuest.domain.scheduler;
const gameplay = globalThis.TabuadaQuest.domain.gameplay;

test("island session starts from the real scheduler plan", () => {
    let session = gameplay.createIslandSession(1, 1, "slice");
    let regionState = gameplay.createRegionState(1);
    ({ session, regionState } = gameplay.prepareNextChallenge(session, regionState));

    assert.equal(session.currentChallenge.regionId, 1);
    assert.equal(session.currentChallenge.islandId, 1);
    assert.equal(session.currentChallenge.exposureType, scheduler.EXPOSURE_TYPE.PLANNED);
    assert.equal(gameplay.createAnswerOptions(session).includes(
        session.currentChallenge.table * session.currentChallenge.multiplier
    ), true);
});

test("wrong answer schedules recovery without consuming an extra planned exposure", () => {
    let session = gameplay.createIslandSession(1, 1, "recovery");
    let regionState = gameplay.createRegionState(1);
    ({ session, regionState } = gameplay.prepareNextChallenge(session, regionState));

    const challenge = session.currentChallenge;
    ({ session, regionState } = gameplay.answerCurrentChallenge(session, regionState, -1));

    assert.equal(session.wrongAnswers, 1);
    assert.equal(session.plannedAnswered, 1);
    assert.equal(regionState.plannedExposureCount, 1);
    assert.equal(regionState.recoveryAttemptCount, 0);
    assert.equal(regionState.recoveryQueue.length, 1);
    assert.equal(regionState.mastery[`${challenge.table}x${challenge.multiplier}`].correctStreak, 0);
});

test("a full island completes after exactly 20 planned questions while preserving region learning state", () => {
    let session = gameplay.createIslandSession(11, 1, "full-island");
    let regionState = gameplay.createRegionState(11);

    while (session.phase !== "complete") {
        if (session.phase === "question") {
            ({ session, regionState } = gameplay.prepareNextChallenge(session, regionState));
            if (session.phase === "complete") break;
            const challenge = session.currentChallenge;
            const answer = challenge.table * challenge.multiplier;
            ({ session, regionState } = gameplay.answerCurrentChallenge(session, regionState, answer));
        } else if (session.phase === "feedback") {
            ({ session, regionState } = gameplay.continueAfterFeedback(session, regionState));
        }
    }

    const result = gameplay.buildResult(session);
    assert.equal(result.plannedAnswered, 20);
    assert.equal(result.wrongAnswers, 0);
    assert.equal(regionState.plannedExposureCount, 20);
    assert.equal(regionState.recoveryAttemptCount, 0);
});
