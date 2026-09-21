const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;
const crew=TQ.content.crewMembers;
const config=TQ.content.gameplayRewards;

function regionState(){
    return {
        regionId:1,
        recoveryGap:2,
        mastery:{},
        recoveryQueue:[],
        plannedExposureCount:20,
        recoveryAttemptCount:0
    };
}

function result(islandId=1){
    return {
        regionId:1,
        islandId,
        plannedAnswered:20,
        correctAnswers:20,
        wrongAnswers:0,
        recoveryAnswers:0,
        totalAttempts:20
    };
}

test("cada partida concluída concede XP",()=>{
    let s=d.createInitialState();
    s=d.completeGameplaySession(s,result(1),regionState(),[],crew,config);
    assert.equal(s.progression.xpCurrent,20);
    assert.equal(s.learning.lastResult.reward.base.xp,20);
    assert.equal(s.learning.lastResult.reward.total.xp,20);
});

test("replay concede XP novamente sem repetir recompensa única",()=>{
    let s=d.createInitialState();
    const rewards=[
        {type:"pet",petId:"pet-test"},
        {type:"chest",chestId:"chest-test"},
        {type:"ruby"}
    ];
    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config,TQ.content);
    assert.equal(s.progression.xpCurrent,20);
    assert.equal(s.wallet.gems,20);
    assert.deepEqual(s.campaign.petsRescuedIds,["pet-test"]);
    assert.deepEqual(s.campaign.claimedChestIds,["chest-test"]);

    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config);
    assert.equal(s.progression.xpCurrent,40);
    assert.equal(s.wallet.gems,20);
    assert.deepEqual(s.campaign.petsRescuedIds,["pet-test"]);
    assert.deepEqual(s.campaign.claimedChestIds,["chest-test"]);
    assert.deepEqual(s.learning.lastResult.reward.structural,[]);
    assert.equal(s.learning.lastResult.reward.firstCompletion,false);
});

test("bônus de XP da Tripulação entra no valor creditado",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:10000}};
    for(const id of ["atirador","espadachim","medico"]){
        s=d.hireCrewMember(s,crew.find((member)=>member.id===id));
    }
    s=d.completeGameplaySession(s,result(1),regionState(),[],crew,config);
    assert.equal(s.learning.lastResult.reward.percent.xp,16);
    assert.equal(s.learning.lastResult.reward.bonus.xp,3);
    assert.equal(s.learning.lastResult.reward.total.xp,23);
    assert.equal(s.progression.xpCurrent,23);
});

test("bônus de gemas da Tripulação é aplicado ao Rubi da primeira conclusão",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:10000}};
    for(const id of ["cozinheiro","inventor","navegador"]){
        s=d.hireCrewMember(s,crew.find((member)=>member.id===id));
    }
    s=d.completeGameplaySession(
        s,
        result(1),
        regionState(),
        [{type:"ruby"}],
        crew,
        config
    );
    assert.equal(s.learning.lastResult.reward.percent.gems,16);
    assert.equal(s.learning.lastResult.reward.base.gems,20);
    assert.equal(s.learning.lastResult.reward.bonus.gems,3);
    assert.equal(s.learning.lastResult.reward.total.gems,23);
    assert.equal(s.wallet.gems,23);
});

test("XP faz rollover de nível usando xpRequired vigente",()=>{
    let s=d.createInitialState();
    s=d.grantXp(s,220);
    assert.equal(s.progression.level,3);
    assert.equal(s.progression.xpCurrent,20);
    assert.equal(s.progression.xpRequired,100);
});

test("30 Baús distribuem os 90 Colecionáveis-base sem repetição",()=>{
    const kits=Object.values(TQ.content.chestKits);
    assert.equal(kits.length,30);
    const ids=kits.flatMap((kit)=>kit.items.map((item)=>item.collectibleId));
    assert.equal(ids.length,90);
    assert.equal(new Set(ids).size,90);
    assert.deepEqual(ids,TQ.content.collectibles.map((item)=>item.id));
});

test("primeira conclusão com baú abre tela de baú e replay vai ao resultado",()=>{
    let s=d.createInitialState();
    const rewards=[{type:"chest",chestId:"chest-r1-i3"}];
    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config);
    assert.equal(s.ui.lastScreen,"chest");
    assert.equal(s.learning.lastResult.reward.structural[0].type,"chest");

    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config);
    assert.equal(s.ui.lastScreen,"result");
});


test("Rubi-base é acertos menos erros com mínimo zero",()=>{
    assert.equal(d.calculateRubyBaseAmount({correctAnswers:18,wrongAnswers:2},[{type:"ruby"}]),16);
    assert.equal(d.calculateRubyBaseAmount({correctAnswers:14,wrongAnswers:6},[{type:"ruby"}]),8);
    assert.equal(d.calculateRubyBaseAmount({correctAnswers:4,wrongAnswers:9},[{type:"ruby"}]),0);
    assert.equal(d.calculateRubyBaseAmount({correctAnswers:20,wrongAnswers:0},[{type:"pet",petId:"x"}]),0);
});

test("distribuição canônica cobre 110 Ilhas com uma recompensa principal cada",()=>{
    const totals={pet:0,chest:0,ruby:0,map_fragment:0};
    for(let regionId=1;regionId<=22;regionId++){
        for(let islandId=1;islandId<=5;islandId++){
            const rewards=TQ.content.getIslandRewards(regionId,islandId);
            assert.equal(rewards.length,1,`R${regionId}/I${islandId}`);
            assert.equal(TQ.content.getIslandPrimaryReward(regionId,islandId),rewards[0]);
            totals[rewards[0].type]+=1;
        }
    }
    assert.deepEqual(totals,{pet:30,chest:30,ruby:30,map_fragment:20});
});

test("fragmentos dos cinco Mapas Especiais ocupam as posições globais aprovadas",()=>{
    const world=TQ.domain.worldStructure;
    const expected={
        1:[2,5,8,10],
        2:[22,25,28,30],
        3:[42,45,48,50],
        4:[62,65,68,70],
        5:[92,95,98,100]
    };
    for(const [mapId,globals] of Object.entries(expected)){
        const found=[];
        for(let g=1;g<=110;g++){
            const loc=world.fromGlobalIslandIndex(g);
            const reward=TQ.content.getIslandPrimaryReward(loc.regionId,loc.islandId);
            if(reward?.type==="map_fragment" && reward.mapId===Number(mapId)) found.push(g);
        }
        assert.deepEqual(found,globals);
    }
});


test("últimas recompensas colocam Rubi na global 109 e Baú Final na 110",()=>{
    const world=TQ.domain.worldStructure;
    const g109=world.fromGlobalIslandIndex(109);
    const g110=world.fromGlobalIslandIndex(110);
    const reward109=TQ.content.getIslandPrimaryReward(g109.regionId,g109.islandId);
    const reward110=TQ.content.getIslandPrimaryReward(g110.regionId,g110.islandId);

    assert.equal(reward109.type,"ruby");
    assert.equal(reward110.type,"chest");
    assert.equal(reward110.chestId,"final-grand-chest");
    assert.equal(reward110.isFinalChest,true);
    assert.ok(TQ.content.getChestKit("final-grand-chest"));
});


test("Baú perfeito entrega os três itens-base",()=>{
    let s=d.createInitialState();
    const reward={type:"chest",chestId:"chest-r1-i3"};
    const processed=d.processChestCollectibles(s,result(3),reward,TQ.content,config);
    assert.equal(processed.outcome.tier,"perfect");
    assert.equal(processed.outcome.collectedIds.length,3);
    assert.equal(processed.state.campaign.collectibles.pendingIds.length,0);
});

test("Baú com desempenho baixo entrega um e redistribui dois",()=>{
    let s=d.createInitialState();
    const poor={...result(3),correctAnswers:12,wrongAnswers:8,totalAttempts:20};
    const reward={type:"chest",chestId:"chest-r1-i3"};
    const processed=d.processChestCollectibles(s,poor,reward,TQ.content,config);
    assert.equal(processed.outcome.tier,"one");
    assert.equal(processed.outcome.collectedIds.length,1);
    assert.equal(processed.state.campaign.collectibles.pendingIds.length,2);
});

test("próximo Baú recebe um pendente e perfeito pode entregar quatro",()=>{
    let s=d.createInitialState();
    const poor={...result(3),correctAnswers:12,wrongAnswers:8,totalAttempts:20};
    let first=d.processChestCollectibles(
        s,
        poor,
        {type:"chest",chestId:"chest-r1-i3"},
        TQ.content,
        config
    );
    const perfect={...result(1),correctAnswers:20,wrongAnswers:0,totalAttempts:20};
    const second=d.processChestCollectibles(
        first.state,
        perfect,
        {type:"chest",chestId:"chest-r2-i1"},
        TQ.content,
        config
    );
    assert.equal(second.outcome.availableIds.length,4);
    assert.equal(second.outcome.collectedIds.length,4);
    assert.equal(second.state.campaign.collectibles.pendingIds.length,1);
});

test("faixa operacional de até 20% de erros entrega dois itens",()=>{
    const performance=d.calculateChestCollectibleOutcome(
        {correctAnswers:16,wrongAnswers:4,totalAttempts:20},
        4,
        false,
        config
    );
    assert.equal(performance.tier,"two");
    assert.equal(performance.awardedCount,2);
});

test("Baú Final entrega próprios e todos os pendentes mesmo com erros",()=>{
    let s=d.createInitialState();
    s={
        ...s,
        campaign:{
            ...s.campaign,
            collectibles:{
                collectedIds:["collectible-001"],
                pendingIds:["collectible-002","collectible-003","collectible-004"]
            }
        }
    };
    const poor={regionId:22,islandId:5,correctAnswers:1,wrongAnswers:19,totalAttempts:20};
    const finalReward={type:"chest",chestId:"final-grand-chest",isFinalChest:true};
    const processed=d.processChestCollectibles(s,poor,finalReward,TQ.content,config);
    assert.equal(processed.outcome.isFinalChest,true);
    assert.equal(processed.outcome.collectedIds.length,6);
    assert.deepEqual(processed.state.campaign.collectibles.pendingIds,[]);
});
