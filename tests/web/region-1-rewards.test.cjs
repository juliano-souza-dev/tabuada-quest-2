const test=require("node:test");
const assert=require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");

const TQ=globalThis.TabuadaQuest;
const content=TQ.content;
const world=TQ.domain.worldStructure;

function rewardAtGlobal(globalIndex){
    const loc=world.fromGlobalIslandIndex(globalIndex);
    return content.getIslandRewards(loc.regionId,loc.islandId);
}

test("dez recompensas históricas permanecem nas mesmas posições globais 1–10",()=>{
    for(let globalIndex=1;globalIndex<=10;globalIndex++){
        assert.equal(rewardAtGlobal(globalIndex).length,1);
    }
});

test("primeiras dez Ilhas preservam 4 fragmentos, 3 baús e 3 PETs",()=>{
    const rewards=Array.from({length:10},(_,i)=>rewardAtGlobal(i+1)).flat();
    assert.equal(rewards.filter(x=>x.type==="map_fragment").length,4);
    assert.equal(rewards.filter(x=>x.type==="chest").length,3);
    assert.equal(rewards.filter(x=>x.type==="pet").length,3);
});

test("quarto fragmento migra de antiga R1/I10 para nova R2/I5",()=>{
    assert.deepEqual(content.getIslandRewards(2,5)[0],{type:"map_fragment",mapId:1,fragment:4});
});

test("baús e PETs preservam seus índices globais",()=>{
    const chestGlobals=[];
    const petGlobals=[];
    for(let globalIndex=1;globalIndex<=10;globalIndex++){
        const reward=rewardAtGlobal(globalIndex)[0];
        if(reward.type==="chest")chestGlobals.push(globalIndex);
        if(reward.type==="pet")petGlobals.push(globalIndex);
    }
    assert.deepEqual(chestGlobals,[3,6,9]);
    assert.deepEqual(petGlobals,[1,4,7]);
});
