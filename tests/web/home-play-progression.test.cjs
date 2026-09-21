const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("botão Jogar usa a progressão e abre diretamente a tela de Ilhas",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );

    assert.match(source,/action === "play"/);
    assert.match(source,/getPlayRegionId\(state\)/);
    assert.match(source,/selectRegion\(state, playRegionId\)/);
    assert.match(source,/withLastScreen\(selected, "islands"\)/);
});

test("atalho Regiões continua abrindo o seletor de Regiões",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );

    assert.match(source,/action === "regions"/);
    assert.match(source,/onNavigate\("regions"\)/);
});
