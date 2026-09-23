const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/world-map-screen.js");

const TQ=globalThis.TabuadaQuest;

test("Mapa Mundo usa a carta náutica sequencial ativa",()=>{
    assert.match(TQ.content.assets.global.worldMapVisual,/assets\/global\/carta-nautica-\d{2}\.webp/);
    const configured=TQ.content.assets.global.worldMapVisual.split("?")[0].replace(/^\.\//,"");
    assert.equal(
        fs.existsSync(path.join(__dirname,"../../web",configured)),
        true
    );
});

test("Mapa Mundo V1 expõe somente Corsário e Birades como hotspots",()=>{
    assert.deepEqual(
        Object.keys(TQ.screens.worldMap.WORLD_MAP_REGION_HITBOXES).map(Number),
        [1,2]
    );

    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/world-map-screen.js"),
        "utf8"
    );
    assert.match(source,/const visibleRegionIds = \[1, 2\]/);
    assert.match(source,/getRegionStatus/);
    assert.match(source,/selectRegion/);
    assert.doesNotMatch(source,/world-map-region-list/);
});

test("rotas de produto Regiões e Mapa Mundo usam o mapa visual",()=>{
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    assert.match(app,/regions: TQ\.screens\.worldMap\.renderWorldMapScreen/);
    assert.match(app,/"world-map": TQ\.screens\.worldMap\.renderWorldMapScreen/);
});
