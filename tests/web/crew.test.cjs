const test=require("node:test");
const assert=require("node:assert/strict");

global.TabuadaQuest={};
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;
const crew=TQ.content.crewMembers;

test("catálogo contém os nove tripulantes reais",()=>{
    assert.deepEqual(crew.map(x=>x.label),["Atirador","Carpinteiro","Cozinheiro","Espadachim","Explorador","Inventor","Médico","Músico","Navegador"]);
    assert.equal(new Set(crew.map(x=>x.id)).size,9);
});

test("estado v9 inicia sem tripulantes contratados",()=>{
    const s=d.createInitialState();
    assert.equal(s.schemaVersion,9);
    assert.deepEqual(s.crew.hiredIds,[]);
});

test("contratação desconta ouro uma única vez",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:1000}};
    const member=crew[0];
    s=d.hireCrewMember(s,member);
    assert.equal(s.wallet.coins,1000-member.cost);
    assert.deepEqual(s.crew.hiredIds,[member.id]);
    const again=d.hireCrewMember(s,member);
    assert.equal(again.wallet.coins,s.wallet.coins);
    assert.deepEqual(again.crew.hiredIds,[member.id]);
});

test("ouro insuficiente não contrata",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:crew[8].cost-1}};
    const next=d.hireCrewMember(s,crew[8]);
    assert.equal(next.wallet.coins,s.wallet.coins);
    assert.deepEqual(next.crew.hiredIds,[]);
});

test("bônus contratados acumulam por categoria",()=>{
    let s=d.createInitialState();
    s={...s,wallet:{...s.wallet,coins:10000}};
    for(const id of ["atirador","espadachim","medico"]){
        s=d.hireCrewMember(s,crew.find(x=>x.id===id));
    }
    const summary=d.getCrewBonusSummary(s,crew);
    assert.equal(summary.xp,16);
    const reward=d.calculateCrewReward(s,crew,{xp:100,coins:50,gems:10});
    assert.equal(reward.total.xp,116);
    assert.equal(reward.total.coins,50);
    assert.equal(reward.total.gems,10);
});
