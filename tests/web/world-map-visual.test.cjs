const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/world-map-screen.js");

const TQ=globalThis.TabuadaQuest;

test("Mapa Mundo usa as cartas náuticas paginadas enviadas",()=>{
    const charts=TQ.content.assets.global.worldMapCharts;
    assert.deepEqual(charts.map((chart)=>chart.id),[1,2,3,4,6]);
    assert.deepEqual(charts.map((chart)=>chart.regionIds),[
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12],
        [13,14,15,16],
        [21,22]
    ]);

    for(const chart of charts){
        assert.match(chart.asset,/assets\/global\/carta-nautica-\d{2}-regioes-\d{2}-\d{2}\.webp/);
        const configured=chart.asset.split("?")[0].replace(/^\.\//,"");
        assert.equal(fs.existsSync(path.join(__dirname,"../../web",configured)),true);
    }

    assert.equal(TQ.content.assets.global.worldMapVisual,charts[0].asset);
});

test("Mapa Mundo possui hotspots para todas as regiões presentes nas cartas disponíveis",()=>{
    assert.deepEqual(
        Object.keys(TQ.screens.worldMap.WORLD_MAP_REGION_HITBOXES).map(Number),
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,21,22]
    );

    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/world-map-screen.js"),
        "utf8"
    );
    assert.match(source,/worldMapCharts/);
    assert.match(source,/previous-chart/);
    assert.match(source,/next-chart/);
    assert.match(source,/getRegionStatus/);
    assert.match(source,/selectRegion/);
    assert.doesNotMatch(source,/const visibleRegionIds = \[1, 2\]/);
});

test("rotas de produto Regiões e Mapa Mundo usam o mapa visual",()=>{
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    assert.match(app,/regions: TQ\.screens\.worldMap\.renderWorldMapScreen/);
    assert.match(app,/"world-map": TQ\.screens\.worldMap\.renderWorldMapScreen/);
});
