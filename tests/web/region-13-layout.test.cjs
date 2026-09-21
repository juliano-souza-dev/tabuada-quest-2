const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content = globalThis.TabuadaQuest.content;
const islands = globalThis.TabuadaQuest.screens.islands;
const assetRoot = path.join(__dirname, "../../web/assets/regions/region-13");

function pngDimensions(bytes) {
    assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
    return {
        width: bytes.readUInt32BE(16),
        height: bytes.readUInt32BE(20),
        colorType: bytes[25]
    };
}

test("OBSIDIANA possui as cinco Ilhas canônicas na ordem aprovada", () => {
    assert.deepEqual(
        Array.from({ length: 5 }, (_, index) =>
            content.getIslandIdentity(13, index + 1).label
        ),
        ["Rocha Negra","Cinzas","Fogo Obsidiano","Cratera","Coração de Obsidiana"]
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

test("as cinco Ilhas possuem assets normal e bloqueado distintos", () => {
    for (let islandId = 1; islandId <= 5; islandId += 1) {
        const entry = content.assets.region13Modular.islands[islandId];
        assert.ok(entry);
        assert.match(entry.unlocked, new RegExp(`island-0${islandId}-unlocked\\.png`));
        assert.match(entry.locked, new RegExp(`island-0${islandId}-locked\\.png`));
        assert.notEqual(entry.unlocked, entry.locked);
        assert.equal(
            islands.getRegionIslandAsset(13, islandId, "locked"),
            entry.locked
        );
        assert.equal(
            islands.getRegionIslandAsset(13, islandId, "available"),
            entry.unlocked
        );
    }
});

test("assets de Ilha preservam transparência e resolução de preview", () => {
    for (let islandId = 1; islandId <= 5; islandId += 1) {
        for (const state of ["unlocked", "locked"]) {
            const file = path.join(
                assetRoot,
                `island-0${islandId}-${state}.png`
            );
            const bytes = fs.readFileSync(file);
            const image = pngDimensions(bytes);

            assert.equal(image.width, 256);
            assert.equal(image.height, 256);
            assert.ok(
                image.colorType === 4 || image.colorType === 6,
                `${path.basename(file)} perdeu canal alfa`
            );
            assert.ok(bytes.length > 15000, `${path.basename(file)} parece thumbnail degradada`);
        }
    }
});

test("background da OBSIDIANA preserva o asset original 941x1672", () => {
    const file = path.join(assetRoot, "background.png");
    const bytes = fs.readFileSync(file);
    const image = pngDimensions(bytes);

    assert.equal(image.width, 941);
    assert.equal(image.height, 1672);
    assert.ok(bytes.length > 1000000, "background foi reduzido/degradado");
    assert.ok(bytes.length <= 5000000, "background original excedeu limite de segurança");
});
