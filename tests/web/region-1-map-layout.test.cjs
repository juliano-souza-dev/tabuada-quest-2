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
        /assets\/regions\/region-1\/background\.png/
    );

    for (let islandId = 1; islandId <= 10; islandId += 1) {
        const entry = content.assets.region1Modular.islands[islandId];
        assert.match(entry.unlocked, new RegExp(`island-${String(islandId).padStart(2, "0")}-unlocked\\.png`));
        assert.match(entry.locked, new RegExp(`island-${String(islandId).padStart(2, "0")}-locked\\.png`));
    }
});

test("layout canônico da Região 1 possui back e 10 Ilhas", () => {
    const layout = islands.REGION_1_LAYOUT;
    assert.deepEqual(layout.viewport, { width: 941, height: 1672 });
    assert.deepEqual(layout.back, { x: 58, y: 18, width: 150, height: 150 });
    assert.equal(Object.keys(layout.islands).length, 10);

    for (let islandId = 1; islandId <= 10; islandId += 1) {
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
    for (let islandId = 1; islandId <= 10; islandId += 1) {
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


test("novo mapa serpenteado usa coordenadas pixel-perfect aprovadas", () => {
    const expected = {
        1: { art: [234,288,224,214], status: [277,457,139,26], hitbox: [242,294,208,202] },
        2: { art: [518,391,224,214], status: [561,560,139,26], hitbox: [526,397,208,202] },
        3: { art: [213,538,224,214], status: [256,707,139,26], hitbox: [221,544,208,202] },
        4: { art: [519,678,226,216], status: [562,849,140,26], hitbox: [527,684,210,204] },
        5: { art: [175,780,236,220], status: [220,954,146,26], hitbox: [183,786,220,208] },
        6: { art: [523,899,236,220], status: [568,1073,146,26], hitbox: [531,905,220,208] },
        7: { art: [193,1038,224,214], status: [236,1207,139,26], hitbox: [201,1044,208,202] },
        8: { art: [546,1158,232,218], status: [590,1330,144,26], hitbox: [554,1164,216,206] },
        9: { art: [220,1269,224,214], status: [263,1438,139,26], hitbox: [228,1275,208,202] },
        10: { art: [524,1401,238,222], status: [569,1576,148,27], hitbox: [532,1407,222,210] }
    };

    function rectTuple(rect) {
        return [rect.x, rect.y, rect.width, rect.height];
    }

    for (let islandId = 1; islandId <= 10; islandId += 1) {
        const item = islands.REGION_1_LAYOUT.islands[islandId];
        assert.deepEqual(rectTuple(item.art), expected[islandId].art);
        assert.deepEqual(rectTuple(item.status), expected[islandId].status);
        assert.deepEqual(rectTuple(item.hitbox), expected[islandId].hitbox);
    }
});
