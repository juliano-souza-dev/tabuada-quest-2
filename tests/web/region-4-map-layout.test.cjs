const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

globalThis.TabuadaQuest.core={
    safeViewport:{
        computeFit(){ return {}; },
        bindCanonicalStage(){}
    }
};
require("../../web/js/screens/islands-screen.js");

const TQ=globalThis.TabuadaQuest;

test("Região 4 usa o background oficial de Terras Gélidas",()=>{
    assert.equal(TQ.content.getWorldRegion(4).label,"TERRAS GÉLIDAS");

    const assets=TQ.content.assets.region4Modular;
    assert.ok(assets);
    assert.match(assets.background,/region-4\/region-04-background-q76\.webp/);

    const clean=assets.background.split("?")[0].replace(/^\.\//,"");
    assert.equal(fs.existsSync(path.join(__dirname,"../../web",clean)),true);
});

test("Região 4 aparece como preview enquanto as ilhas ainda não foram adicionadas",()=>{
    const visual=TQ.screens.islands.getRegionVisualConfig(4);
    assert.ok(visual);
    assert.equal(visual.id,"terras-gelidas");
    assert.equal(visual.hideIslands,true);
    assert.deepEqual(visual.islandIds,[1,2,3,4,5]);
    assert.equal(TQ.screens.islands.getDevelopmentRegionStatus(4),"preview");
});
