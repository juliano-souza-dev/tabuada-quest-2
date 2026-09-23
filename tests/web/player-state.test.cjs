const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/scheduler.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;

function specialMaps(){
    return Object.fromEntries(Array.from({length:5},(_,i)=>[
        String(i+1),{fragments:0,missionStatus:"collecting",rewardClaimed:false}
    ]));
}
function legacyRegionProgress(){
    return Object.fromEntries(Array.from({length:11},(_,i)=>[
        String(i+1),{islandsCompleted:0,islandsTotal:10}
    ]));
}
function legacyV8(){
    return {
        schemaVersion:8,
        player:{id:"local-player",displayName:"Explorador",avatarId:"luna",profileFrameId:"simple"},
        progression:{level:1,xpCurrent:0,xpRequired:100},
        wallet:{coins:0,gems:0},
        crew:{hiredIds:[]},
        campaign:{
            currentRegionId:1,currentIslandId:1,unlockedRegionIds:[1],completedRegionIds:[],
            completedIslandIds:[],travelPlayedIslandIds:[],regionProgress:legacyRegionProgress(),
            finalJourney:{finalMapFragments:0,finalMapCompleted:false,island10Unlocked:false,island10Completed:false,finalGrandChestUnlocked:false,finalGrandChestClaimed:false},
            petsRescuedIds:[],claimedChestIds:[],specialMaps:specialMaps(),diamonds:0
        },
        learning:{activeSession:null,regionStates:{},lastResult:null},
        ui:{lastScreen:"home",homeBackgroundId:"pirate-main"}
    };
}

test("estado inicial v17 usa 22 Regiões de 5 Ilhas",()=>{
    const s=d.createInitialState();
    assert.equal(s.schemaVersion,17);
    assert.deepEqual(s.campaign.unlockedRegionIds,[1]);
    assert.equal(Object.keys(s.campaign.regionProgress).length,22);
    assert.equal(s.campaign.regionProgress["22"].islandsTotal,5);
    assert.equal(s.learning.schedulerState,null);
    assert.deepEqual(s.shop,{purchasedItemIds:["ship-colombo"],equippedShipId:"ship-colombo"});
});

test("migração v8 traduz R1/I6 para R2/I1 sem perder progresso",()=>{
    const old=legacyV8();
    old.wallet.coins=777;
    old.crew.hiredIds=["atirador"];
    old.campaign.currentIslandId=6;
    old.campaign.regionProgress["1"].islandsCompleted=6;
    old.campaign.completedIslandIds=Array.from({length:6},(_,i)=>`region-1-island-${i+1}`);
    old.campaign.travelPlayedIslandIds=["region-1-island-6"];

    const m=d.normalizeState(old);
    assert.equal(m.schemaVersion,17);
    assert.equal(m.campaign.currentRegionId,2);
    assert.equal(m.campaign.currentIslandId,1);
    assert.equal(m.campaign.regionProgress["1"].islandsCompleted,5);
    assert.equal(m.campaign.regionProgress["2"].islandsCompleted,1);
    assert.ok(m.campaign.completedRegionIds.includes(1));
    assert.deepEqual(m.campaign.unlockedRegionIds,[1,2]);
    assert.ok(m.campaign.completedIslandIds.includes("region-2-island-1"));
    assert.deepEqual(m.campaign.travelPlayedIslandIds,["region-2-island-1"]);
    assert.equal(m.wallet.coins,777);
    assert.deepEqual(m.crew.hiredIds,["atirador"]);
});

test("migração v8 converte sessão ativa e une histórico pedagógico",()=>{
    const old=legacyV8();
    old.campaign.currentIslandId=6;
    old.learning.activeSession={
        version:1,regionId:1,islandId:6,seed:"legacy-r1-i6",
        plannedCursor:4,plannedAnswered:3,correctAnswers:2,wrongAnswers:1,
        recoveryAnswers:0,totalAttempts:3,phase:"question",currentChallenge:null,lastFeedback:null
    };
    old.learning.regionStates["1"]={
        regionId:1,recoveryGap:2,
        mastery:{"2x3":{correctStreak:1}},
        recoveryQueue:[{key:"2x3",table:2,multiplier:3,remainingGap:1}],
        plannedExposureCount:103,recoveryAttemptCount:7
    };

    const m=d.normalizeState(old);
    assert.equal(m.learning.activeSession.regionId,2);
    assert.equal(m.learning.activeSession.islandId,1);
    assert.equal(m.learning.activeSession.plannedAnswered,3);
    assert.equal(m.learning.schedulerState.regionId,2);
    assert.equal(m.learning.schedulerState.plannedExposureCount,103);
    assert.equal(m.learning.schedulerState.recoveryAttemptCount,7);
    assert.equal(m.learning.schedulerState.mastery["2x3"].correctStreak,1);
    assert.equal(m.learning.schedulerState.recoveryQueue[0].remainingGap,1);
});

test("migração v7 ainda cria Tripulação e termina em v17",()=>{
    const old=legacyV8();
    old.schemaVersion=7;
    delete old.crew;
    old.wallet.coins=321;
    const m=d.normalizeState(old);
    assert.equal(m.schemaVersion,17);
    assert.equal(m.wallet.coins,321);
    assert.deepEqual(m.crew.hiredIds,[]);
});

test("Ilhas são liberadas sequencialmente em grupos de cinco",()=>{
    let s=d.createInitialState();
    assert.equal(d.getIslandStatus(s,1,1),"available");
    assert.equal(d.getIslandStatus(s,1,2),"locked");
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,1,islandId);
    assert.ok(s.campaign.completedRegionIds.includes(1));
    assert.ok(s.campaign.unlockedRegionIds.includes(2));
    assert.equal(d.getRegionStatus(s,2),"available");
});

test("Jogar resolve a Região desbloqueada de acordo com a progressão",()=>{
    let s=d.createInitialState();
    assert.equal(d.getPlayRegionId(s),1);

    s=d.completeIsland(s,1,1);
    assert.equal(d.getPlayRegionId(s),1);

    for(let islandId=2;islandId<=5;islandId++) s=d.completeIsland(s,1,islandId);
    assert.equal(d.getRegionStatus(s,1),"completed");
    assert.equal(d.getRegionStatus(s,2),"available");
    assert.equal(d.getPlayRegionId(s),2);
});

test("Jogar não volta para Região concluída quando a próxima está desbloqueada",()=>{
    let s=d.createInitialState();
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,1,islandId);

    s={...s,campaign:{...s.campaign,currentRegionId:1}};
    assert.equal(d.getPlayRegionId(s),2);
});

test("gate do Mapa 1 acontece após a nova Região 2, no mesmo ponto global 10",()=>{
    let s=d.createInitialState();
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,1,islandId);
    s={...s,campaign:{...s.campaign,specialMaps:{...s.campaign.specialMaps,"1":{...s.campaign.specialMaps["1"],missionStatus:"map_complete_mission_pending"}}}};
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,2,islandId);
    assert.ok(s.campaign.completedRegionIds.includes(2));
    assert.equal(s.campaign.unlockedRegionIds.includes(3),false);
    s={...s,campaign:{...s.campaign,specialMaps:{...s.campaign.specialMaps,"1":{...s.campaign.specialMaps["1"],missionStatus:"mission_completed"}}}};
    s=d.unlockNextRegionIfEligible(s,2);
    assert.ok(s.campaign.unlockedRegionIds.includes(3));
});

test("arco final usa globais 101–109 e R22/I5 como Ilha final",()=>{
    let s=d.createInitialState();
    s={...s,campaign:{...s.campaign,unlockedRegionIds:Array.from({length:22},(_,i)=>i+1)}};
    assert.equal(d.getIslandStatus(s,22,5),"locked");
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,21,islandId);
    for(let islandId=1;islandId<=4;islandId++) s=d.completeIsland(s,22,islandId);
    assert.equal(s.campaign.finalJourney.finalMapFragments,9);
    assert.equal(s.campaign.finalJourney.finalMapCompleted,true);
    assert.equal(s.campaign.finalJourney.finalIslandUnlocked,true);
    assert.equal(d.getIslandStatus(s,22,5),"available");
    s=d.completeIsland(s,22,5);
    assert.equal(s.campaign.finalJourney.finalIslandCompleted,true);
    assert.equal(s.campaign.finalJourney.finalGrandChestUnlocked,true);
    s=d.claimFinalGrandChest(s);
    assert.equal(s.campaign.finalJourney.finalGrandChestClaimed,true);
    assert.equal(s.campaign.claimedChestIds.length,0);
});

test("recuperação pedagógica atravessa fronteira visual",()=>{
    let s=d.createInitialState();
    const schedulerState={regionId:1,recoveryGap:2,mastery:{},recoveryQueue:[{key:"2x3",table:2,multiplier:3,remainingGap:1}],plannedExposureCount:100,recoveryAttemptCount:1};
    s={...s,learning:{...s.learning,schedulerState}};
    for(let islandId=1;islandId<=5;islandId++) s=d.completeIsland(s,1,islandId);
    const continued=d.getRegionLearningState(s,2);
    assert.equal(continued.regionId,2);
    assert.equal(continued.recoveryQueue.length,1);
    assert.equal(d.getIslandStatus(s,2,1),"available");
});

test("estado inválido volta ao inicial v17",()=>{
    const s=d.normalizeState({schemaVersion:999,wallet:{coins:999}});
    assert.equal(s.schemaVersion,17);
    assert.equal(s.wallet.coins,0);
});


test("migração v9 adiciona estado persistente de Colecionáveis sem perder progresso",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:9,campaign:{...current.campaign}};
    delete old.campaign.collectibles;
    old.wallet.coins=432;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.campaign.collectibles,{collectedIds:[],pendingIds:[]});
    assert.equal(migrated.wallet.coins,432);
});

test("Colecionável coletado persiste de forma idempotente",()=>{
    const allowed=["collectible-001","collectible-002"];
    let s=d.createInitialState();
    s=d.collectCollectible(s,"collectible-001",allowed);
    s=d.collectCollectible(s,"collectible-001",allowed);
    assert.deepEqual(s.campaign.collectibles.collectedIds,["collectible-001"]);
    assert.deepEqual(s.campaign.collectibles.pendingIds,[]);
});


test("migração v10 cria estado da Loja v12 sem perder Ouro",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:10};
    delete old.shop;
    old.wallet.coins=9876;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.shop,{purchasedItemIds:["ship-colombo"],equippedShipId:"ship-colombo"});
    assert.equal(migrated.wallet.coins,9876);
});


test("migração v10 cria estado da Loja sem perder Ouro",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:10};
    delete old.shop;
    old.wallet.coins=9876;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.shop,{purchasedItemIds:["ship-colombo"],equippedShipId:"ship-colombo"});
    assert.equal(migrated.wallet.coins,9876);
});


test("migração v11 termina com El Colombo possuído e equipado",()=>{
    const current=d.createInitialState();
    const old={
        ...current,
        schemaVersion:11,
        shop:{purchasedItemIds:["ship-colombo"]}
    };
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.shop,{
        purchasedItemIds:["ship-colombo"],
        equippedShipId:"ship-colombo"
    });
});

test("El Colombo é navio padrão e outros navios só equipam depois da compra",()=>{
    const allowed=["ship-colombo","ship-rosa-intenso"];
    let s=d.createInitialState();
    assert.deepEqual(s.shop.purchasedItemIds,["ship-colombo"]);
    assert.equal(s.shop.equippedShipId,"ship-colombo");

    const invalid=d.withEquippedShip(s,"ship-rosa-intenso",allowed);
    assert.equal(invalid.shop.equippedShipId,"ship-colombo");

    s={
        ...s,
        shop:{
            ...s.shop,
            purchasedItemIds:["ship-colombo","ship-rosa-intenso"]
        }
    };
    s=d.withEquippedShip(s,"ship-rosa-intenso",allowed);
    assert.equal(s.shop.equippedShipId,"ship-rosa-intenso");
});

test("migração v16 concede El Colombo sem substituir outro navio já equipado",()=>{
    const current=d.createInitialState();
    const old={
        ...current,
        schemaVersion:16,
        shop:{
            purchasedItemIds:["ship-rosa-intenso"],
            equippedShipId:"ship-rosa-intenso"
        }
    };
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.shop.purchasedItemIds,["ship-colombo","ship-rosa-intenso"]);
    assert.equal(migrated.shop.equippedShipId,"ship-rosa-intenso");
});


test("migração v12 adiciona pedidos da Loja Rubi sem perder carteira",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:12};
    delete old.rubyShop;
    old.wallet={coins:321,gems:87};
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,17);
    assert.equal(migrated.wallet.coins,321);
    assert.equal(migrated.wallet.gems,87);
    assert.deepEqual(migrated.rubyShop,{orders:[]});
});

test("Loja Rubi debita Rubis e grava pedido local atomicamente",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,gems:100}};
    const item={id:"test-physical",label:"Item físico",priceRubies:40,available:true};
    s=d.purchaseRubyShopItem(s,item,{id:"order-1",createdAt:"2026-09-21T15:00:00.000Z"});
    assert.equal(s.wallet.gems,60);
    assert.equal(s.rubyShop.orders.length,1);
    assert.deepEqual(s.rubyShop.orders[0],{
        id:"order-1",
        itemId:"test-physical",
        label:"Item físico",
        priceRubies:40,
        status:"local_pending",
        createdAt:"2026-09-21T15:00:00.000Z"
    });
});

test("Loja Rubi não compra sem saldo e não cobra pedido duplicado",()=>{
    const item={id:"test-physical",label:"Item físico",priceRubies:40,available:true};
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,gems:30}};
    const unchanged=d.purchaseRubyShopItem(s,item,{id:"order-1",createdAt:"2026-09-21T15:00:00.000Z"});
    assert.equal(unchanged.wallet.gems,30);
    assert.equal(unchanged.rubyShop.orders.length,0);

    s={...s,wallet:{...s.wallet,gems:100}};
    s=d.purchaseRubyShopItem(s,item,{id:"order-1",createdAt:"2026-09-21T15:00:00.000Z"});
    const duplicate=d.purchaseRubyShopItem(s,item,{id:"order-1",createdAt:"2026-09-21T15:01:00.000Z"});
    assert.equal(duplicate.wallet.gems,60);
    assert.equal(duplicate.rubyShop.orders.length,1);
});


test("desbloqueio da Loja Rubi respeita Região elegível e regra configurada",()=>{
    const enabled=[1,5,9,13,17,21];
    const defaultRule={type:"after_island",islandId:1};
    let s=d.createInitialState();

    assert.equal(d.isRubyShopUnlocked(s,1,defaultRule,enabled),false);
    s=d.completeIsland(s,1,1);
    assert.equal(d.isRubyShopUnlocked(s,1,defaultRule,enabled),true);
    assert.equal(d.isRubyShopUnlocked(s,2,defaultRule,enabled),false);

    const regionCompleteRule={type:"after_region_complete"};
    assert.equal(d.isRubyShopUnlocked(s,1,regionCompleteRule,enabled),false);
    for(let islandId=2;islandId<=5;islandId++) {
        s=d.completeIsland(s,1,islandId);
    }
    assert.equal(d.isRubyShopUnlocked(s,1,regionCompleteRule,enabled),true);
});


test("inventário de Efeitos nasce vazio e separado da Loja",()=>{
    const s=d.createInitialState();
    assert.deepEqual(s.inventory,{
        items:[],
        equipped:{correctEffectId:null,wrongEffectId:null}
    });
});

test("migração v13 cria inventário e chega ao schema v17",()=>{
    const current=d.createInitialState();
    const old={
        ...current,
        schemaVersion:13,
        shop:{
            purchasedItemIds:["effect-correct-brilho-capitao","ship-colombo"],
            equippedShipId:"ship-colombo"
        }
    };
    delete old.inventory;

    const migrated=d.normalizeState(old);

    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.inventory.items,["effect-correct-brilho-capitao"]);
    assert.deepEqual(migrated.inventory.equipped,{
        correctEffectId:null,
        wrongEffectId:null
    });
    assert.equal(migrated.shop.equippedShipId,"ship-colombo");
});

test("Efeito só equipa se estiver no inventário e pode ser removido",()=>{
    const correctId="effect-correct-brilho-capitao";
    const wrongId="effect-wrong-quase-la";
    let s=d.createInitialState();

    s=d.withEquippedEffect(s,"correct",correctId,[correctId]);
    assert.equal(s.inventory.equipped.correctEffectId,null);

    s={
        ...s,
        shop:{...s.shop,purchasedItemIds:["ship-colombo",correctId,wrongId]},
        inventory:{
            items:[correctId,wrongId],
            equipped:{correctEffectId:null,wrongEffectId:null}
        }
    };

    s=d.withEquippedEffect(s,"correct",correctId,[correctId]);
    assert.equal(s.inventory.equipped.correctEffectId,correctId);
    assert.equal(d.getEquippedEffectId(s,"correct"),correctId);

    s=d.withEquippedEffect(s,"wrong",wrongId,[wrongId]);
    assert.equal(s.inventory.equipped.wrongEffectId,wrongId);

    s=d.withEquippedEffect(s,"correct",null,[correctId]);
    assert.equal(s.inventory.equipped.correctEffectId,null);
    assert.equal(s.inventory.equipped.wrongEffectId,wrongId);
});

test("rota items é persistível pelo player-state",()=>{
    const s=d.withLastScreen(d.createInitialState(),"items");
    assert.equal(s.ui.lastScreen,"items");
});


test("migração v14 adiciona Molduras compradas ao inventário",()=>{
    const current=d.createInitialState();
    const effectId="effect-correct-brilho-capitao";
    const frameId="frame-ancora-dourada";
    const old={
        ...current,
        schemaVersion:14,
        shop:{
            ...current.shop,
            purchasedItemIds:[effectId,frameId]
        },
        inventory:{
            items:[effectId],
            equipped:{correctEffectId:effectId,wrongEffectId:null}
        }
    };

    const migrated=d.normalizeState(old);

    assert.equal(migrated.schemaVersion,17);
    assert.deepEqual(migrated.inventory.items,[effectId,frameId]);
    assert.equal(migrated.inventory.equipped.correctEffectId,effectId);
});

test("Moldura comprada entra no inventário mas não equipa automaticamente",()=>{
    const frame={id:"frame-ancora-dourada",type:"frame",label:"Âncora Dourada",price:250};
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:500}};
    s=d.purchaseShopItem(s,frame);

    assert.equal(s.wallet.coins,250);
    assert.ok(s.inventory.items.includes(frame.id));
    assert.equal(s.player.profileFrameId,d.DEFAULT_PROFILE_FRAME_ID);
});


test("novo perfil começa limpo, marcado como criado e vincula identidade",()=>{
    const s=d.createFreshProfile("Alana","maya","firebase-uid-123",["luna","maya","sofia"]);
    assert.equal(s.schemaVersion,17);
    assert.equal(s.player.profileCreated,true);
    assert.equal(s.player.displayName,"Alana");
    assert.equal(s.player.avatarId,"maya");
    assert.equal(s.player.id,"firebase-uid-123");
    assert.equal(s.wallet.coins,0);
    assert.equal(s.campaign.completedIslandIds.length,0);
    assert.equal(s.ui.lastScreen,"home");
});
