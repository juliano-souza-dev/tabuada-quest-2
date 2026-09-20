const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

const regionNames = globalThis.TabuadaQuest.content.regions.map((region) => region.label);

test("region names match the approved product copy", () => {
    assert.deepEqual(regionNames, [
        "CORSÁRIO",
        "NEBLINAS",
        "CAVEIRAS",
        "NÁUFRAGO",
        "VULCÂNIA",
        "RELÍQUIA",
        "CORALINA",
        "VENTANIA",
        "MURALHAS",
        "ZONA RUBI",
        "FORTALEZA"
    ]);
});

test("regions 1 through 9 keep exactly eight characters", () => {
    regionNames.slice(0, 9).forEach((name) => {
        assert.equal(Array.from(name).length, 8, name);
    });
});

test("regions 10 and 11 keep exactly nine characters", () => {
    regionNames.slice(9).forEach((name) => {
        assert.equal(Array.from(name).length, 9, name);
    });
});

test("region 10 is exactly ZONA RUBI", () => {
    assert.equal(regionNames[9], "ZONA RUBI");
});
