const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;

test("CORSÁRIO ativo possui somente cinco assets de Ilha",()=>{
    assert.match(content.assets.region1Modular.background,/mapa_marítimo_do_corsário\.png/);
    assert.deepEqual(Object.keys(content.assets.region1Modular.islands),["1","2","3","4","5"]);
    assert.equal(content.assets.region1Modular.backgrounds[2],undefined);
});

test("CORSÁRIO possui uma única composição, sem pages ou CORSÁRIO 2",()=>{
    const visual=islands.getRegionVisualConfig(1);
    const page=islands.getRegionVisualPage({campaign:{regionProgress:{}}},1);
    assert.ok(visual);
    assert.equal(visual.id,"corsario");
    assert.equal("pages" in visual,false);
    assert.deepEqual(page.islandIds,[1]);
    assert.equal(page.hideIslands,false);

    const source=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    assert.doesNotMatch(source,/corsario-2/i);
    assert.doesNotMatch(source,/unlockAfterCompleted/);
    assert.doesNotMatch(source,/\.pages/);
});

test("nenhuma Região renderiza status textual sobre as Ilhas",()=>{
    const source=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    const css=fs.readFileSync(path.join(__dirname,"../../web/css/screens/vertical-slice.css"),"utf8");
    assert.doesNotMatch(source,/class="region-island-status"/);
    assert.doesNotMatch(css,/\.region-island-status/);
});

test("layout compartilhado continua com cinco slots e Mapa Mundo global",()=>{
    const layout=islands.REGION_LAYOUT;
    assert.deepEqual(layout.viewport,{width:941,height:1672});
    assert.deepEqual(layout.visibleIslandIds,[1,2,3,4,5]);
    assert.equal(Object.keys(layout.islands).length,5);
    assert.deepEqual(layout.worldMap,{x:98,y:1405,width:200,height:200});
});

test("CORSÁRIO publica somente a Ilha 1 aprovada nesta etapa",()=>{
    assert.match(islands.getRegionIslandAsset(1,1,"locked"),/island-01-locked\.webp/);
    assert.match(islands.getRegionIslandAsset(1,1,"available"),/island-01-unlocked\.webp/);
    assert.equal(content.getIslandIdentity(1,1).label,"Enseada da Bandeira");
    assert.equal(content.getIslandPrimaryReward(1,1).type,"pet");
});

test("Mapa Mundo permanece conectado ao controlador global",()=>{
    const source=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    assert.match(source,/data-action="open-world-map"/);
    assert.match(source,/TQ\.core\.worldMap\.open\(\{ onNavigate \}\)/);
});
