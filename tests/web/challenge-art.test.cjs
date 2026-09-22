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
    assert.deepEqual(layout.progress,{x:20.45,y:40.35,width:59.3,height:3.65});
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
    const fillLeftInsideContainer=1.89/100;
    const fillWidthInsideContainer=94.17/100;

    const startPercent=layout.progress.x + layout.progress.width*fillLeftInsideContainer;
    const widthPercent=layout.progress.width*fillWidthInsideContainer;
    const endPercent=startPercent+widthPercent;

    assert.ok(Math.abs(startPercent-21.57)<0.03);
    assert.ok(Math.abs(widthPercent-55.84)<0.03);
    assert.ok(Math.abs(endPercent-77.41)<0.04);

    const stageWidthPx=394;
    assert.ok(Math.abs(stageWidthPx*startPercent/100-85)<0.2);
    assert.ok(Math.abs(stageWidthPx*widthPercent/100-220)<0.2);
    assert.ok(Math.abs(stageWidthPx*endPercent/100-305)<0.3);
});
