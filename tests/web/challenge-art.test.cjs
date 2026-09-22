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
            question:{x:21.5,y:45.2,width:57.5,height:17.4},
            answers:{x:14,y:64.7,width:72,height:20.9,columnGap:5.8,rowGap:5.8}
        },
        2:{
            question:{x:21.5,y:26.2,width:58,height:26.8},
            answers:{x:8.5,y:64.2,width:83,height:28.4,columnGap:6.2,rowGap:5.6}
        },
        3:{
            question:{x:21.5,y:42.6,width:57.5,height:16.6},
            answers:{x:20.5,y:60,width:59.5,height:22.4,columnGap:5.5,rowGap:4.8}
        },
        4:{
            question:{x:21.5,y:39.1,width:57.5,height:18},
            answers:{x:15,y:59.2,width:70,height:22.5,columnGap:5.5,rowGap:4.8}
        },
        5:{
            question:{x:21,y:42.8,width:58.5,height:16.9},
            answers:{x:20.2,y:60.8,width:60.2,height:21,columnGap:5.2,rowGap:4.8}
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


test("desafio protege o conteúdo até a arte estar realmente pronta",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),
        "utf8"
    );
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    assert.match(source,/is-art-loading/);
    assert.match(source,/challenge-art-loading/);
    assert.match(source,/Chegando à ilha/);
    assert.match(source,/background\.decode/);
    assert.match(source,/background\.addEventListener\("load"/);
    assert.match(source,/preloadChallengeArt/);

    assert.match(css,/challenge-art-screen\.is-art-loading \.challenge-dynamic-layer/);
    assert.match(css,/\.challenge-loading-boat/);
    assert.match(css,/\.challenge-loading-wave/);
    assert.match(css,/@keyframes challenge-boat-bob/);
});

test("entrada na Ilha e viagem pré-carregam a arte do desafio",()=>{
    const islandsSource=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );
    const travelSource=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/travel-screen.js"),
        "utf8"
    );

    assert.match(islandsSource,/preloadChallengeArt/);
    assert.match(travelSource,/preloadChallengeArt/);
});


test("viewport alto mantém bleed visível atrás da arte 9:16",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    const challengeBlock=css.slice(
        css.indexOf(".challenge-art-screen {"),
        css.indexOf("}",css.indexOf(".challenge-art-screen {"))+1
    );
    assert.match(challengeBlock,/isolation:\s*isolate/);
    assert.match(challengeBlock,/var\(--challenge-bleed-image\)/);
    assert.match(challengeBlock,/background-size:\s*cover/);

    const challengeBleed=css.slice(
        css.indexOf(".challenge-art-screen::before"),
        css.indexOf("}",css.indexOf(".challenge-art-screen::before"))+1
    );
    assert.match(challengeBleed,/z-index:\s*1/);

    const challengeStage=css.slice(
        css.indexOf(".challenge-art-stage {"),
        css.indexOf("}",css.indexOf(".challenge-art-stage {"))+1
    );
    assert.match(challengeStage,/z-index:\s*2/);
    assert.match(challengeStage,/56\.25dvh/);

    const regionBlock=css.slice(
        css.indexOf(".region-islands-map-screen {"),
        css.indexOf("}",css.indexOf(".region-islands-map-screen {"))+1
    );
    assert.match(regionBlock,/isolation:\s*isolate/);
    assert.match(regionBlock,/var\(--region-bleed-image\)/);
});
