const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;

test("CORSÁRIO mantém uma única composição de cinco slots",()=>{
    assert.match(content.assets.region1Modular.background,/region-1\/(?:mapa_marítimo_do_corsário\.png|background\.webp)/);
    assert.deepEqual(Object.keys(content.assets.region1Modular.islands),["1","2","3","4","5"]);
    assert.equal(content.assets.region1Modular.backgrounds[2],undefined);
});

test("CORSÁRIO publica as cinco Ilhas aprovadas",()=>{
    const visual=islands.getRegionVisualConfig(1);
    const page=islands.getRegionVisualPage({campaign:{regionProgress:{}}},1);
    assert.ok(visual);
    assert.equal(visual.id,"corsario");
    assert.equal("pages" in visual,false);
    assert.deepEqual(page.islandIds,[1,2,3,4,5]);
    assert.equal(page.hideIslands,false);

    for(let islandId=1;islandId<=5;islandId++){
        assert.match(
            islands.getRegionIslandAsset(1,islandId,"locked"),
            new RegExp(`island-0${islandId}-locked\\.(?:png|webp)`)
        );
        assert.match(
            islands.getRegionIslandAsset(1,islandId,"available"),
            new RegExp(`island-0${islandId}-unlocked\\.(?:png|webp)`)
        );
    }

    assert.equal(content.getIslandIdentity(1,1).label,"Enseada da Bandeira");
    assert.equal(content.getIslandPrimaryReward(1,1).type,"pet");

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

test("navio comercial da Loja Rubi é posicionado sem colidir com Ilhas ou Mapa Mundo",()=>{
    const page=islands.getRegionVisualPage({campaign:{regionProgress:{}}},1);
    const ship=islands.resolveRubyShopShipRect(page);
    assert.ok(ship);
    assert.deepEqual(ship,{x:688,y:832,width:220,height:220});

    const occupied=islands.getRegionOccupiedRects(page);
    for(const rect of occupied){
        assert.equal(
            islands.rectanglesOverlap(ship,rect,islands.RUBY_SHOP_SHIP_LAYOUT.clearance),
            false
        );
    }

    assert.match(content.assets.global.rubyShopMerchantShip,/assets\/global\/comercial_ship\.webp/);
    assert.equal(
        fs.existsSync(path.join(__dirname,"../../web/assets/global/comercial_ship.webp")),
        true
    );
});

test("Mapa Mundo permanece conectado ao controlador global",()=>{
    const source=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    assert.match(source,/data-action="open-world-map"/);
    assert.match(source,/TQ\.core\.worldMap\.open\(\{ onNavigate \}\)/);
});
