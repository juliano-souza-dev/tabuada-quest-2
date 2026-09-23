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

test("Região 4 aparece como preview com as ilhas produzidas já visíveis",()=>{
    const visual=TQ.screens.islands.getRegionVisualConfig(4);
    assert.ok(visual);
    assert.equal(visual.id,"terras-gelidas");
    assert.equal(visual.hideIslands,false);
    assert.deepEqual(visual.islandIds,[1,2,3,4,5]);
    assert.equal(TQ.screens.islands.getDevelopmentRegionStatus(4),"preview");
});


test("Mapa Mundo de Terras Gélidas fica no canto inferior direito com margem segura",()=>{
    const visual=TQ.screens.islands.getRegionVisualConfig(4);
    assert.deepEqual(visual.worldMapLayout,{x:717,y:1448,width:200,height:200});

    const viewport=TQ.screens.islands.REGION_LAYOUT.viewport;
    const rightMargin=viewport.width-(visual.worldMapLayout.x+visual.worldMapLayout.width);
    const bottomMargin=viewport.height-(visual.worldMapLayout.y+visual.worldMapLayout.height);

    assert.equal(rightMargin,24);
    assert.equal(bottomMargin,24);
});


test("Ilhas 1, 2 e 3 de Terras Gélidas estão ligadas aos pares WebP otimizados",()=>{
    const assets=TQ.content.assets.region4Modular.islands;
    assert.match(assets[1].unlocked,/region-4\/porto-da-geada-unlocked\.webp/);
    assert.match(assets[1].locked,/region-4\/porto-da-geada-locked\.webp/);
    assert.match(assets[2].unlocked,/region-4\/baia-do-cristal-unlocked\.webp/);
    assert.match(assets[2].locked,/region-4\/baia-do-cristal-locked\.webp/);
    assert.match(assets[3].unlocked,/region-4\/rochedo-boreal-unlocked\.webp/);
    assert.match(assets[3].locked,/region-4\/rochedo-boreal-locked\.webp/);

    for(const id of [1,2,3]){
        for(const state of ["unlocked","locked"]){
            const relative=assets[id][state].split("?")[0].replace(/^\.\//,"");
            const absolute=path.join(__dirname,"../../web",relative);
            assert.equal(fs.existsSync(absolute),true);
            const size=fs.statSync(absolute).size;
            assert.ok(size<500_000,`Ilha ${id} (${state}) ficou pesada: ${size} bytes`);
        }
    }

    assert.equal(
        fs.existsSync(path.join(__dirname,"../../web/assets/regions/region-4/ChatGPT Image 22 de set. de 2026, 20_59_26 (1).png")),
        false
    );
    assert.equal(
        fs.existsSync(path.join(__dirname,"../../web/assets/regions/region-4/ChatGPT Image 22 de set. de 2026, 20_59_27 (2).png")),
        false
    );
});

test("slots de Terras Gélidas seguem os cinco redemoinhos do background",()=>{
    const visual=TQ.screens.islands.getRegionVisualConfig(4);
    assert.deepEqual(visual.slotLayout[1].art,{x:535,y:591,width:470,height:470});
    assert.deepEqual(visual.slotLayout[2].art,{x:140,y:747,width:470,height:470});
    assert.deepEqual(visual.slotLayout[3].art,{x:535,y:925,width:470,height:470});
    assert.deepEqual(visual.slotLayout[4].art,{x:140,y:1078,width:470,height:470});
    assert.deepEqual(visual.slotLayout[5].art,{x:-48,y:1304,width:470,height:423});
});

test("asset locked dedicado é usado quando a arte bloqueada existe",()=>{
    const available=TQ.screens.islands.getRegionIslandAsset(4,1,"available");
    const locked=TQ.screens.islands.getRegionIslandAsset(4,1,"locked");
    assert.notEqual(locked,available);
    assert.match(locked,/porto-da-geada-locked\.webp/);
});
