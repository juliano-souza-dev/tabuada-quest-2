const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content = globalThis.TabuadaQuest.content;
const islands = globalThis.TabuadaQuest.screens.islands;

test("Região 1 usa fundo e Ilhas modulares", () => {
    assert.match(
        content.assets.region1Modular.background,
        /assets\/regions\/region-1\/mapa_marítimo_do_corsário\.png/
    );

    for (let islandId = 1; islandId <= 10; islandId += 1) {
        const entry = content.assets.region1Modular.islands[islandId];
        assert.match(entry.unlocked, new RegExp(`island-${String(islandId).padStart(2, "0")}-unlocked\\.png`));
        assert.match(entry.locked, new RegExp(`island-${String(islandId).padStart(2, "0")}-locked\\.png`));
    }
});

test("layout canônico da Corsário possui back e 5 Ilhas visíveis", () => {
    const layout = islands.REGION_1_LAYOUT;
    assert.deepEqual(layout.viewport, { width: 941, height: 1672 });
    assert.deepEqual(layout.visibleIslandIds, [1, 2, 3, 4, 5]);
    assert.deepEqual(layout.back, { x: 58, y: 18, width: 150, height: 150 });
    assert.equal(Object.keys(layout.islands).length, 5);

    for (const islandId of layout.visibleIslandIds) {
        const item = layout.islands[islandId];
        assert.ok(item);
        for (const rect of [item.art, item.status, item.hitbox]) {
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

test("status visual diferencia bloqueio, desbloqueio, conclusão e retomada", () => {
    assert.equal(islands.formatRegion1Status("locked", false), "BLOQUEADA");
    assert.equal(islands.formatRegion1Status("available", false), "DESBLOQUEADA");
    assert.equal(islands.formatRegion1Status("completed", false), "CONCLUÍDA ✓");
    assert.equal(islands.formatRegion1Status("available", true), "CONTINUAR");
});

test("recompensas visuais são fixas nos assets e labels seguem acessíveis", () => {
    for (const islandId of islands.REGION_1_LAYOUT.visibleIslandIds) {
        assert.equal("reward" in islands.REGION_1_LAYOUT.islands[islandId], false);
    }

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
        "Ilha do Vulcão",
        "Ilha da Caveira Rosa",
        "Atol do Timão",
        "Ponta da Caravela",
        "Praia das Cordas",
        "Ilha do Canhão",
        "Ilha Lamen"
    ];

    assert.deepEqual(
        Array.from({ length: 10 }, (_, index) =>
            content.getIslandIdentity(1, index + 1).label
        ),
        expected
    );
});

test("seleção de asset troca entre locked e unlocked", () => {
    assert.match(
        islands.getRegion1IslandAsset(1, "locked"),
        /island-01-locked\.png/
    );
    assert.match(
        islands.getRegion1IslandAsset(1, "available"),
        /island-01-unlocked\.png/
    );
    assert.match(
        islands.getRegion1IslandAsset(1, "completed"),
        /island-01-unlocked\.png/
    );
});




test("Corsário usa as cinco marcações de água com assets maiores", () => {
    const expected = {
        1: { art: [5,340,330,330], status: [80,604,180,36], hitbox: [15,350,310,310] },
        2: { art: [595,380,330,330], status: [670,644,180,36], hitbox: [605,390,310,310] },
        3: { art: [295,615,350,350], status: [375,895,190,38], hitbox: [305,625,330,330] },
        4: { art: [10,940,350,350], status: [90,1220,190,38], hitbox: [20,950,330,330] },
        5: { art: [560,1275,350,350], status: [640,1555,190,38], hitbox: [570,1285,330,330] }
    };

    function rectTuple(rect) {
        return [rect.x, rect.y, rect.width, rect.height];
    }

    for (const islandId of islands.REGION_1_LAYOUT.visibleIslandIds) {
        const item = islands.REGION_1_LAYOUT.islands[islandId];
        assert.deepEqual(rectTuple(item.art), expected[islandId].art);
        assert.deepEqual(rectTuple(item.status), expected[islandId].status);
        assert.deepEqual(rectTuple(item.hitbox), expected[islandId].hitbox);
    }
});
