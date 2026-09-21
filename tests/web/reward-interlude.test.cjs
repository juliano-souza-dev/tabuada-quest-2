const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/result-screen.js");

const TQ=globalThis.TabuadaQuest;

test("PET e Baú são recompensas adiadas na saída do resultado",()=>{
    assert.equal(
        TQ.screens.result.getDeferredReward({reward:{structural:[{type:"pet",petId:"pet-x"}]}}).type,
        "pet"
    );
    assert.equal(
        TQ.screens.result.getDeferredReward({reward:{structural:[{type:"chest",chestId:"chest-x"}]}}).type,
        "chest"
    );
    assert.equal(
        TQ.screens.result.getDeferredReward({reward:{structural:[{type:"map_fragment",mapId:1,fragment:1}]}}).type,
        "map_fragment"
    );
});

test("PET e Baú não são listados no painel da tela de resultado",()=>{
    const petHtml=TQ.screens.result.renderIslandRewards([{type:"pet",petId:"pet-x"}]);
    const chestHtml=TQ.screens.result.renderIslandRewards([{type:"chest",chestId:"chest-x"}]);
    const fragmentHtml=TQ.screens.result.renderIslandRewards([{type:"map_fragment",mapId:1,fragment:2}]);

    assert.equal(petHtml,"");
    assert.equal(chestHtml,"");
    assert.equal(fragmentHtml,"");
});

test("aplicação registra tela de PET e destino pós-recompensa",()=>{
    const app=fs.readFileSync(path.join(__dirname,"../../web/js/app.js"),"utf8");
    const index=fs.readFileSync(path.join(__dirname,"../../web/index.html"),"utf8");
    const chest=fs.readFileSync(path.join(__dirname,"../../web/js/screens/chest-screen.js"),"utf8");
    const pet=fs.readFileSync(path.join(__dirname,"../../web/js/screens/pet-screen.js"),"utf8");
    const mapReward=fs.readFileSync(path.join(__dirname,"../../web/js/screens/map-reward-screen.js"),"utf8");

    assert.match(app,/rewardReturnScreen/);
    assert.match(app,/pet:\s*TQ\.screens\.pet\.renderPetScreen/);
    assert.match(app,/"map-reward":\s*TQ\.screens\.mapReward\.renderMapRewardScreen/);
    assert.match(index,/screens\/pet-screen\.js/);
    assert.match(index,/screens\/map-reward-screen\.js/);
    assert.match(chest,/rewardReturnScreen === "regions"/);
    assert.match(pet,/rewardReturnScreen === "regions"/);
    assert.match(mapReward,/rewardReturnScreen === "regions"/);
    assert.match(mapReward,/fragmentos coletados/);
});
