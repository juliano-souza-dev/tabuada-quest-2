const test=require("node:test");
const assert=require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
const content=globalThis.TabuadaQuest.content;

test("as 110 posições canônicas possuem identidade utilizável",()=>{
    const keys=new Set();
    for(let regionId=1;regionId<=22;regionId++){
        for(let islandId=1;islandId<=5;islandId++){
            const island=content.getIslandIdentity(regionId,islandId);
            assert.ok(island);
            assert.equal(island.regionId,regionId);
            assert.equal(island.id,islandId);
            assert.equal(island.challengeIdentity,"mixed");
            assert.ok(island.label.length>0);
            keys.add(`${regionId}:${islandId}`);
        }
    }
    assert.equal(keys.size,110);
});

test("OBSIDIANA preserva os cinco nomes oficiais",()=>{
    assert.deepEqual(
        Array.from({length:5},(_,i)=>content.getIslandIdentity(13,i+1).label),
        ["Rocha Negra","Cinzas","Fogo Obsidiano","Cratera","Coração de Obsidiana"]
    );
    assert.ok(Array.from({length:5},(_,i)=>content.getIslandIdentity(13,i+1)).every(x=>x.isPlaceholder!==true));
});

test("Ilhas ainda sem nome usam placeholder estável",()=>{
    const first=content.getIslandIdentity(1,1);
    const again=content.getIslandIdentity(1,1);
    const other=content.getIslandIdentity(1,2);
    assert.equal(first.isPlaceholder,true);
    assert.match(first.label,/^Ilha .+ \d{2}$/);
    assert.equal(first.label,again.label);
    assert.notEqual(first.label,other.label);
});

test("fallback recusa coordenadas fora de 22x5",()=>{
    assert.equal(content.createTemporaryIslandIdentity(23,1),null);
    assert.equal(content.createTemporaryIslandIdentity(1,6),null);
    assert.equal(content.createTemporaryIslandIdentity(0,1),null);
});
