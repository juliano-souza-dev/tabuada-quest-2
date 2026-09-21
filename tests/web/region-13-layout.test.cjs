const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content = globalThis.TabuadaQuest.content;
const islands = globalThis.TabuadaQuest.screens.islands;

test("OBSIDIANA possui as cinco Ilhas canônicas na ordem aprovada", () => {
    assert.deepEqual(
        Array.from({ length: 5 }, (_, index) =>
            content.getIslandIdentity(13, index + 1).label
        ),
        [
            "Rocha Negra",
            "Cinzas",
            "Fogo Obsidiano",
            "Cratera",
            "Coração de Obsidiana"
        ]
    );
});

test("OBSIDIANA usa uma única composição de cinco slots", () => {
    const visual = islands.getRegionVisualConfig(13);
    assert.ok(visual);
    assert.equal(visual.assetKey, "region13Modular");
    assert.equal(visual.pages.length, 1);

    const page = islands.getRegionVisualPage({
        campaign: { regionProgress: {} }
    }, 13);

    assert.equal(page.id, "obsidiana");
    assert.deepEqual(page.islandIds, [1, 2, 3, 4, 5]);
    assert.equal(Object.keys(page.slotLayout).length, 5);
});

test("quatro assets reais estão promovidos e Coração permanece sem asset físico", () => {
    for (let islandId = 1; islandId <= 4; islandId += 1) {
        const entry = content.assets.region13Modular.islands[islandId];
        assert.ok(entry);
        assert.match(entry.unlocked, /assets\/regions\/region-13\/island-0[1-4]-unlocked\.webp/);
    }

    assert.equal(content.assets.region13Modular.islands[5], undefined);
    assert.equal(islands.getRegionIslandAsset(13, 5, "available"), "");
});

test("renderer ignora slot sem asset em vez de criar imagem quebrada", () => {
    const source = fs.readFileSync(
        path.join(__dirname, "../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(source, /if \(!assetEntry\?\.unlocked\) return "";/);
    assert.match(source, /\.filter\(Boolean\)\.join\(""\)/);
});

test("background preview da OBSIDIANA está dentro do orçamento web", () => {
    const file = path.join(
        __dirname,
        "../../web/assets/regions/region-13/background.webp"
    );
    const stat = fs.statSync(file);
    assert.ok(stat.size <= 450000);
});
