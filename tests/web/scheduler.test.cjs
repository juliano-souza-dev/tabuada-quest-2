const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/domain/scheduler.js");

const scheduler = globalThis.TabuadaQuest.domain.scheduler;

function operationCounts(slots) {
    return scheduler.summarizeSlots(slots).byOperation;
}

test("scheduler exposes the approved 11-region configuration", () => {
    assert.equal(scheduler.TOTAL_REGIONS, 11);
    assert.equal(scheduler.ISLANDS_PER_REGION, 10);
    assert.deepEqual(
        Array.from({ length: 11 }, (_, i) => scheduler.getRegionConfig(i + 1).k),
        [2,2,3,3,4,4,5,5,10,10,10]
    );
    assert.deepEqual(
        Array.from({ length: 11 }, (_, i) => scheduler.getRegionConfig(i + 1).recoveryGap),
        [2,2,3,3,4,4,5,5,6,6,6]
    );
});

test("every island contains exactly 20 planned exposures and exactly K tables", () => {
    for (let regionId = 1; regionId <= 11; regionId += 1) {
        const region = scheduler.createRegionPlan(regionId, "quota-check");
        const expectedK = scheduler.getRegionConfig(regionId).k;

        for (const island of region.islands) {
            assert.equal(island.slots.length, 20);
            assert.ok(island.slots.every((slot) => slot.exposureType === "PLANNED"));
            assert.equal(new Set(island.slots.map((slot) => slot.table)).size, expectedK);

            for (let i = 1; i < island.slots.length; i += 1) {
                assert.notEqual(island.slots[i].table, island.slots[i - 1].table);
            }
        }
    }
});

test("every region has 200 planned exposures, 20 per table and 2 per operation", () => {
    for (let regionId = 1; regionId <= 11; regionId += 1) {
        const slots = scheduler.flattenRegionPlan(
            scheduler.createRegionPlan(regionId, "region-invariants")
        );
        const summary = scheduler.summarizeSlots(slots);

        assert.equal(summary.total, 200);

        for (let table = 1; table <= 10; table += 1) {
            assert.equal(summary.byTable[String(table)], 20);
            for (let multiplier = 1; multiplier <= 10; multiplier += 1) {
                assert.equal(summary.byOperation[`${table}x${multiplier}`], 2);
            }
        }
    }
});

test("campaign has 2200 planned exposures, 220 per table and 22 per operation", () => {
    const slots = scheduler.flattenCampaignPlan(
        scheduler.createCampaignPlan("campaign-invariants")
    );
    const summary = scheduler.summarizeSlots(slots);

    assert.equal(summary.total, 2200);

    for (let table = 1; table <= 10; table += 1) {
        assert.equal(summary.byTable[String(table)], 220);
        for (let multiplier = 1; multiplier <= 10; multiplier += 1) {
            assert.equal(summary.byOperation[`${table}x${multiplier}`], 22);
        }
    }
});

test("same seed is reproducible and a different seed only changes order", () => {
    const a = scheduler.createIslandPlan(5, 4, "seed-a").slots;
    const b = scheduler.createIslandPlan(5, 4, "seed-a").slots;
    const c = scheduler.createIslandPlan(5, 4, "seed-b").slots;

    assert.deepEqual(a.map((slot) => slot.id), b.map((slot) => slot.id));
    assert.notDeepEqual(a.map((slot) => slot.id), c.map((slot) => slot.id));

    assert.deepEqual(
        [...a.map((slot) => slot.id)].sort(),
        [...c.map((slot) => slot.id)].sort()
    );
});

test("planned and recovery counters stay independent", () => {
    const state0 = scheduler.createRecoveryState(1);
    const planned = {
        table: 7,
        multiplier: 8,
        exposureType: scheduler.EXPOSURE_TYPE.PLANNED
    };

    const state1 = scheduler.recordAttempt(state0, planned, false);
    assert.equal(state1.plannedExposureCount, 1);
    assert.equal(state1.recoveryAttemptCount, 0);
    assert.equal(state1.mastery["7x8"].correctStreak, 0);
    assert.equal(state1.recoveryQueue.length, 1);
    assert.equal(state1.recoveryQueue[0].remainingGap, 2);

    const other1 = { table: 2, multiplier: 3, exposureType: "PLANNED" };
    const other2 = { table: 4, multiplier: 5, exposureType: "PLANNED" };
    const state2 = scheduler.recordAttempt(state1, other1, true);
    const state3 = scheduler.recordAttempt(state2, other2, true);

    assert.equal(state3.recoveryQueue[0].remainingGap, 0);

    const taken = scheduler.dequeueEligibleRecovery(state3);
    assert.equal(taken.challenge.exposureType, "RECOVERY");
    assert.equal(taken.challenge.table, 7);
    assert.equal(taken.challenge.multiplier, 8);

    const state4 = scheduler.recordAttempt(taken.state, taken.challenge, true);
    assert.equal(state4.plannedExposureCount, 3);
    assert.equal(state4.recoveryAttemptCount, 1);
    assert.equal(state4.mastery["7x8"].correctStreak, 1);
    assert.equal(state4.recoveryQueue.length, 1);
});

test("two consecutive correct answers master an operation and cancel pending recovery", () => {
    let state = scheduler.createRecoveryState(1);
    const planned = { table: 3, multiplier: 6, exposureType: "PLANNED" };

    state = scheduler.recordAttempt(state, planned, false);
    state = scheduler.relaxRecoveryAtTerminal(state);

    let taken = scheduler.dequeueEligibleRecovery(state);
    state = scheduler.recordAttempt(taken.state, taken.challenge, true);

    state = scheduler.relaxRecoveryAtTerminal(state);
    taken = scheduler.dequeueEligibleRecovery(state);
    state = scheduler.recordAttempt(taken.state, taken.challenge, true);

    assert.equal(state.mastery["3x6"].correctStreak, 2);
    assert.equal(state.recoveryQueue.length, 0);
    assert.equal(state.plannedExposureCount, 1);
    assert.equal(state.recoveryAttemptCount, 2);
});

test("an error never changes the planned matrix itself", () => {
    const planBefore = scheduler.createRegionPlan(11, "immutable-plan");
    const idsBefore = scheduler.flattenRegionPlan(planBefore).map((slot) => slot.id);

    let state = scheduler.createRecoveryState(11);
    state = scheduler.recordAttempt(state, planBefore.islands[0].slots[0], false);

    const planAfter = scheduler.createRegionPlan(11, "immutable-plan");
    const idsAfter = scheduler.flattenRegionPlan(planAfter).map((slot) => slot.id);

    assert.deepEqual(idsAfter, idsBefore);
    assert.equal(idsAfter.length, 200);
    assert.equal(state.plannedExposureCount, 1);
    assert.equal(state.recoveryAttemptCount, 0);
});

test("an all-correct region reaches complete mastery with exactly 200 planned attempts", () => {
    const slots = scheduler.flattenRegionPlan(
        scheduler.createRegionPlan(11, "all-correct")
    );
    let state = scheduler.createRecoveryState(11);

    for (const slot of slots) {
        state = scheduler.recordAttempt(state, slot, true);
    }

    assert.equal(state.plannedExposureCount, 200);
    assert.equal(state.recoveryAttemptCount, 0);
    assert.equal(state.recoveryQueue.length, 0);
    assert.ok(Object.values(state.mastery).every((item) => item.correctStreak === 2));
    assert.equal(scheduler.isRegionPedagogicallyComplete(state), true);
});
