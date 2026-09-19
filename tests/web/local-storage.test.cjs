const test = require("node:test");
const assert = require("node:assert/strict");

global.TabuadaQuest = {};
require("../../web/js/domain/player-state.js");
require("../../web/js/persistence/local-storage.js");

const persistence = global.TabuadaQuest.persistence.localStorage;

function memoryStorage(seed = {}) {
    const data = new Map(Object.entries(seed));
    return {
        getItem(key) {
            return data.has(key) ? data.get(key) : null;
        },
        setItem(key, value) {
            data.set(key, String(value));
        }
    };
}

test("carrega estado inicial v4 quando não há persistência", () => {
    const state = persistence.loadState(memoryStorage());

    assert.equal(state.schemaVersion, 4);
    assert.equal(state.player.profileFrameId, "simple");
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});

test("salva e recarrega personalização e HUD dinâmico", () => {
    const storage = memoryStorage();
    const state = global.TabuadaQuest.domain.playerState.createInitialState();

    state.player.displayName = "Alana";
    state.player.profileFrameId = "tide-wheel";
    state.progression.level = 96;
    state.progression.xpCurrent = 63;
    state.progression.xpRequired = 100;
    state.wallet.coins = 64;
    state.wallet.gems = 12;

    persistence.saveState(storage, state);
    const loaded = persistence.loadState(storage);

    assert.equal(loaded.player.displayName, "Alana");
    assert.equal(loaded.player.profileFrameId, "tide-wheel");
    assert.equal(loaded.progression.level, 96);
    assert.equal(loaded.progression.xpCurrent, 63);
    assert.equal(loaded.wallet.coins, 64);
    assert.equal(loaded.wallet.gems, 12);
});

test("migra persistência v3 com antigo padrão para schema v4 simples", () => {
    const base = global.TabuadaQuest.domain.playerState.createInitialState();
    const old = {
        ...base,
        schemaVersion: 3,
        player: {
            ...base.player,
            profileFrameId: "pirate-treasure"
        }
    };

    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: JSON.stringify(old)
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 4);
    assert.equal(loaded.player.profileFrameId, "simple");
});

test("JSON corrompido não quebra inicialização", () => {
    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: "{broken-json"
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 4);
    assert.equal(loaded.wallet.coins, 0);
    assert.equal(loaded.wallet.gems, 0);
});
