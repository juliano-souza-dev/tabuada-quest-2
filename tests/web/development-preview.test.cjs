const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const islands=global.TabuadaQuest.screens.islands;

test("preview deriva Regiões implementadas do REGION_VISUAL_CONFIG",()=>{
    const expected=Object.keys(islands.REGION_VISUAL_CONFIG)
        .map(Number)
        .sort((a,b)=>a-b);

    assert.deepEqual(islands.getImplementedRegionIds(),expected);
    for(const regionId of expected){
        assert.ok(islands.getRegionVisualConfig(regionId));
        assert.equal(islands.getDevelopmentRegionStatus(regionId),"completed");
    }
});

test("Região sem implementação visual permanece apenas como prévia",()=>{
    assert.equal(islands.getDevelopmentRegionStatus(999),"preview");
});

test("status automático de desenvolvimento não depende do estado persistente do jogador",()=>{
    const before={campaign:{unlockedRegionIds:[1],completedRegionIds:[]}};
    const snapshot=JSON.stringify(before);
    islands.getDevelopmentRegionStatus(13);
    assert.equal(JSON.stringify(before),snapshot);
});


test("atalho temporário de desenvolvimento mantém acesso à lista sem asset",()=>{
    assert.equal(global.TabuadaQuest.content.development.shortcutsEnabled,true);

    const home=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    const developmentScreen=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/development-regions-screen.js"),
        "utf8"
    );
    const islandsScreen=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(home,/data-action="development-regions"/);
    assert.match(app,/"development-regions": TQ\.screens\.developmentRegions\.renderDevelopmentRegionsScreen/);
    assert.match(developmentScreen,/Acesso de desenvolvimento/);
    assert.match(developmentScreen,/onPreviewRegionChange/);
    assert.match(developmentScreen,/onNavigate\("islands"\)/);
    assert.match(islandsScreen,/previewMode \? "development-regions" : "regions"/);
});
