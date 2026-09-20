const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

const content = globalThis.TabuadaQuest.content;

test("11 Regiões possuem identidade narrativa própria", () => {
    assert.equal(content.regionIdentities.length, 11);

    for (let regionId = 1; regionId <= 11; regionId += 1) {
        const region = content.getRegionIdentity(regionId);
        assert.ok(region);
        assert.equal(region.regionId, regionId);
        assert.equal(typeof region.tagline, "string");
        assert.ok(region.tagline.length > 0);
        assert.equal(typeof region.visualTheme, "string");
        assert.ok(region.visualTheme.length > 0);
        assert.equal(region.islandNames.length, 10);
    }
});

test("110 Ilhas possuem nome e identidade de desafio misto", () => {
    const labels = new Set();

    for (let regionId = 1; regionId <= 11; regionId += 1) {
        for (let islandId = 1; islandId <= 10; islandId += 1) {
            const island = content.getIslandIdentity(regionId, islandId);
            assert.ok(island);
            assert.equal(island.regionId, regionId);
            assert.equal(island.id, islandId);
            assert.equal(island.challengeIdentity, "mixed");
            assert.equal(/tabuada/i.test(island.label), false);
            assert.ok(island.label.length > 0);
            labels.add(`${regionId}:${island.label}`);
        }
    }

    assert.equal(labels.size, 110);
});

test("Ilha 10 da Região 11 é o Coração da Fortaleza", () => {
    assert.equal(
        content.getIslandIdentity(11, 10).label,
        "Coração da Fortaleza"
    );
});
