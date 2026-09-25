const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("DEV exibe contexto atual e oferece navegação direta isolada",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/DEV_NAV_TARGETS/);
    assert.match(app,/directDevelopmentNavigate/);
    assert.match(app,/developmentMode = true/);
    assert.match(app,/createDevelopmentIslandEntryState/);
    assert.match(app,/data-dev-nav-screen/);
    assert.match(app,/data-dev-nav-region/);
    assert.match(app,/data-dev-nav-island/);
    assert.match(app,/DEV · Contexto/);
});

test("mobile anuncia ferramenta, tela e contexto ao abrir DEV tool",()=>{
    const app=read("web/js/app.js");
    const css=read("web/css/app.css");

    assert.match(app,/tq-dev-mobile-context/);
    assert.match(app,/TOOL_LABELS/);
    assert.match(app,/depth: "CENA"/);
    assert.match(app,/ocean: "MAR"/);
    assert.match(app,/assets: "UP"/);
    assert.match(app,/ux: "UX"/);
    assert.match(app,/settings: "SET"/);
    assert.match(app,/parts\.join\(" · "\)/);
    assert.match(css,/\.tq-dev-mobile-context:not\(\[hidden\]\)/);
});

test("HUD não inventa ilha no mapa da Região",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/const islandScopedContext = new Set/);
    assert.doesNotMatch(
        app.match(/const islandScopedContext = new Set\(\[[\s\S]*?\]\)\.has\(actualScreenId\);/)?.[0] || "",
        /"islands"/
    );
});
