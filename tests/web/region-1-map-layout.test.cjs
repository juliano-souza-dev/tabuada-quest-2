const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

test("configuração visual é resolvida por Região sem duplicar renderer", () => {
    const corsario = islands.getRegionVisualConfig(1);
    assert.ok(corsario);
    assert.equal(corsario.assetKey, "region1Modular");
    assert.equal(corsario.assets, content.assets.region1Modular);
    assert.equal(islands.getRegionVisualConfig(2), null);
});

test("CORSÁRIO 2 usa fundo próprio e reaproveita Ilhas 06–10", () => {
    assert.match(
        content.assets.region1Modular.backgrounds[2],
        /assets\/regions\/region-1\/corsario-2-background\.jpg/
    );

    const state = {
        campaign: {
            regionProgress: {
                "1": { islandsCompleted: 5, islandsTotal: 10 }
            }
        }
    };

    const page = islands.getRegionVisualPage(state, 1);
    assert.equal(page.id, "corsario-2");
    assert.deepEqual(page.islandIds, [6, 7, 8, 9, 10]);
    assert.equal(page.background, content.assets.region1Modular.backgrounds[2]);
});

test("CORSÁRIO 1 permanece ativo antes da conclusão da Ilha 05", () => {
    const state = {
        campaign: {
            regionProgress: {
                "1": { islandsCompleted: 4, islandsTotal: 10 }
            }
        }
    };

    const page = islands.getRegionVisualPage(state, 1);
    assert.equal(page.id, "corsario-1");
    assert.deepEqual(page.islandIds, [1, 2, 3, 4, 5]);
});

test("layout canônico da Corsário possui back e 5 Ilhas visíveis", () => {
    const layout = islands.REGION_LAYOUT;
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
    const geometry = islands.computeRegionStageGeometry(360, 800);
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
    assert.equal(islands.formatRegionStatus("locked", false), "BLOQUEADA");
    assert.equal(islands.formatRegionStatus("available", false), "DESBLOQUEADA");
    assert.equal(islands.formatRegionStatus("completed", false), "CONCLUÍDA ✓");
    assert.equal(islands.formatRegionStatus("available", true), "CONTINUAR");
});

test("recompensas visuais são fixas nos assets e labels seguem acessíveis", () => {
    for (const islandId of islands.REGION_LAYOUT.visibleIslandIds) {
        assert.equal("reward" in islands.REGION_LAYOUT.islands[islandId], false);
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
        islands.getRegionIslandAsset(1, 1, "locked"),
        /island-01-locked\.png/
    );
    assert.match(
        islands.getRegionIslandAsset(1, 1, "available"),
        /island-01-unlocked\.png/
    );
    assert.match(
        islands.getRegionIslandAsset(1, 1, "completed"),
        /island-01-unlocked\.png/
    );
});




test("Corsário usa as cinco marcações de água com assets maiores", () => {
    const expected = {
        1: { art: [0,320,380,380], status: [88,626,204,42], hitbox: [14,334,352,352] },
        2: { art: [561,360,380,380], status: [649,666,204,42], hitbox: [575,374,352,352] },
        3: { art: [270,590,400,400], status: [362,912,216,44], hitbox: [285,605,370,370] },
        4: { art: [0,915,395,395], status: [91,1233,213,44], hitbox: [15,930,365,365] },
        5: { art: [541,1240,400,400], status: [633,1562,216,44], hitbox: [556,1255,370,370] }
    };

    function rectTuple(rect) {
        return [rect.x, rect.y, rect.width, rect.height];
    }

    for (const islandId of islands.REGION_LAYOUT.visibleIslandIds) {
        const item = islands.REGION_LAYOUT.islands[islandId];
        assert.deepEqual(rectTuple(item.art), expected[islandId].art);
        assert.deepEqual(rectTuple(item.status), expected[islandId].status);
        assert.deepEqual(rectTuple(item.hitbox), expected[islandId].hitbox);
    }
});


test("Ilhas ampliadas preservam respiro entre os centros", () => {
    const layout = islands.REGION_LAYOUT;
    const pairs = [[1,2],[1,3],[2,3],[3,4],[3,5],[4,5]];

    function center(rect) {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        };
    }

    for (const [aId, bId] of pairs) {
        const a = center(layout.islands[aId].art);
        const b = center(layout.islands[bId].art);
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(distance >= 315, `Ilhas ${aId} e ${bId} ficaram próximas demais: ${distance}`);
    }
});

test("status usa fonte maior após refino de legibilidade", () => {
    const layout = islands.REGION_LAYOUT;
    for (const islandId of layout.visibleIslandIds) {
        assert.ok(layout.islands[islandId].status.fontSize >= 28);
        assert.ok(layout.islands[islandId].status.height >= 42);
    }
});


test("CSS do status garante contraste sobre a placa", () => {
    const css = fs.readFileSync(
        path.join(__dirname, "../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    assert.match(css, /\.region-island-status\s*\{[\s\S]*-webkit-text-stroke:/);
    assert.match(css, /\.region-island-status\s*\{[\s\S]*text-shadow:/);
    assert.match(css, /\.region-island-overlay\.is-completed \.region-island-status/);
    assert.match(css, /\.region-island-overlay\.is-resume \.region-island-status/);
});


test("Mapa mundo global é PNG transparente 200x200 e está cadastrado", () => {
    assert.match(
        content.assets.global.worldMap,
        /assets\/global\/mapa-mundo\.png/
    );

    const png = fs.readFileSync(
        path.join(__dirname, "../../web/assets/global/mapa-mundo.png")
    );

    assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(png.readUInt32BE(16), 200);
    assert.equal(png.readUInt32BE(20), 200);
    assert.equal(png[25], 3); // PNG indexado; transparência preservada por chunk tRNS.
    assert.ok(png.includes(Buffer.from("tRNS")));
});

test("Mapa mundo fica no canto inferior da Corsário abaixo da Ilha do Vulcão", () => {
    const layout = islands.REGION_LAYOUT;
    const map = layout.worldMap;
    const volcano = layout.islands[4].art;
    const island5 = layout.islands[5].art;

    assert.deepEqual(map, { x: 98, y: 1405, width: 200, height: 200 });
    assert.ok(map.y > volcano.y + volcano.height);

    const overlaps = (a, b) =>
        a.x < b.x + b.width
        && a.x + a.width > b.x
        && a.y < b.y + b.height
        && a.y + a.height > b.y;

    assert.equal(overlaps(map, island5), false);
    assert.ok(map.x >= 0);
    assert.ok(map.y + map.height <= layout.viewport.height);
});


test("Mapa mundo está conectado ao controlador global", () => {
    const source = fs.readFileSync(
        path.join(__dirname, "../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(source, /data-action="open-world-map"/);
    assert.match(source, /TQ\.core\.worldMap\.open\(\{ onNavigate \}\)/);
});


test("malha compartilhada não reintroduz layout específico por Região", () => {
    const source = fs.readFileSync(
        path.join(__dirname, "../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(source, /REGION_LAYOUT/);
    assert.match(source, /REGION_VISUAL_CONFIG/);
    assert.doesNotMatch(source, /REGION_\d+_LAYOUT/);
});
