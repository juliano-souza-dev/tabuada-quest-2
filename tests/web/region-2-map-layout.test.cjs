const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;
const assetRoot=path.join(__dirname,"../../web/assets/regions/region-2");

test("BIRADES usa background e cinco pares WebP canônicos",()=>{
    assert.match(content.assets.region2Modular.background,/region-2\/background\.webp/);
    assert.deepEqual(Object.keys(content.assets.region2Modular.islands),["1","2","3","4","5"]);

    const expected=[
        ["porto_desengoncado_unlocked.webp","porto_desengoncado_locked.webp"],
        ["baia_dos_bichos_piratas_unlocked.webp","baia_dos_bichos_piratas_locked.webp"],
        ["farol_torto_unlocked.webp","farol_torto_locked.webp"],
        ["fortaleza_das_tralhas_unlocked.webp","fortaleza_das_tralhas_locked.webp"],
        ["cabo_do_mapa_impossivel_unlocked.webp","cabo_do_mapa_impossivel_locked.webp"]
    ];

    assert.equal(fs.existsSync(path.join(assetRoot,"background.webp")),true);
    expected.forEach(([unlocked,locked],index)=>{
        assert.equal(fs.existsSync(path.join(assetRoot,unlocked)),true);
        assert.equal(fs.existsSync(path.join(assetRoot,locked)),true);
        assert.match(content.assets.region2Modular.islands[index+1].unlocked,new RegExp(unlocked.replace(".","\\.")));
        assert.match(content.assets.region2Modular.islands[index+1].locked,new RegExp(locked.replace(".","\\.")));
    });

    assert.equal(
        fs.readdirSync(assetRoot).some((name)=>name.toLowerCase().endsWith(".png")),
        false
    );
});

test("BIRADES está conectada ao renderer modular e aos cinco redemoinhos",()=>{
    const visual=islands.getRegionVisualConfig(2);
    const page=islands.getRegionVisualPage({campaign:{regionProgress:{}}},2);

    assert.ok(visual);
    assert.equal(visual.id,"birades");
    assert.equal(visual.assetKey,"region2Modular");
    assert.deepEqual(page.islandIds,[1,2,3,4,5]);
    assert.equal(page.worldMapEmbedded,true);
    assert.deepEqual(page.worldMapLayout,{x:760,y:18,width:160,height:140});

    assert.deepEqual(visual.slotLayout[1].art,{x:125,y:365,width:350,height:350});
    assert.deepEqual(visual.slotLayout[2].art,{x:500,y:525,width:350,height:350});
    assert.deepEqual(visual.slotLayout[3].art,{x:45,y:725,width:360,height:360});
    assert.deepEqual(visual.slotLayout[4].art,{x:510,y:950,width:360,height:360});
    assert.deepEqual(visual.slotLayout[5].art,{x:205,y:1260,width:360,height:360});

    assert.ok(islands.getImplementedRegionIds().includes(2));
    assert.equal(islands.getDevelopmentRegionStatus(2),"completed");
});

test("BIRADES mantém a distribuição canônica de recompensas",()=>{
    assert.equal(content.getIslandPrimaryReward(2,1).type,"chest");
    assert.equal(content.getIslandPrimaryReward(2,2).type,"pet");
    assert.deepEqual(content.getIslandPrimaryReward(2,3),{type:"map_fragment",mapId:1,fragment:3});
    assert.equal(content.getIslandPrimaryReward(2,4).type,"chest");
    assert.deepEqual(content.getIslandPrimaryReward(2,5),{type:"map_fragment",mapId:1,fragment:4});
});
