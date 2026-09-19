const test = require("node:test");
const assert = require("node:assert/strict");

global.TabuadaQuest = {};
require("../../web/js/domain/player-state.js");

const domain = global.TabuadaQuest.domain.playerState;

test("estado inicial usa schema v2, fundo padrão e progressão mínima aprovada", () => {
    const state = domain.createInitialState();

    assert.equal(state.schemaVersion, 2);
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
    assert.equal(state.campaign.currentRegionId, 1);
    assert.equal(state.campaign.currentIslandId, 1);
    assert.deepEqual(state.campaign.unlockedRegionIds, [1]);
    assert.equal(Object.keys(state.campaign.specialMaps).length, 5);
    assert.equal(state.campaign.diamonds, 0);
});

test("migra estado v1 preservando dados e adicionando fundo padrão", () => {
    const old = domain.createInitialState();
    old.schemaVersion = 1;
    delete old.ui.homeBackgroundId;
    old.player.displayName = "Marujo";

    const migrated = domain.normalizeState(old);

    assert.equal(migrated.schemaVersion, 2);
    assert.equal(migrated.player.displayName, "Marujo");
    assert.equal(migrated.ui.homeBackgroundId, "pirate-main");
});

test("troca fundo somente quando o id pertence ao catálogo permitido", () => {
    const state = domain.createInitialState();
    const changed = domain.withHomeBackground(state, "sunset-bay", ["pirate-main", "sunset-bay"]);
    const rejected = domain.withHomeBackground(changed, "unknown", ["pirate-main", "sunset-bay"]);

    assert.equal(changed.ui.homeBackgroundId, "sunset-bay");
    assert.equal(rejected.ui.homeBackgroundId, "sunset-bay");
});

test("estado inválido volta para estado inicial sem conceder recompensa", () => {
    const state = domain.normalizeState({
        schemaVersion: 999,
        campaign: { diamonds: 5000 }
    });

    assert.equal(state.schemaVersion, 2);
    assert.equal(state.campaign.diamonds, 0);
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});
