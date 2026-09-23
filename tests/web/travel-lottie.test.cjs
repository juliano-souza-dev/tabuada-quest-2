const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("viagem usa Lottie do El Colombo como transição padrão e preserva fallback",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/travel-screen.js"),
        "utf8"
    );

    assert.match(source,/islandTravelAnimation/);
    assert.match(source,/root\.lottie\?\.loadAnimation/);
    assert.match(source,/renderer:\s*"svg"/);
    assert.match(source,/loop:\s*false/);
    assert.match(source,/autoplay:\s*true/);
    assert.match(source,/preserveAspectRatio:\s*"xMidYMid slice"/);
    assert.match(source,/addEventListener\("complete", completeTravel\)/);
    assert.match(source,/addEventListener\("data_failed", renderVideoFallback\)/);
    assert.match(source,/renderVideoFallback/);
});

test("assets do El Colombo ficam disponíveis para uso offline",()=>{
    const sw=fs.readFileSync(path.join(__dirname,"../../web/sw.js"),"utf8");
    assert.match(sw,/vendor\/lottie\.min\.js/);
    assert.match(sw,/el-colombo-ocean-navigation\.json/);
    assert.match(sw,/images\/el-colombo\.webp/);
});


test("modo DEV também passa pela tela de viagem para permitir validar o El Colombo",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(source,/function createDevelopmentIslandEntryState/);
    assert.match(source,/withIslandTravelSession/);
});
