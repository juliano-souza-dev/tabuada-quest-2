const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/challenge-screen.js");

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

test("cada Ilha do CORSÁRIO possui layout próprio de overlay",()=>{
    const layouts=TQ.screens.challenge.CHALLENGE_ART_LAYOUTS[1];
    assert.ok(layouts);

    const signatures=new Set();

    for(let islandId=1;islandId<=5;islandId++){
        const layout=TQ.screens.challenge.getChallengeArtLayout(1,islandId);
        assert.ok(layout);
        assert.ok(layout.progress.y>=38 && layout.progress.y<=41);
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

test("Ilha 3 mascara o progresso fixo incorporado na arte",()=>{
    const layout=TQ.screens.challenge.getChallengeArtLayout(1,3);
    assert.equal(layout.progressMask,true);

    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    assert.match(css,/data-progress-mask="true"/);
    assert.match(css,/--challenge-progress-x/);
    assert.match(css,/--challenge-progress-ratio/);
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
    assert.match(source,/getChallengeArtLayout/);
    assert.match(source,/--challenge-question-x/);
    assert.match(source,/--challenge-answers-x/);
    assert.doesNotMatch(source,/<h1>Ilha \$\{session\.islandId\}<\/h1>/);
});


test("Ilha 1 preserva o encaixe refinado da overlay dinâmica",()=>{
    const layout=TQ.screens.challenge.getChallengeArtLayout(1,1);
    assert.deepEqual(layout.progress,{x:21.57,y:40.35,width:55.84,height:3.65});
    assert.deepEqual(layout.question,{x:14,y:44.95,width:72,height:15.45});
    assert.deepEqual(layout.answers,{x:16,y:62.45,width:68,height:16.25,columnGap:5.7,rowGap:8});

    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );
    assert.doesNotMatch(css,/padding:\s*0\s+4%\s+11%/);
    assert.match(css,/\.challenge-art-progress\s*>\s*span[\s\S]*white-space:\s*nowrap/);
});


test("fill do progresso fica centralizado no trilho visual",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    const block=css.match(/\.challenge-art-progress::before\s*\{[\s\S]*?\}/)?.[0] || "";
    assert.match(block,/left:\s*1\.89%/);
    assert.match(block,/top:\s*50%/);
    assert.match(block,/width:\s*94\.17%/);
    assert.match(block,/height:\s*24%/);
    assert.match(block,/translateY\(-50%\)\s+scaleX\(var\(--challenge-progress-ratio, 0\)\)/);
    assert.doesNotMatch(block,/bottom:\s*7%/);
});


test("calibração horizontal da barra reproduz o trilho medido no stage",()=>{
    const layout=TQ.screens.challenge.getChallengeArtLayout(1,1);
    const startPercent=layout.progress.x;
    const widthPercent=layout.progress.width;
    const endPercent=startPercent+widthPercent;

    assert.ok(Math.abs(startPercent-21.57)<0.001);
    assert.ok(Math.abs(widthPercent-55.84)<0.001);
    assert.ok(Math.abs(endPercent-77.41)<0.001);

    const stageWidthPx=394;
    assert.ok(Math.abs(stageWidthPx*startPercent/100-85)<0.2);
    assert.ok(Math.abs(stageWidthPx*widthPercent/100-220)<0.2);
    assert.ok(Math.abs(stageWidthPx*endPercent/100-305)<0.3);
});


test("Questão 3 de 20 usa 15% do trilho de progresso",()=>{
    assert.equal(TQ.screens.challenge.progressPercent(3),15);
    assert.equal(TQ.screens.challenge.progressPercent(1),5);
    assert.equal(TQ.screens.challenge.progressPercent(20),100);
    assert.equal(TQ.screens.challenge.progressPercent(99),100);
    assert.equal(TQ.screens.challenge.progressPercent(0),5);
});


test("Região 1 usa o CSS fornecido para container e fill em todas as ilhas",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    const containerSelector='.challenge-art-screen[data-region-id="1"] .challenge-art-progress';
    const fillSelector='.challenge-art-screen[data-region-id="1"] .challenge-art-progress::before';

    const containerStart=css.indexOf(containerSelector);
    const fillStart=css.indexOf(fillSelector);
    assert.ok(containerStart>=0);
    assert.ok(fillStart>=0);

    const containerBlock=css.slice(containerStart,css.indexOf("}",containerStart)+1);
    const fillBlock=css.slice(fillStart,css.indexOf("}",fillStart)+1);

    assert.match(containerBlock,/height:\s*20px/);
    assert.match(containerBlock,/background:\s*#3a2a1a/);
    assert.match(containerBlock,/border:\s*2px solid #6b4a2a/);
    assert.match(containerBlock,/border-radius:\s*999px/);
    assert.match(containerBlock,/padding:\s*0/);
    assert.match(containerBlock,/box-sizing:\s*border-box/);
    assert.match(containerBlock,/overflow:\s*hidden/);

    assert.match(fillBlock,/left:\s*0/);
    assert.match(fillBlock,/top:\s*0/);
    assert.match(fillBlock,/width:\s*calc\(var\(--challenge-progress-ratio, 0\) \* 100%\)/);
    assert.match(fillBlock,/height:\s*100%/);
    assert.match(fillBlock,/linear-gradient\(180deg, #7ed957, #4caf50\)/);
    assert.match(fillBlock,/border-radius:\s*inherit/);
    assert.match(fillBlock,/transform:\s*none/);
    assert.match(fillBlock,/transition:\s*width \.3s ease/);
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
        /region-1\/challenges\/island-01-challenge\.webp/
    );
    assert.equal(
        TQ.screens.challenge.getChallengeArt({regionId:2,islandId:1}),
        null,
        "BIRADES só deve ativar a arte quando o catálogo region2ChallengeArt estiver publicado"
    );

    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/challenge-screen.js"),
        "utf8"
    );
    assert.match(source,/region\$\{regionId\}ChallengeArt/);
    assert.doesNotMatch(source,/Number\(session\.regionId\) !== 1/);
});
