const test=require("node:test");const assert=require("node:assert/strict");global.TabuadaQuest={};require("../../web/js/domain/player-state.js");const d=global.TabuadaQuest.domain.playerState;
test("estado inicial v7 tem 11 regiões e estado de aprendizagem",()=>{const s=d.createInitialState();assert.equal(s.schemaVersion,7);assert.deepEqual(s.campaign.unlockedRegionIds,[1]);assert.equal(Object.keys(s.campaign.regionProgress).length,11);assert.equal(s.learning.activeSession,null)});
test("migração v5 adiciona estado de aprendizagem",()=>{const b=d.createInitialState();const old={...b,schemaVersion:5};delete old.learning;const m=d.normalizeState(old);assert.equal(m.schemaVersion,7);assert.equal(m.learning.activeSession,null)});
test("migração v4 adiciona campanha e aprendizagem",()=>{const b=d.createInitialState();const old={...b,schemaVersion:4,campaign:{currentRegionId:1,currentIslandId:1,unlockedRegionIds:[1],completedIslandIds:[],petsRescuedIds:[],claimedChestIds:[],specialMaps:b.campaign.specialMaps,diamonds:0}};delete old.learning;const m=d.normalizeState(old);assert.equal(m.schemaVersion,7);assert.equal(m.campaign.regionProgress["11"].islandsTotal,10)});
test("troca fundo e moldura só por catálogo",()=>{let s=d.createInitialState();s=d.withHomeBackground(s,"x",["pirate-main","x"]);assert.equal(s.ui.homeBackgroundId,"x");s=d.withProfileFrame(s,"tide-wheel",["simple","tide-wheel"]);assert.equal(s.player.profileFrameId,"tide-wheel")});
test("região bloqueada não seleciona",()=>{const s=d.createInitialState();assert.equal(d.selectRegion(s,2).campaign.currentRegionId,1)});
test("ilhas são liberadas sequencialmente",()=>{let s=d.createInitialState();assert.equal(d.getIslandStatus(s,1,1),"available");assert.equal(d.getIslandStatus(s,1,2),"locked");s=d.completeIsland(s,1,1);assert.equal(d.getIslandStatus(s,1,1),"completed");assert.equal(d.getIslandStatus(s,1,2),"available")});
test("10 ilhas liberam próxima região",()=>{let s=d.createInitialState();for(let i=1;i<=10;i++)s=d.completeIsland(s,1,i);assert.ok(s.campaign.completedRegionIds.includes(1));assert.ok(s.campaign.unlockedRegionIds.includes(2));assert.equal(d.getRegionStatus(s,2),"available")});
test("missão especial pendente segura desbloqueio",()=>{let s=d.createInitialState();s={...s,campaign:{...s.campaign,specialMaps:{...s.campaign.specialMaps,"1":{...s.campaign.specialMaps["1"],missionStatus:"map_complete_mission_pending"}}}};for(let i=1;i<=10;i++)s=d.completeIsland(s,1,i);assert.equal(s.campaign.unlockedRegionIds.includes(2),false);s={...s,campaign:{...s.campaign,specialMaps:{...s.campaign.specialMaps,"1":{...s.campaign.specialMaps["1"],missionStatus:"mission_completed"}}}};s=d.unlockNextRegionIfEligible(s,1);assert.ok(s.campaign.unlockedRegionIds.includes(2))});
test("Região 11 exige 9 fragmentos para Ilha 10",()=>{let s=d.createInitialState();s={...s,campaign:{...s.campaign,unlockedRegionIds:Array.from({length:11},(_,i)=>i+1)}};assert.equal(d.completeIsland(s,11,10).campaign.finalJourney.island10Completed,false);for(let i=1;i<=9;i++)s=d.completeIsland(s,11,i);assert.equal(s.campaign.finalJourney.finalMapFragments,9);assert.equal(s.campaign.finalJourney.island10Unlocked,true);s=d.completeIsland(s,11,10);assert.equal(s.campaign.finalJourney.finalGrandChestUnlocked,true)});
test("Grande Baú não consome os 30 baús",()=>{let s=d.createInitialState();s={...s,campaign:{...s.campaign,finalJourney:{...s.campaign.finalJourney,finalGrandChestUnlocked:true}}};const n=s.campaign.claimedChestIds.length;s=d.claimFinalGrandChest(s);assert.equal(s.campaign.finalJourney.finalGrandChestClaimed,true);assert.equal(s.campaign.claimedChestIds.length,n)});
test("estado inválido volta ao inicial",()=>{const s=d.normalizeState({schemaVersion:999,wallet:{coins:999}});assert.equal(s.schemaVersion,7);assert.equal(s.wallet.coins,0)});

test("recompensas estruturais da Região 1 persistem e o 4º fragmento bloqueia a próxima Região",()=>{
    let s=d.createInitialState();
    const regionState={regionId:1,recoveryGap:2,mastery:Object.fromEntries(Array.from({length:100},(_,i)=>[`k${i}`,{correctStreak:0}])),recoveryQueue:[],plannedExposureCount:0,recoveryAttemptCount:0};

    const rewards={
        1:[{type:"pet",petId:"pet-r1-i1"}],
        2:[{type:"map_fragment",mapId:1,fragment:1}],
        3:[{type:"chest",chestId:"chest-r1-i3"}],
        4:[{type:"pet",petId:"pet-r1-i4"}],
        5:[{type:"map_fragment",mapId:1,fragment:2}],
        6:[{type:"chest",chestId:"chest-r1-i6"}],
        7:[{type:"pet",petId:"pet-r1-i7"}],
        8:[{type:"map_fragment",mapId:1,fragment:3}],
        9:[{type:"chest",chestId:"chest-r1-i9"}],
        10:[{type:"map_fragment",mapId:1,fragment:4}]
    };

    for(let islandId=1;islandId<=10;islandId++){
        s=d.completeGameplaySession(s,{regionId:1,islandId},regionState,rewards[islandId]);
    }

    assert.equal(s.campaign.petsRescuedIds.length,3);
    assert.equal(s.campaign.claimedChestIds.length,3);
    assert.equal(s.campaign.specialMaps["1"].fragments,4);
    assert.equal(s.campaign.specialMaps["1"].missionStatus,"map_complete_mission_pending");
    assert.equal(s.campaign.completedRegionIds.includes(1),true);
    assert.equal(s.campaign.unlockedRegionIds.includes(2),false);
});


test("recuperação pendente não altera status visual da Ilha",()=>{
    let s=d.createInitialState();
    s=d.completeIsland(s,1,1);
    s={
        ...s,
        learning:{
            ...s.learning,
            regionStates:{
                "1":{
                    regionId:1,
                    recoveryGap:2,
                    mastery:{},
                    recoveryQueue:[{key:"2x3",table:2,multiplier:3,remainingGap:1}],
                    plannedExposureCount:20,
                    recoveryAttemptCount:0
                }
            }
        }
    };
    assert.equal(d.getIslandStatus(s,1,1),"completed");
    assert.equal(d.getIslandStatus(s,1,2),"available");
});


test("migração v6 preserva Ilhas já visitadas como viagem já exibida",()=>{
    const b=d.createInitialState();
    const old={
        ...b,
        schemaVersion:6,
        campaign:{
            ...b.campaign,
            completedIslandIds:["region-1-island-1"]
        }
    };
    delete old.campaign.travelPlayedIslandIds;
    const m=d.normalizeState(old);
    assert.equal(m.schemaVersion,7);
    assert.deepEqual(m.campaign.travelPlayedIslandIds,["region-1-island-1"]);
});

test("viagem de Ilha é exibida uma única vez e depois segue direto",()=>{
    let s=d.createInitialState();
    const regionState={
        regionId:1,
        recoveryGap:2,
        mastery:{},
        recoveryQueue:[],
        plannedExposureCount:0,
        recoveryAttemptCount:0
    };
    const session={
        version:1,
        regionId:1,
        islandId:1,
        seed:"r1-i1-test",
        plannedCursor:0,
        plannedAnswered:0,
        correctAnswers:0,
        wrongAnswers:0,
        recoveryAnswers:0,
        totalAttempts:0,
        phase:"question"
    };

    assert.equal(d.hasPlayedIslandTravel(s,1,1),false);

    s=d.withIslandTravelSession(s,session,regionState);
    assert.equal(s.ui.lastScreen,"travel");
    assert.equal(d.hasPlayedIslandTravel(s,1,1),false);

    s=d.completeIslandTravel(s,1,1);
    assert.equal(s.ui.lastScreen,"challenge");
    assert.equal(d.hasPlayedIslandTravel(s,1,1),true);

    const again=d.withGameplaySession(s,session,regionState);
    assert.equal(again.ui.lastScreen,"challenge");
});
