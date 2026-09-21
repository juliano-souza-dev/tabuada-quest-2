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
        {type:"ruby",amount:50}
    ];
    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config);
    assert.equal(s.progression.xpCurrent,20);
    assert.equal(s.wallet.gems,50);
    assert.deepEqual(s.campaign.petsRescuedIds,["pet-test"]);
    assert.deepEqual(s.campaign.claimedChestIds,["chest-test"]);

    s=d.completeGameplaySession(s,result(1),regionState(),rewards,crew,config);
    assert.equal(s.progression.xpCurrent,40);
    assert.equal(s.wallet.gems,50);
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
        [{type:"ruby",amount:100}],
        crew,
        config
    );
    assert.equal(s.learning.lastResult.reward.percent.gems,16);
    assert.equal(s.learning.lastResult.reward.bonus.gems,16);
    assert.equal(s.learning.lastResult.reward.total.gems,116);
    assert.equal(s.wallet.gems,116);
});

test("XP faz rollover de nível usando xpRequired vigente",()=>{
    let s=d.createInitialState();
    s=d.grantXp(s,220);
    assert.equal(s.progression.level,3);
    assert.equal(s.progression.xpCurrent,20);
    assert.equal(s.progression.xpRequired,100);
});

test("baús configurados possuem kit extensível inicialmente vazio",()=>{
    const kit=TQ.content.getChestKit("chest-r1-i3");
    assert.ok(kit);
    assert.equal(kit.id,"chest-r1-i3");
    assert.deepEqual(kit.items,[]);
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
