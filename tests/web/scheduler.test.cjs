const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/scheduler.js");

const world = globalThis.TabuadaQuest.domain.worldStructure;
const scheduler = globalThis.TabuadaQuest.domain.scheduler;

test("macroestrutura canônica é 22x5 com 110 Ilhas", () => {
    assert.equal(world.TOTAL_REGIONS, 22);
    assert.equal(world.ISLANDS_PER_REGION, 5);
    assert.equal(world.TOTAL_ISLANDS, 110);
    assert.deepEqual(world.fromGlobalIslandIndex(6), { globalIslandIndex: 6, regionId: 2, islandId: 1 });
    assert.equal(world.toGlobalIslandIndex(22, 5), 110);
});

test("scheduler usa 22 Regiões e 5 Ilhas mantendo a curva global", () => {
    assert.equal(scheduler.TOTAL_REGIONS, 22);
    assert.equal(scheduler.ISLANDS_PER_REGION, 5);
    assert.deepEqual(
        Array.from({ length: 22 }, (_, i) => scheduler.getRegionConfig(i + 1).k),
        [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,10,10,10,10,10,10]
    );
    assert.deepEqual(
        Array.from({ length: 22 }, (_, i) => scheduler.getRegionConfig(i + 1).recoveryGap),
        [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,6,6]
    );
});

test("cada Ilha mantém 20 exposições e cada Região possui 100", () => {
    for (let regionId = 1; regionId <= 22; regionId += 1) {
        const region = scheduler.createRegionPlan(regionId, "quota");
        assert.equal(region.islands.length, 5);
        assert.equal(scheduler.flattenRegionPlan(region).length, 100);
        for (const island of region.islands) {
            assert.equal(island.slots.length, 20);
            assert.ok(island.slots.every((slot) => slot.exposureType === "PLANNED"));
        }
    }
});

test("campanha preserva exatamente 2200 exposições e cobertura histórica", () => {
    const slots = scheduler.flattenCampaignPlan(scheduler.createCampaignPlan("campaign"));
    const summary = scheduler.summarizeSlots(slots);
    assert.equal(summary.total, 2200);
    for (let table = 1; table <= 10; table += 1) {
        assert.equal(summary.byTable[String(table)], 220);
        for (let multiplier = 1; multiplier <= 10; multiplier += 1) {
            assert.equal(summary.byOperation[`${table}x${multiplier}`], 22);
        }
    }
});

test("posição global preserva a rotação pedagógica ao cruzar Região", () => {
    const before = scheduler.createIslandPlan(1, 5, "x");
    const after = scheduler.createIslandPlan(2, 1, "x");
    assert.equal(before.globalIslandIndex, 5);
    assert.equal(after.globalIslandIndex, 6);
    assert.deepEqual([...new Set(before.slots.map((slot) => slot.table))], [5,6]);
    assert.deepEqual([...new Set(after.slots.map((slot) => slot.table))], [6,7]);
});

test("recovery continua ao trocar de Região e adota o gap da nova etapa", () => {
    let state = scheduler.createRecoveryState(1);
    state = scheduler.recordAttempt(state, {
        table: 7,
        multiplier: 8,
        exposureType: scheduler.EXPOSURE_TYPE.PLANNED
    }, false);
    const queueBefore = state.recoveryQueue;
    state = scheduler.retargetRecoveryState(state, 5);
    assert.equal(state.regionId, 5);
    assert.equal(state.recoveryGap, 3);
    assert.deepEqual(state.recoveryQueue, queueBefore);
    assert.equal(state.mastery["7x8"].correctStreak, 0);
});

test("mesma seed é reprodutível e seed diferente só altera ordem", () => {
    const a = scheduler.createIslandPlan(13, 4, "seed-a").slots;
    const b = scheduler.createIslandPlan(13, 4, "seed-a").slots;
    const c = scheduler.createIslandPlan(13, 4, "seed-b").slots;
    assert.deepEqual(a.map((slot) => slot.id), b.map((slot) => slot.id));
    assert.notDeepEqual(a.map((slot) => slot.id), c.map((slot) => slot.id));
    assert.deepEqual([...a.map((slot) => slot.id)].sort(), [...c.map((slot) => slot.id)].sort());
});

test("planned e recovery permanecem contadores independentes", () => {
    const state0 = scheduler.createRecoveryState(1);
    const state1 = scheduler.recordAttempt(state0, {
        table: 7,
        multiplier: 8,
        exposureType: scheduler.EXPOSURE_TYPE.PLANNED
    }, false);
    assert.equal(state1.plannedExposureCount, 1);
    assert.equal(state1.recoveryAttemptCount, 0);
    const relaxed = scheduler.relaxRecoveryAtTerminal(state1);
    const taken = scheduler.dequeueEligibleRecovery(relaxed);
    const state2 = scheduler.recordAttempt(taken.state, taken.challenge, true);
    assert.equal(state2.plannedExposureCount, 1);
    assert.equal(state2.recoveryAttemptCount, 1);
});

test("campanha totalmente correta fecha 2200 exposições", () => {
    const slots = scheduler.flattenCampaignPlan(scheduler.createCampaignPlan("all-correct"));
    let state = scheduler.createRecoveryState(1);
    for (const slot of slots) {
        state = scheduler.retargetRecoveryState(state, slot.regionId);
        state = scheduler.recordAttempt(state, slot, true);
    }
    assert.equal(state.plannedExposureCount, 2200);
    assert.equal(state.recoveryQueue.length, 0);
    assert.equal(scheduler.isCampaignPedagogicallyComplete(state), true);
});
