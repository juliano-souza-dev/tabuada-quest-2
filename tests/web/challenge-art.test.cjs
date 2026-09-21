const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

const TQ=globalThis.TabuadaQuest;

test("CORSÁRIO associa uma arte de desafio para cada uma das 5 Ilhas",()=>{
    const map=TQ.content.assets.region1ChallengeArt;
    assert.ok(map);

    for(let islandId=1;islandId<=5;islandId++){
        const asset=map[islandId];
        assert.match(asset,new RegExp(`region-1/challenges/island-0${islandId}-challenge\\.webp`));
        const cleanPath=asset.split("?")[0].replace(/^\.\//,"");
        assert.equal(
            fs.existsSync(path.join(__dirname,"../../web",cleanPath.replace(/^assets\//,"assets/"))),
            true,
            `asset ausente para Ilha ${islandId}: ${cleanPath}`
        );
    }
});

test("renderer mantém progresso, conta e respostas fora do asset",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),
        "utf8"
    );

    assert.match(source,/challenge-art-progress/);
    assert.match(source,/session\.plannedAnswered/);
    assert.match(source,/challenge\.table/);
    assert.match(source,/challenge\.multiplier/);
    assert.match(source,/data-answer/);
    assert.match(source,/getIslandIdentity/);
    assert.doesNotMatch(source,/<h1>Ilha \$\{session\.islandId\}<\/h1>/);
});
