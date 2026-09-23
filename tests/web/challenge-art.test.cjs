const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/challenge-screen.js");

const TQ=globalThis.TabuadaQuest;

test("CORSÁRIO associa os 5 fundos corretos na ordem aprovada",()=>{
    const map=TQ.content.assets.region1ChallengeArt;
    assert.ok(map);

    const expected=[
        "corsario-enseada-da-bandeira-challenge-bg.webp",
        "corsario-enseada-do-saque-challenge-bg.webp",
        "corsario-refugio-da-bandeira-challenge-bg.webp",
        "corsario-ilha-do-vulcao-challenge-bg.webp",
        "ilha_da_caveira_rosa.webp"
    ];

    for(let islandId=1;islandId<=5;islandId++){
        const asset=map[islandId];
        const cleanPath=asset.split("?")[0].replace(/^\.\//,"");
        assert.ok(cleanPath.endsWith(expected[islandId-1]),`asset incorreto para Ilha ${islandId}: ${cleanPath}`);
        assert.equal(
            fs.existsSync(path.join(__dirname,"../../web",cleanPath)),
            true,
            `asset ausente para Ilha ${islandId}: ${cleanPath}`
        );
    }
});

test("CORSÁRIO não renderiza progresso visual",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    const selector='.challenge-art-screen[data-region-id="1"] .challenge-art-progress';
    const start=css.indexOf(selector);
    assert.ok(start>=0);

    const block=css.slice(start,css.indexOf("}",start)+1);
    assert.match(block,/display:\s*none/);

    for(let islandId=1;islandId<=5;islandId++){
        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);
        assert.deepEqual(layout.progress,{x:0,y:0,width:0,height:0});
        assert.equal(layout.progressMask,false);
    }
});

test("CORSÁRIO calibra conta e respostas nas áreas vazias de cada arte",()=>{
    const expected={
        1:{
            question:{x:22.5,y:45.2,width:56,height:12},
            answers:{x:15.8,y:66.6,width:69.4,height:16.5,columnGap:9.6,rowGap:23.5}
        },
        2:{
            question:{x:22,y:32.5,width:56,height:18},
            answers:{x:10,y:67,width:80,height:23.7,columnGap:10.2,rowGap:30}
        },
        3:{
            question:{x:21.5,y:42.6,width:56,height:16.6},
            answers:{x:20,y:63.2,width:61,height:18.4,columnGap:7.8,rowGap:16}
        },
        4:{
            question:{x:21.5,y:41.3,width:56,height:15},
            answers:{x:18,y:62.5,width:64,height:17.9,columnGap:7.8,rowGap:19}
        },
        5:{
            question:{x:21.5,y:42.3,width:56,height:16},
            answers:{x:20.3,y:62.8,width:59,height:17.8,columnGap:8.5,rowGap:19}
        }
    };

    for(let islandId=1;islandId<=5;islandId++){
        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);
        assert.deepEqual(layout.question,expected[islandId].question);
        assert.deepEqual(layout.answers,expected[islandId].answers);

        for(const box of [layout.question,layout.answers]){
            assert.ok(box.x>=0 && box.y>=0);
            assert.ok(box.width>0 && box.height>0);
            assert.ok(box.x+box.width<=100.5);
            assert.ok(box.y+box.height<=100.5);
        }
    }
});

test("renderer mantém conta e respostas dinâmicas fora do asset",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),
        "utf8"
    );

    assert.match(source,/challenge\.table/);
    assert.match(source,/challenge\.multiplier/);
    assert.match(source,/data-answer/);
    assert.match(source,/getIslandIdentity/);
    assert.match(source,/getChallengeArtLayout/);
    assert.match(source,/--challenge-question-x/);
    assert.match(source,/--challenge-answers-x/);
    assert.match(source,/tabuada-opcao/);
    assert.match(source,/tabuada-opcao-numero-offset-x/);
    assert.match(source,/tabuada-opcao-numero-offset-y/);
    assert.match(source,/tabuada-pergunta-numero/);
    assert.match(source,/tabuada-pergunta-offset-x/);
    assert.match(source,/tabuada-pergunta-offset-y/);
});

test("opções de tabuada permitem ajuste vertical definido por cada layout",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    assert.match(css,/\.tabuada-opcao\s*\{[\s\S]*display:\s*flex/);
    assert.match(css,/\.tabuada-opcao \.numero\s*\{[\s\S]*translate\([\s\S]*--tabuada-opcao-numero-offset-x, 0[\s\S]*--tabuada-opcao-numero-offset-y, 0/);
    assert.match(css,/\.tabuada-pergunta-numero\s*\{[\s\S]*translate\([\s\S]*--tabuada-pergunta-offset-x, 0[\s\S]*--tabuada-pergunta-offset-y, 0/);

    for(let islandId=1;islandId<=5;islandId++){
        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);
        assert.equal(typeof layout.questionOffsetY,"number");
        assert.equal(typeof layout.answerOffsetY,"number");
    }
});

test("BIRADES possui malha visual própria para as 5 telas jogáveis",()=>{
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
        /region-1\/challenges\/corsario-enseada-da-bandeira-challenge-bg\.webp/
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
        assert.ok(size<700_000, `asset BIRADES/Ilha ${islandId} pesado demais para o limite atual: ${size}`);
    }
});
