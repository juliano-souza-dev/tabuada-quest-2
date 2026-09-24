const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("Home remove atalhos legados e SAIR fica na barra lateral DEV",()=>{
    const home=read("web/js/screens/home-screen.js");
    const app=read("web/js/app.js");
    const css=read("web/css/app.css");

    assert.doesNotMatch(home,/class="development-shortcuts"/);
    assert.doesNotMatch(home,/data-action="dev-add-gold"/);
    assert.doesNotMatch(home,/data-action="dev-level-up"/);
    assert.match(app,/function mountDevelopmentExit\(\)/);
    assert.match(app,/className = "tq-exit-dev"/);
    assert.match(app,/SAIR/);
    assert.match(css,/\.tq-exit-dev\s*\{/);
});

test("SAIR executa reset local completo sem apagar dados de outros apps",()=>{
    const app=read("web/js/app.js");
    const persistence=read("web/js/persistence/local-storage.js");

    assert.match(app,/function resetDevelopmentSession\(\)/);
    assert.match(app,/clearLocalState\(root\.localStorage\)/);
    assert.match(app,/state\s*=\s*TQ\.domain\.playerState\.createInitialState\(\)/);
    assert.match(app,/developmentState\s*=\s*null/);
    assert.match(app,/developmentMode\s*=\s*false/);
    assert.match(app,/worldMapPreviewRegionId\s*=\s*null/);
    assert.match(app,/rewardReturnScreen\s*=\s*null/);
    assert.match(persistence,/key\.startsWith\("tabuadaQuest\."\)/);
});
