const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/content/challenge-effects.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");
require("../../web/js/screens/items-screen.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;

test("Baú lista somente Efeitos possuídos",()=>{
    let state=d.createInitialState();
    const correct=TQ.content.shopCatalog.effects[0];
    const wrong=TQ.content.shopCatalog.effects[2];
    state={
        ...state,
        shop:{...state.shop,purchasedItemIds:[correct.id,wrong.id]},
        inventory:{
            items:[correct.id,wrong.id],
            equipped:{correctEffectId:null,wrongEffectId:null}
        }
    };

    assert.deepEqual(
        TQ.screens.items.getOwnedEffects(state).map((item)=>item.id),
        [correct.id,wrong.id]
    );
});

test("Home abre Baú e app registra rota items",()=>{
    const home=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    const index=fs.readFileSync(
        path.join(__dirname,"../../web/index.html"),
        "utf8"
    );

    assert.match(home,/if \(action === "items"\)/);
    assert.match(home,/onNavigate\("items"\)/);
    assert.match(app,/items: TQ\.screens\.items\.renderItemsScreen/);
    assert.match(index,/screens\/items-screen\.js/);
});

test("efeito comprado entra no inventário e pode ser equipado por slot",()=>{
    let state=d.createInitialState();
    state={...state,wallet:{...state.wallet,coins:2000}};

    const correct=TQ.content.shopCatalog.effects[0];
    const wrong=TQ.content.shopCatalog.effects[2];

    state=d.purchaseShopItem(state,correct);
    state=d.purchaseShopItem(state,wrong);

    assert.deepEqual(state.inventory.items,[correct.id,wrong.id]);

    state=d.withEquippedEffect(state,"correct",correct.id,[correct.id]);
    state=d.withEquippedEffect(state,"wrong",wrong.id,[wrong.id]);

    assert.equal(state.inventory.equipped.correctEffectId,correct.id);
    assert.equal(state.inventory.equipped.wrongEffectId,wrong.id);
    assert.equal(TQ.effects.resolveEquippedEffect(state,"correct").id,correct.id);
    assert.equal(TQ.effects.resolveEquippedEffect(state,"wrong").id,wrong.id);
});

test("remover Efeito customizado devolve resolver ao fallback padrão",()=>{
    const effect=TQ.content.shopCatalog.effects[0];
    let state=d.createInitialState();
    state={
        ...state,
        shop:{...state.shop,purchasedItemIds:[effect.id]},
        inventory:{
            items:[effect.id],
            equipped:{correctEffectId:effect.id,wrongEffectId:null}
        }
    };

    state=d.withEquippedEffect(state,"correct",null,[effect.id]);

    assert.equal(state.inventory.equipped.correctEffectId,null);
    assert.equal(
        TQ.effects.resolveEquippedEffect(state,"correct").id,
        TQ.effects.DEFAULT_EFFECT_IDS.correct
    );
});


test("Baú lista Molduras base e Molduras compradas",()=>{
    let state=d.createInitialState();
    const frame=TQ.content.shopCatalog.frames[0];
    state={
        ...state,
        shop:{...state.shop,purchasedItemIds:[frame.id]},
        inventory:{
            ...state.inventory,
            items:[frame.id]
        }
    };

    const ids=TQ.screens.items.getOwnedFrames(state).map((item)=>item.id);
    assert.ok(ids.includes(TQ.content.defaultProfileFrameId));
    assert.ok(ids.includes(frame.id));
});

test("Moldura comercial não comprada não aparece no Baú",()=>{
    const state=d.createInitialState();
    const commercialIds=new Set(TQ.content.shopCatalog.frames.map((item)=>item.id));
    const listed=TQ.screens.items.getOwnedFrames(state).map((item)=>item.id);

    assert.equal(listed.some((id)=>commercialIds.has(id)),false);
});

test("Home reserva Moda para skins e não contém seletor de Molduras",()=>{
    const home=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );

    assert.match(home,/data-action="fashion"/);
    assert.match(home,/data-sheet="fashion"/);
    assert.doesNotMatch(home,/data-sheet="frames"/);
    assert.doesNotMatch(home,/data-action="frames"/);
    assert.doesNotMatch(home,/data-frame-id/);
});

test("perfil da Home direciona troca de Moldura para o Baú de Itens",()=>{
    const home=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );

    assert.match(home,/profile-slot[^>]+data-action="items"/);
    assert.match(home,/Abrir Baú de Itens para trocar moldura/);
});
