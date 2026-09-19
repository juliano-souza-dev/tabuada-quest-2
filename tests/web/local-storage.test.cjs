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

test("carrega estado inicial v3 quando não há persistência", () => {
    const state = persistence.loadState(memoryStorage());

    assert.equal(state.schemaVersion, 3);
    assert.equal(state.player.profileFrameId, "pirate-treasure");
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});

test("salva e recarrega personalização e HUD dinâmico", () => {
    const storage = memoryStorage();
    const state = global.TabuadaQuest.domain.playerState.createInitialState();

    state.player.displayName = "Alana";
    state.player.profileFrameId = "pirate-treasure";
    state.progression.level = 96;
    state.progression.xpCurrent = 63;
    state.progression.xpRequired = 100;
    state.wallet.coins = 64;
    state.wallet.gems = 12;

    persistence.saveState(storage, state);
    const loaded = persistence.loadState(storage);

    assert.equal(loaded.player.displayName, "Alana");
    assert.equal(loaded.player.profileFrameId, "pirate-treasure");
    assert.equal(loaded.progression.level, 96);
    assert.equal(loaded.progression.xpCurrent, 63);
    assert.equal(loaded.wallet.coins, 64);
    assert.equal(loaded.wallet.gems, 12);
});

test("migra persistência v2 para schema v3", () => {
    const base = global.TabuadaQuest.domain.playerState.createInitialState();
    const old = {
        ...base,
        schemaVersion: 2,
        player: {
            id: base.player.id,
            displayName: base.player.displayName,
            avatarId: base.player.avatarId
        }
    };
    delete old.progression;
    delete old.wallet;

    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: JSON.stringify(old)
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 3);
    assert.equal(loaded.player.profileFrameId, "pirate-treasure");
    assert.equal(loaded.progression.level, 1);
    assert.equal(loaded.wallet.coins, 0);
});

test("JSON corrompido não quebra inicialização", () => {
    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: "{broken-json"
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 3);
    assert.equal(loaded.wallet.coins, 0);
    assert.equal(loaded.wallet.gems, 0);
});
