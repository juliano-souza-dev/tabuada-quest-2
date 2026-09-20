const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content = globalThis.TabuadaQuest.content;
const islands = globalThis.TabuadaQuest.screens.islands;

test("Região 1 usa asset visual canônico", () => {
    assert.match(
        content.assets.region1IslandsMapStatic,
        /assets\/regions\/region-1-islands-static\.webp/
    );
});

test("layout canônico da Região 1 possui back e 10 Ilhas", () => {
    const layout = islands.REGION_1_LAYOUT;
    assert.deepEqual(layout.viewport, { width: 941, height: 1672 });
    assert.deepEqual(layout.back, { x: 8, y: 5, width: 118, height: 118 });
    assert.equal(Object.keys(layout.islands).length, 10);

    for (let islandId = 1; islandId <= 10; islandId += 1) {
        const item = layout.islands[islandId];
        assert.ok(item);
        for (const rect of [item.status, item.reward, item.hitbox]) {
            assert.ok(rect.x >= 0);
            assert.ok(rect.y >= 0);
            assert.ok(rect.width > 0);
            assert.ok(rect.height > 0);
            assert.ok(rect.x + rect.width <= 941);
            assert.ok(rect.y + rect.height <= 1672);
        }
    }
});

test("cover geometry preserva stage 941x1672", () => {
    const geometry = islands.computeRegion1StageGeometry(360, 800);
    assert.ok(geometry.scale > 0);
    assert.ok(geometry.renderWidth >= 360);
    assert.ok(geometry.renderHeight >= 800);
    assert.equal(
        geometry.offsetX,
        (360 - geometry.renderWidth) / 2
    );
    assert.equal(
        geometry.offsetY,
        (800 - geometry.renderHeight) / 2
    );
});

test("status visual diferencia bloqueio, desbloqueio, revisão, conclusão e retomada", () => {
    assert.equal(islands.formatRegion1Status("locked", false), "BLOQUEADA");
    assert.equal(islands.formatRegion1Status("available", false), "DESBLOQUEADA");
    assert.equal(islands.formatRegion1Status("review", false), "REVISAR");
    assert.equal(islands.formatRegion1Status("completed", false), "CONCLUÍDA ✓");
    assert.equal(islands.formatRegion1Status("available", true), "CONTINUAR");
});

test("recompensas da Região 1 continuam dinâmicas", () => {
    assert.equal(islands.rewardSymbol([{ type: "pet" }]), "🐾");
    assert.equal(islands.rewardSymbol([{ type: "chest" }]), "🎁");
    assert.equal(
        islands.rewardSymbol([{ type: "map_fragment", mapId: 1, fragment: 1 }]),
        "🧩"
    );

    assert.equal(
        islands.rewardLabel([{ type: "map_fragment", mapId: 1, fragment: 4 }]),
        "Fragmento 4 de 4 do Mapa 1"
    );
});

test("nomes fixos usados pela arte continuam no catálogo para acessibilidade", () => {
    const expected = [
        "Porto da Âncora",
        "Enseada do Saque",
        "Rochedo da Bandeira",
        "Cais do Barril",
        "Baía do Farol",
        "Atol do Timão",
        "Ponta da Caravela",
        "Praia das Cordas",
        "Ilha do Canhão",
        "Cabo do Capitão"
    ];

    assert.deepEqual(
        Array.from({ length: 10 }, (_, index) =>
            content.getIslandIdentity(1, index + 1).label
        ),
        expected
    );
});
