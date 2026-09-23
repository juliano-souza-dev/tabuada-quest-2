const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const travelPath=path.join(__dirname,"../../web/js/screens/travel-screen.js");
const contentPath=path.join(__dirname,"../../web/js/content/game-content.js");
const legacyMp4Path=path.join(__dirname,"../../web/assets/transitions/island-travel.mp4");

test("viagem do El Colombo prioriza PixiJS + GSAP e preserva fallback Lottie/CSS",()=>{
    const source=fs.readFileSync(travelPath,"utf8");
    assert.match(source,/pixi\.js@8\.21\.0/);
    assert.match(source,/gsap@3\.13\.0/);
    assert.match(source,/renderPixiTravel/);
    assert.match(source,/new PIXI\.Application\(\)/);
    assert.match(source,/gsap\.to\(travelLayer\.position/);
    assert.match(source,/ease:\s*"none"/);
    assert.match(source,/new PIXI\.Graphics\(\)/);
    assert.match(source,/renderLottieFallback/);
    assert.match(source,/root\.lottie\?\.loadAnimation/);
    assert.match(source,/renderer:\s*"svg"/);
    assert.match(source,/renderColomboFallback/);
});

test("MP4 legado de viagem foi removido fisicamente e do código",()=>{
    const travel=fs.readFileSync(travelPath,"utf8");
    const content=fs.readFileSync(contentPath,"utf8");
    assert.equal(fs.existsSync(legacyMp4Path),false);
    assert.doesNotMatch(travel,/createElement\("video"\)|travelVideo|assets\.islandTravel|island-travel\.mp4/);
    assert.doesNotMatch(content,/travelVideo|islandTravel:\s*"\.\/assets\/transitions\/island-travel\.mp4/);
});

test("assets do El Colombo ficam disponíveis para uso offline",()=>{
    const sw=fs.readFileSync(path.join(__dirname,"../../web/sw.js"),"utf8");
    assert.match(sw,/vendor\/lottie\.min\.js/);
    assert.match(sw,/el-colombo-ocean-navigation\.json/);
    assert.match(sw,/images\/el-colombo\.webp/);
    assert.doesNotMatch(sw,/island-travel\.mp4/);
});

test("modo DEV passa pela tela de viagem",()=>{
    const source=fs.readFileSync(path.join(__dirname,"../../web/js/screens/islands-screen.js"),"utf8");
    assert.match(source,/function createDevelopmentIslandEntryState/);
    assert.match(source,/withIslandTravelSession/);
});

test("fallback do El Colombo é animado por CSS, sem vídeo",()=>{
    const css=fs.readFileSync(path.join(__dirname,"../../web/css/screens/vertical-slice.css"),"utf8");
    assert.match(css,/\.island-travel-colombo-ship/);
    assert.match(css,/@keyframes tq-colombo-sail/);
    assert.doesNotMatch(css,/\.island-travel-video|\.island-travel-play-button/);
});


test("El Colombo usa background real e navega na direção da proa",()=>{
    const content=fs.readFileSync(contentPath,"utf8");
    const source=fs.readFileSync(travelPath,"utf8");
    const lottie=JSON.parse(fs.readFileSync(
        path.join(__dirname,"../../web/assets/transitions/el-colombo/el-colombo-ocean-navigation.json"),
        "utf8"
    ));

    assert.match(content,/travelBackground:\s*"\.\/assets\/transitions\/el-colombo\/images\/ocean-background\.webp"/);
    assert.match(source,/travelBackground/);
    assert.match(source,/backgroundImage/);
    assert.match(source,/preserveAspectRatio:\s*"xMidYMid meet"/);

    const names=lottie.layers.map((layer)=>layer.nm).join("|");
    assert.doesNotMatch(names,/Sky|Ocean Base|Foreground Waves|Mid Waves|Far Waves/);

    const controller=lottie.layers.find((layer)=>layer.nm==="El Colombo Controller");
    assert.ok(controller.ks.p.k[0].s[0] > controller.ks.p.k.at(-1).s[0]);
});

test("background do Colombo está otimizado e disponível offline",()=>{
    const background=path.join(__dirname,"../../web/assets/transitions/el-colombo/images/ocean-background.webp");
    assert.equal(fs.existsSync(background),true);
    assert.ok(fs.statSync(background).size<500_000);
    const sw=fs.readFileSync(path.join(__dirname,"../../web/sw.js"),"utf8");
    assert.match(sw,/ocean-background\.webp/);
});


test("canvas da viagem ocupa toda a cena e permanece isolado da UI",()=>{
    const css=fs.readFileSync(path.join(__dirname,"../../web/css/screens/vertical-slice.css"),"utf8");
    assert.match(css,/\.island-travel-canvas/);
    assert.match(css,/width:\s*100%\s*!important/);
    assert.match(css,/height:\s*100%\s*!important/);
});


test("fundo da viagem usa parallax e ondas independentes no PixiJS",()=>{
    const source=fs.readFileSync(travelPath,"utf8");
    assert.match(source,/backgroundTexture/);
    assert.match(source,/waterStripTweens/);
    assert.match(source,/stripCount\s*=\s*6/);
    assert.match(source,/strip\.mask\s*=\s*mask/);
    assert.match(source,/waveBands/);
    assert.match(source,/redrawWaterBands/);
    assert.match(source,/graphic\.stroke\(/);
});
