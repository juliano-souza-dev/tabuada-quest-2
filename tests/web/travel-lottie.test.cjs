const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const travelPath=path.join(__dirname,"../../web/js/screens/travel-screen.js");
const contentPath=path.join(__dirname,"../../web/js/content/game-content.js");
const legacyMp4Path=path.join(__dirname,"../../web/assets/transitions/island-travel.mp4");

test("viagem do El Colombo usa Lottie e fallback animado do próprio navio",()=>{
    const source=fs.readFileSync(travelPath,"utf8");
    assert.match(source,/root\.lottie\?\.loadAnimation/);
    assert.match(source,/renderer:\s*"svg"/);
    assert.match(source,/autoplay:\s*true/);
    assert.match(source,/assetsPath/);
    assert.match(source,/goToAndPlay\(0, true\)/);
    assert.match(source,/renderColomboFallback/);
    assert.match(source,/renderAnimationFallback/);
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
