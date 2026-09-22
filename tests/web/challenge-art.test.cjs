const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/challenge-screen.js");

const TQ=globalThis.TabuadaQuest;

test("CORSÁRIO associa os 5 fundos corretos na ordem aprovada",()=>{\n    const map=TQ.content.assets.region1ChallengeArt;\n    assert.ok(map);\n\n    const expected=[\n        "corsario-enseada-da-bandeira-challenge-bg.webp",\n        "corsario-enseada-do-saque-challenge-bg.webp",\n        "corsario-refugio-da-bandeira-challenge-bg.webp",\n        "corsario-ilha-do-vulcao-challenge-bg.webp",\n        "ilha_da_caveira_rosa.webp"\n    ];\n\n    for(let islandId=1;islandId<=5;islandId++){\n        const asset=map[islandId];\n        const cleanPath=asset.split("?")[0].replace(/^\.\//,"");\n        assert.ok(cleanPath.endsWith(expected[islandId-1]),`asset incorreto para Ilha ${islandId}: ${cleanPath}`);\n        assert.equal(\n            fs.existsSync(path.join(__dirname,"../../web",cleanPath)),\n            true,\n            `asset ausente para Ilha ${islandId}: ${cleanPath}`\n        );\n    }\n});\n\ntest("CORSÁRIO não renderiza progresso visual",()=>{\n    const css=fs.readFileSync(\n        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),\n        "utf8"\n    );\n\n    const selector='.challenge-art-screen[data-region-id="1"] .challenge-art-progress';\n    const start=css.indexOf(selector);\n    assert.ok(start>=0);\n\n    const block=css.slice(start,css.indexOf("}",start)+1);\n    assert.match(block,/display:\s*none/);\n\n    for(let islandId=1;islandId<=5;islandId++){\n        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);\n        assert.deepEqual(layout.progress,{x:0,y:0,width:0,height:0});\n        assert.equal(layout.progressMask,false);\n    }\n});\n\ntest("CORSÁRIO calibra conta e respostas nas áreas vazias de cada arte",()=>{\n    const expected={\n        1:{\n            question:{x:21.5,y:45.2,width:57.5,height:17.4},\n            answers:{x:14,y:64.7,width:72,height:20.9,columnGap:5.8,rowGap:5.8}\n        },\n        2:{\n            question:{x:21.5,y:26.2,width:58,height:26.8},\n            answers:{x:8.5,y:64.2,width:83,height:28.4,columnGap:6.2,rowGap:5.6}\n        },\n        3:{\n            question:{x:21.5,y:42.6,width:57.5,height:16.6},\n            answers:{x:20.5,y:60,width:59.5,height:22.4,columnGap:5.5,rowGap:4.8}\n        },\n        4:{\n            question:{x:21.5,y:39.1,width:57.5,height:18},\n            answers:{x:15,y:59.2,width:70,height:22.5,columnGap:5.5,rowGap:4.8}\n        },\n        5:{\n            question:{x:21,y:42.8,width:58.5,height:16.9},\n            answers:{x:20.2,y:60.8,width:60.2,height:21,columnGap:5.2,rowGap:4.8}\n        }\n    };\n\n    for(let islandId=1;islandId<=5;islandId++){\n        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);\n        assert.deepEqual(layout.question,expected[islandId].question);\n        assert.deepEqual(layout.answers,expected[islandId].answers);\n\n        for(const box of [layout.question,layout.answers]){\n            assert.ok(box.x>=0 && box.y>=0);\n            assert.ok(box.width>0 && box.height>0);\n            assert.ok(box.x+box.width<=100.5);\n            assert.ok(box.y+box.height<=100.5);\n        }\n    }\n});\n\ntest("renderer mantém conta e respostas dinâmicas fora do asset",()=>{\n    const source=fs.readFileSync(\n        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),\n        "utf8"\n    );\n\n    assert.match(source,/challenge\.table/);\n    assert.match(source,/challenge\.multiplier/);\n    assert.match(source,/data-answer/);\n    assert.match(source,/getIslandIdentity/);\n    assert.match(source,/getChallengeArtLayout/);\n    assert.match(source,/--challenge-question-x/);\n    assert.match(source,/--challenge-answers-x/);\n});\n\ntest("BIRADES possui malha visual própria para as 5 telas jogáveis",()=>{
    const layouts=TQ.screens.challenge.CHALLENGE_ART_LAYOUTS[2];
    assert.ok(layouts);

    const signatures=new Set();
    for(let islandId=1;islandId<=5;islandId++){
        const layout=TQ.screens.challenge.getChallengeArtLayout(2,islandId);
        assert.ok(layout);
        assert.ok(layout.question.y>layout.progress.y);
        assert.ok(layout.answers.y>layout.question.y);

        for(const box of [layout.progress,layout.question,layout.answers]){
            assert.ok(box.x>=0 && box.y>=0);
            assert.ok(box.width>0 && box.height>0);
            assert.ok(box.x+box.width<=100.5);
            assert.ok(box.y+box.height<=100.5);
        }

        signatures.add(JSON.stringify({
            progress:layout.progress,
            question:layout.question,
            answers:layout.answers
        }));
    }

    assert.equal(signatures.size,5);
});

test("resolver de arte de desafio é compartilhado por Região",()=>{
    assert.match(
        TQ.screens.challenge.getChallengeArt({regionId:1,islandId:1}),
        /region-1\/challenges\/island-01-challenge\.webp/
    );
    assert.match(
        TQ.screens.challenge.getChallengeArt({regionId:2,islandId:1}),
        /region-2\/challenges\/island-01-challenge\.webp/
    );

    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),
        "utf8"
    );
    assert.match(source,/region\$\{regionId\}ChallengeArt/);
    assert.doesNotMatch(source,/Number\(session\.regionId\) !== 1/);
});


test("BIRADES publica e mantém os 5 assets jogáveis físicos",()=>{
    const map=TQ.content.assets.region2ChallengeArt;
    assert.ok(map);

    for(let islandId=1;islandId<=5;islandId++){
        const asset=map[islandId];
        assert.match(
            asset,
            new RegExp(`region-2/challenges/island-0${islandId}-challenge\\.webp`)
        );

        const cleanPath=asset.split("?")[0].replace(/^\.\//,"");
        const physicalPath=path.join(__dirname,"../../web",cleanPath);
        assert.equal(
            fs.existsSync(physicalPath),
            true,
            `asset jogável ausente em BIRADES/Ilha ${islandId}: ${physicalPath}`
        );

        const size=fs.statSync(physicalPath).size;
        assert.ok(size>100_000, `asset BIRADES/Ilha ${islandId} pequeno demais: ${size}`);
        assert.ok(size<500_000, `asset BIRADES/Ilha ${islandId} pesado demais: ${size}`);
    }
});
