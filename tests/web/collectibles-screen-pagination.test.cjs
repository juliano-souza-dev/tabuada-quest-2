const test = require("node:test");
const assert = require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/content/collectibles-assets.js");
require("../../web/js/screens/collectibles-screen.js");

const TQ = global.TabuadaQuest;
const collectiblesScreen = TQ.screens.collectibles;

test("manifest usa somente WebP e IDs de Colecionáveis válidos", () => {
    const manifest = TQ.collectibleAssetManifest;
    assert.equal(manifest.length, 10);
    assert.equal(new Set(manifest.map((entry) => entry.id)).size, manifest.length);

    for (const entry of manifest) {
        assert.match(entry.id, /^collectible-\d{3}$/);
        assert.match(entry.asset, /^\.\/assets\/collectibles\/items\/.+\.webp$/);
    }
});

test("tela considera somente Colecionáveis que possuem asset visual", () => {
    const resolved = collectiblesScreen.resolveAssetCatalog(
        TQ.content.collectibles,
        TQ.collectibleAssetManifest
    );

    assert.equal(resolved.length, 10);
    assert.deepEqual(
        resolved.map((item) => item.id),
        TQ.collectibleAssetManifest.map((entry) => entry.id)
    );
});

test("paginação exibe no máximo 25 assets e só libera próxima página quando ela existe", () => {
    const items = Array.from({ length: 26 }, (_, index) => ({ id: `item-${index + 1}` }));

    const first = collectiblesScreen.paginateAssetCatalog(items, 0);
    assert.equal(first.items.length, 25);
    assert.equal(first.hasPrevious, false);
    assert.equal(first.hasNext, true);
    assert.equal(first.totalPages, 2);

    const second = collectiblesScreen.paginateAssetCatalog(items, 1);
    assert.equal(second.items.length, 1);
    assert.equal(second.hasPrevious, true);
    assert.equal(second.hasNext, false);
});

test("com até 25 assets a seta de próxima página permanece bloqueada", () => {
    const items = Array.from({ length: 25 }, (_, index) => ({ id: `item-${index + 1}` }));
    const page = collectiblesScreen.paginateAssetCatalog(items, 0);

    assert.equal(page.items.length, 25);
    assert.equal(page.hasNext, false);
    assert.equal(page.hasPrevious, false);
});
