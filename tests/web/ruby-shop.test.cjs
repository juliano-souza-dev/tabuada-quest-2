const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=globalThis.TabuadaQuest;
const d=TQ.domain.playerState;

test("catálogo local da Loja Rubi começa na Região 14",()=>{
    assert.equal(TQ.content.rubyShopCatalog.mode,"local");
    assert.deepEqual(TQ.content.rubyShopCatalog.enabledRegionIds,[14]);
    assert.equal(TQ.content.regionHasRubyShop(14),true);
    assert.equal(TQ.content.regionHasRubyShop(13),false);
    assert.equal(TQ.content.rubyShopCatalog.items.length,3);
    assert.ok(TQ.content.rubyShopCatalog.items.every(item=>item.isDevelopmentItem===true));
});

test("compra da Loja Rubi permite pedidos repetidos com IDs distintos",()=>{
    const item=TQ.content.rubyShopCatalog.items[0];
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,gems:item.priceRubies*2}};
    s=d.purchaseRubyShopItem(s,item,{id:"a",createdAt:"2026-09-21T15:00:00.000Z"});
    s=d.purchaseRubyShopItem(s,item,{id:"b",createdAt:"2026-09-21T15:01:00.000Z"});
    assert.equal(s.wallet.gems,0);
    assert.equal(s.rubyShop.orders.length,2);
});

test("rota ruby-shop e gatilho regional estão conectados",()=>{
    const app=fs.readFileSync(path.join(__dirname,"../../web/js/app.js"),"utf8");
    const islands=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    const index=fs.readFileSync(path.join(__dirname,"../../web/index.html"),"utf8");
    assert.match(app,/"ruby-shop": TQ\.screens\.rubyShop\.renderRubyShopScreen/);
    assert.match(islands,/data-action="open-ruby-shop"/);
    assert.match(index,/ruby-shop-screen\.js/);
});
