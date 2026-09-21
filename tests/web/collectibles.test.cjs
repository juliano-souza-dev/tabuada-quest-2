const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.playerState;

test("catálogo inicial possui 90 Colecionáveis únicos",()=>{
    const catalog=TQ.content.collectibles;
    assert.equal(catalog.length,90);
    assert.equal(new Set(catalog.map((item)=>item.id)).size,90);
    assert.equal(new Set(catalog.map((item)=>item.label)).size,90);
    for(const item of catalog){
        assert.ok(item.label.length>0);
        assert.deepEqual(item.bonusTypes,["xp","coins","gems"]);
        assert.equal(item.asset,null);
    }
});

test("estado inicial de Colecionáveis começa vazio",()=>{
    const s=d.createInitialState();
    assert.equal(s.schemaVersion,12);
    assert.deepEqual(s.campaign.collectibles,{collectedIds:[],pendingIds:[]});
});

test("coleta usa IDs do catálogo e não duplica",()=>{
    let s=d.createInitialState();
    const ids=TQ.content.collectibles.map((item)=>item.id);
    s=d.collectCollectible(s,ids[0],ids);
    s=d.collectCollectible(s,ids[0],ids);
    s=d.collectCollectible(s,"nao-existe",ids);
    assert.deepEqual(s.campaign.collectibles.collectedIds,[ids[0]]);
});
