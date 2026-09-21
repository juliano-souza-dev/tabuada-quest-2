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


test("Ilhas canônicas sem nome recebem placeholder estável", () => {
    const first = content.getIslandIdentity(22, 1);
    const again = content.getIslandIdentity(22, 1);
    const other = content.getIslandIdentity(22, 2);

    assert.ok(first);
    assert.equal(first.isPlaceholder, true);
    assert.match(first.label, /^Ilha .+ \d{2}$/);
    assert.equal(first.label, again.label);
    assert.notEqual(first.label, other.label);
    assert.equal(first.regionId, 22);
    assert.equal(first.id, 1);
});

test("placeholder não sobrescreve nome já existente", () => {
    const existing = content.getIslandIdentity(1, 1);
    assert.equal(existing.label, "Porto da Âncora");
    assert.notEqual(existing.isPlaceholder, true);
});

test("fallback temporário respeita apenas a macroestrutura 22x5", () => {
    assert.equal(content.createTemporaryIslandIdentity(23, 1), null);
    assert.equal(content.createTemporaryIslandIdentity(1, 6), null);
    assert.equal(content.createTemporaryIslandIdentity(0, 1), null);
});
