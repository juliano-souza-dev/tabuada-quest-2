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

test("carrega estado inicial quando não há persistência", () => {
    const state = persistence.loadState(memoryStorage());

    assert.equal(state.schemaVersion, 2);
    assert.equal(state.player.displayName, "Explorador");
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});

test("salva e recarrega preferência de fundo válida", () => {
    const storage = memoryStorage();
    const state = global.TabuadaQuest.domain.playerState.createInitialState();
    state.player.displayName = "Marujo";
    state.ui.homeBackgroundId = "pirate-main";

    persistence.saveState(storage, state);
    const loaded = persistence.loadState(storage);

    assert.equal(loaded.player.displayName, "Marujo");
    assert.equal(loaded.ui.homeBackgroundId, "pirate-main");
});

test("migra persistência antiga v1 para schema v2", () => {
    const old = global.TabuadaQuest.domain.playerState.createInitialState();
    old.schemaVersion = 1;
    delete old.ui.homeBackgroundId;

    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: JSON.stringify(old)
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 2);
    assert.equal(loaded.ui.homeBackgroundId, "pirate-main");
});

test("JSON corrompido não quebra inicialização", () => {
    const storage = memoryStorage({
        [persistence.STORAGE_KEY]: "{broken-json"
    });

    const loaded = persistence.loadState(storage);

    assert.equal(loaded.schemaVersion, 2);
    assert.equal(loaded.campaign.diamonds, 0);
});
