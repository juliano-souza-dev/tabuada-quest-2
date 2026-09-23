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


test("Ilhas 1 e 2 de Terras Gélidas estão ligadas aos WebPs otimizados",()=>{
    const assets=TQ.content.assets.region4Modular.islands;
    assert.match(assets[1].unlocked,/region-4\/island-01-unlocked\.webp/);
    assert.match(assets[2].unlocked,/region-4\/island-02-unlocked\.webp/);
    assert.equal(assets[1].locked,null);
    assert.equal(assets[2].locked,null);

    for(const id of [1,2]){
        const relative=assets[id].unlocked.split("?")[0].replace(/^\.\//,"");
        const absolute=path.join(__dirname,"../../web",relative);
        assert.equal(fs.existsSync(absolute),true);
        const size=fs.statSync(absolute).size;
        assert.ok(size<500_000,`Ilha ${id} ficou pesada: ${size} bytes`);
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
    assert.deepEqual(visual.slotLayout[1].art,{x:620,y:676,width:300,height:300});
    assert.deepEqual(visual.slotLayout[2].art,{x:225,y:832,width:300,height:300});
    assert.deepEqual(visual.slotLayout[3].art,{x:620,y:1010,width:300,height:300});
    assert.deepEqual(visual.slotLayout[4].art,{x:225,y:1163,width:300,height:300});
    assert.deepEqual(visual.slotLayout[5].art,{x:37,y:1381,width:300,height:270});
});

test("asset locked ausente usa o desbloqueado como fallback até a arte bloqueada existir",()=>{
    const available=TQ.screens.islands.getRegionIslandAsset(4,1,"available");
    const locked=TQ.screens.islands.getRegionIslandAsset(4,1,"locked");
    assert.equal(locked,available);
});
