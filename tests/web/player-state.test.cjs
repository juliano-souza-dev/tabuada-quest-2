const test = require("node:test");
const assert = require("node:assert/strict");

global.TabuadaQuest = {};
require("../../web/js/domain/player-state.js");

const domain = global.TabuadaQuest.domain.playerState;

test("estado inicial usa schema v1 e progressão mínima aprovada", () => {
    const state = domain.createInitialState();

    assert.equal(state.schemaVersion, 1);
    assert.equal(state.campaign.currentRegionId, 1);
    assert.equal(state.campaign.currentIslandId, 1);
    assert.deepEqual(state.campaign.unlockedRegionIds, [1]);
    assert.equal(Object.keys(state.campaign.specialMaps).length, 5);
    assert.equal(state.campaign.diamonds, 0);
});

test("estado inválido volta para estado inicial sem conceder recompensa", () => {
    const state = domain.normalizeState({
        schemaVersion: 999,
        campaign: { diamonds: 5000 }
    });

    assert.equal(state.schemaVersion, 1);
    assert.equal(state.campaign.diamonds, 0);
});
