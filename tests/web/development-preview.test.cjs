const test=require("node:test");
const assert=require("node:assert/strict");

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
