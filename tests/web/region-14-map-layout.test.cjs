const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;
const regionDir=path.join(__dirname,"../../web/assets/regions/region-14");

test("ZONA RUBI publica background e exatamente cinco Ilhas",()=>{
    const visual=islands.getRegionVisualConfig(14);
    const page=islands.getRegionVisualPage({campaign:{regionProgress:{}}},14);
    assert.ok(visual);
    assert.equal(visual.id,"zona-rubi");
    assert.deepEqual(page.islandIds,[1,2,3,4,5]);
    assert.match(page.background,/region-14\/background\.webp/);
    assert.deepEqual(Object.keys(content.assets.region14Modular.islands),["1","2","3","4","5"]);
});

test("ZONA RUBI usa somente WebP nos assets publicados",()=>{
    const files=fs.readdirSync(regionDir);
    assert.deepEqual(files.filter((name)=>name.toLowerCase().endsWith(".png")),[]);

    const published=[content.assets.region14Modular.background];
    for(let islandId=1;islandId<=5;islandId++){
        const entry=content.assets.region14Modular.islands[islandId];
        published.push(entry.unlocked,entry.locked);
    }

    for(const asset of published){
        assert.match(asset,/\.webp(?:\?|$)/);
        const relative=asset.split("?")[0].replace(/^\.\/assets\//,"");
        assert.equal(
            fs.existsSync(path.join(__dirname,"../../web/assets",relative)),
            true,
            "asset ausente: "+relative
        );
    }
});

test("ZONA RUBI associa nomes e recompensas aos cinco slots",()=>{
    const expectedNames=["Carmesim","Coroa Rubi","Pedras Rosada","Pedras Rubras","Rubi do Rei"];
    const expectedRewards=["chest","pet","map_fragment","chest","map_fragment"];

    for(let islandId=1;islandId<=5;islandId++){
        assert.equal(content.getIslandIdentity(14,islandId).label,expectedNames[islandId-1]);
        assert.equal(content.getIslandPrimaryReward(14,islandId).type,expectedRewards[islandId-1]);
        assert.match(islands.getRegionIslandAsset(14,islandId,"locked"),/\.webp(?:\?|$)/);
        assert.match(islands.getRegionIslandAsset(14,islandId,"available"),/\.webp(?:\?|$)/);
    }
});
