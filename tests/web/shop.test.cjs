const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/content/challenge-effects.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;

test("Estaleiro possui os três navios oficiais e El Colombo já tem arte + animação",()=>{
    assert.deepEqual(
        TQ.content.shopCatalog.ships.map((item)=>[item.label,item.price]),
        [["El Colombo",1000],["Rosa Intenso",3000],["Cristal Queen",9000]]
    );
    const [colombo,...pendingShips]=TQ.content.shopCatalog.ships;
    const initial=d.createInitialState();
    assert.ok(initial.shop.purchasedItemIds.includes(colombo.id));
    assert.equal(initial.shop.equippedShipId,colombo.id);
    assert.equal(colombo.asset,"./assets/transitions/el-colombo/images/el-colombo.webp");
    assert.equal(colombo.travelAnimation,"./assets/transitions/el-colombo/el-colombo-ocean-navigation.json");
    assert.equal(Object.prototype.hasOwnProperty.call(colombo,"travelVideo"),false);
    for(const ship of pendingShips){
        assert.equal(ship.asset,null);
        assert.equal(ship.travelAnimation,null);
        assert.equal(Object.prototype.hasOwnProperty.call(ship,"travelVideo"),false);
    }
});

test("El Colombo já vem comprado e outro navio comprado não equipa automaticamente",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:5000}};
    const ship=TQ.content.shopCatalog.ships[1];
    s=d.purchaseShopItem(s,ship);
    assert.equal(s.wallet.coins,2000);
    assert.deepEqual(s.shop.purchasedItemIds,["ship-colombo",ship.id]);
    assert.equal(s.shop.equippedShipId,"ship-colombo");
    assert.equal(Object.prototype.hasOwnProperty.call(s.shop,"equippedItemIds"),false);
    const again=d.purchaseShopItem(s,ship);
    assert.equal(again.wallet.coins,2000);
    assert.deepEqual(again.shop.purchasedItemIds,["ship-colombo",ship.id]);
});

test("Ouro insuficiente não compra navio adicional",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:2999}};
    const ship=TQ.content.shopCatalog.ships[1];
    const next=d.purchaseShopItem(s,ship);
    assert.equal(next.wallet.coins,2999);
    assert.deepEqual(next.shop.purchasedItemIds,["ship-colombo"]);
});

test("Loja possui cinco Molduras com preços balanceados e sem arte",()=>{
    const frames=TQ.content.shopCatalog.frames;
    assert.deepEqual(
        frames.map((item)=>[item.label,item.price]),
        [
            ["Âncora Dourada",250],
            ["Coroa Corsária",450],
            ["Maré de Safira",700],
            ["Rubi do Capitão",1000],
            ["Lenda do Kraken",1400]
        ]
    );
    for(const frame of frames) assert.equal(frame.asset,null);
});

test("Loja possui cinco Fundos com preços balanceados e sem arte",()=>{
    const backgrounds=TQ.content.shopCatalog.backgrounds;
    assert.deepEqual(
        backgrounds.map((item)=>[item.label,item.price]),
        [
            ["Enseada Dourada",400],
            ["Porto Esmeralda",650],
            ["Mar Rubi",900],
            ["Noite do Kraken",1300],
            ["Horizonte Celeste",1800]
        ]
    );
    for(const background of backgrounds) assert.equal(background.asset,null);
});

test("compras de Moldura e Fundo usam a mesma carteira e continuam sem equipar",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:2000}};
    const frame=TQ.content.shopCatalog.frames[0];
    const background=TQ.content.shopCatalog.backgrounds[0];
    s=d.purchaseShopItem(s,frame);
    s=d.purchaseShopItem(s,background);
    assert.equal(s.wallet.coins,1350);
    assert.deepEqual(s.shop.purchasedItemIds,["ship-colombo",frame.id,background.id]);
    assert.ok(s.inventory.items.includes(frame.id));
    assert.equal(s.inventory.items.includes(background.id),false);
    assert.equal(s.player.profileFrameId,TQ.content.defaultProfileFrameId);
    assert.equal(Object.prototype.hasOwnProperty.call(s.shop,"equippedItemIds"),false);
});


test("comprar navio adicional não equipa automaticamente, mas Home pode equipar depois",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:5000}};
    const ship=TQ.content.shopCatalog.ships[1];

    s=d.purchaseShopItem(s,ship);
    assert.equal(s.shop.equippedShipId,"ship-colombo");

    s=d.withEquippedShip(
        s,
        ship.id,
        TQ.content.shopCatalog.ships.map((item)=>item.id)
    );
    assert.equal(s.shop.equippedShipId,ship.id);
});

test("navio não comprado nunca pode substituir o Colombo padrão",()=>{
    let s=d.createInitialState();
    const ids=TQ.content.shopCatalog.ships.map((item)=>item.id);
    s=d.withEquippedShip(s,ids[2],ids);
    assert.equal(s.shop.equippedShipId,"ship-colombo");
});


test("Loja expõe a categoria Efeitos com catálogo textual sem assets",()=>{
    assert.ok(TQ.content.shopCatalog.tabs.some((tab)=>tab.id==="effects"&&tab.label==="Efeitos"));
    const effects=TQ.content.shopCatalog.effects;
    assert.deepEqual(
        effects.map((item)=>[item.name,item.effectType,item.price]),
        [
            ["Brilho do Capitão","correct",300],
            ["Tesouro Encontrado","correct",600],
            ["Quase Lá","wrong",300],
            ["Nova Rota","wrong",600]
        ]
    );
    for(const effect of effects){
        assert.equal(effect.category,"effect");
        assert.equal(effect.asset,null);
        assert.equal(effect.renderer.kind,"text");
        assert.ok(effect.renderer.text.length>0);
    }
});

test("getShopItem encontra Efeitos comercializáveis",()=>{
    const effect=TQ.content.shopCatalog.effects[0];
    assert.equal(TQ.content.getShopItem(effect.id),effect);
});

test("compra de Efeito desconta Ouro, persiste propriedade e não equipa automaticamente",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:1000}};
    const effect=TQ.content.shopCatalog.effects[0];

    s=d.purchaseShopItem(s,effect);

    assert.equal(s.wallet.coins,700);
    assert.ok(s.shop.purchasedItemIds.includes(effect.id));
    assert.ok(s.inventory.items.includes(effect.id));
    assert.equal(s.inventory.equipped.correctEffectId,null);
    assert.equal(s.inventory.equipped.wrongEffectId,null);

    const again=d.purchaseShopItem(s,effect);
    assert.equal(again.wallet.coins,700);
    assert.equal(again.shop.purchasedItemIds.filter((id)=>id===effect.id).length,1);
});
