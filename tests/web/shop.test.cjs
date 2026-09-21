const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;

test("Estaleiro possui os três navios oficiais com preços aprovados e sem arte",()=>{
    assert.deepEqual(
        TQ.content.shopCatalog.ships.map((item)=>[item.label,item.price]),
        [["Colombo",1000],["Rosa Intenso",3000],["Cristal Queen",9000]]
    );
    for(const ship of TQ.content.shopCatalog.ships){
        assert.equal(ship.asset,null);
        assert.equal(ship.travelVideo,null);
    }
});

test("compra de navio desconta Ouro uma única vez e não equipa nada",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:5000}};
    const ship=TQ.content.shopCatalog.ships[0];
    s=d.purchaseShopItem(s,ship);
    assert.equal(s.wallet.coins,4000);
    assert.deepEqual(s.shop.purchasedItemIds,[ship.id]);
    assert.equal(Object.prototype.hasOwnProperty.call(s.shop,"equippedItemIds"),false);
    const again=d.purchaseShopItem(s,ship);
    assert.equal(again.wallet.coins,4000);
    assert.deepEqual(again.shop.purchasedItemIds,[ship.id]);
});

test("Ouro insuficiente não compra item",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:999}};
    const ship=TQ.content.shopCatalog.ships[0];
    const next=d.purchaseShopItem(s,ship);
    assert.equal(next.wallet.coins,999);
    assert.deepEqual(next.shop.purchasedItemIds,[]);
});

test("Loja possui cinco Molduras nomeadas sem arte e sem preço definido",()=>{
    const frames=TQ.content.shopCatalog.frames;
    assert.deepEqual(
        frames.map((item)=>item.label),
        ["Âncora Dourada","Coroa Corsária","Maré de Safira","Rubi do Capitão","Lenda do Kraken"]
    );
    assert.equal(frames.length,5);
    for(const frame of frames){
        assert.equal(frame.asset,null);
        assert.equal(frame.price,null);
    }
});

test("Fundos permanecem sem catálogo comercial até definição",()=>{
    assert.deepEqual(TQ.content.shopCatalog.backgrounds,[]);
});
