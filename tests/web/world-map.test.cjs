const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/core/world-map.js");

const worldMap = globalThis.TabuadaQuest.core.worldMap;

test("Mapa mundo navega pelo ponto global único", () => {
    let destination = null;
    const result = worldMap.open({
        onNavigate(screenId) {
            destination = screenId;
        }
    });

    assert.equal(result.handled, true);
    assert.equal(result.implemented, true);
    assert.equal(result.mode, "development-navigation");
    assert.equal(result.nextScreen, "world-map");
    assert.equal(result.canNavigate, true);
    assert.equal(destination, "world-map");
});

test("Mapa mundo pode ser consultado sem callback", () => {
    const result = worldMap.open();
    assert.equal(result.handled, true);
    assert.equal(result.canNavigate, false);
});
