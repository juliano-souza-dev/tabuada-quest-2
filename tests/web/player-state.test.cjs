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

test("estado inicial v11 usa 22 Regiões de 5 Ilhas",()=>{
    const s=d.createInitialState();
    assert.equal(s.schemaVersion,11);
    assert.deepEqual(s.campaign.unlockedRegionIds,[1]);
    assert.equal(Object.keys(s.campaign.regionProgress).length,22);
    assert.equal(s.campaign.regionProgress["22"].islandsTotal,5);
    assert.equal(s.learning.schedulerState,null);
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
    assert.equal(m.schemaVersion,11);
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

test("migração v7 ainda cria Tripulação e termina em v11",()=>{
    const old=legacyV8();
    old.schemaVersion=7;
    delete old.crew;
    old.wallet.coins=321;
    const m=d.normalizeState(old);
    assert.equal(m.schemaVersion,11);
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

test("estado inválido volta ao inicial v11",()=>{
    const s=d.normalizeState({schemaVersion:999,wallet:{coins:999}});
    assert.equal(s.schemaVersion,11);
    assert.equal(s.wallet.coins,0);
});


test("migração v9 adiciona estado persistente de Colecionáveis sem perder progresso",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:9,campaign:{...current.campaign}};
    delete old.campaign.collectibles;
    old.wallet.coins=432;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,11);
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


test("migração v11 cria carteira de compras da Loja sem perder Ouro",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:10};
    delete old.shop;
    old.wallet.coins=9876;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,11);
    assert.deepEqual(migrated.shop,{purchasedItemIds:[]});
    assert.equal(migrated.wallet.coins,9876);
});


test("migração v10 cria estado da Loja sem perder Ouro",()=>{
    const current=d.createInitialState();
    const old={...current,schemaVersion:10};
    delete old.shop;
    old.wallet.coins=9876;
    const migrated=d.normalizeState(old);
    assert.equal(migrated.schemaVersion,11);
    assert.deepEqual(migrated.shop,{purchasedItemIds:[]});
    assert.equal(migrated.wallet.coins,9876);
});
