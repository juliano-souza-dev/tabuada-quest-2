const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;

let alertMessage = null;
globalThis.alert = (message) => {
    alertMessage = message;
};

require("../../web/js/core/world-map.js");

const worldMap = globalThis.TabuadaQuest.core.worldMap;

test("Mapa mundo expõe ponto global único de abertura", () => {
    let navigated = false;
    const result = worldMap.open({
        onNavigate() {
            navigated = true;
        }
    });

    assert.equal(alertMessage, "Mapa mundo ainda está em produção.");
    assert.equal(result.handled, true);
    assert.equal(result.implemented, false);
    assert.equal(result.nextScreen, "world-map");
    assert.equal(result.canNavigate, true);
    assert.equal(navigated, false);
});

test("Mapa mundo pode ser chamado sem callback de navegação", () => {
    alertMessage = null;
    const result = worldMap.open();

    assert.equal(alertMessage, "Mapa mundo ainda está em produção.");
    assert.equal(result.canNavigate, false);
});
