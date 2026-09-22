const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("Home mostra SAIR ao lado de DEV REGIÕES no modo de desenvolvimento",()=>{
    const home=read("web/js/screens/home-screen.js");
    const css=read("web/css/screens/home.css");

    assert.match(home,/class="development-shortcuts"/);
    assert.match(home,/data-action="development-regions"/);
    assert.match(home,/data-action="exit-session"/);
    assert.match(home,/>\s*SAIR\s*<\/button>/);
    assert.match(css,/\.development-shortcuts\s*\{/);
    assert.match(css,/display:\s*flex/);
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
