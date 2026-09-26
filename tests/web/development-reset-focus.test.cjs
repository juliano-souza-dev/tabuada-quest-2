const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("Restaurar original usa serviço central e não location.reload",()=>{
    const scene=read("web/js/dev/scene-editor.js");
    assert.match(scene,/TQ\.dev\?\.developmentReset/);
    assert.match(scene,/await reset\.resetScreen\(/);
    assert.match(scene,/tq:dev-remount-request/);

    const resetStart=scene.indexOf('[data-dev-reset-screen]');
    const resetEnd=scene.indexOf('[data-dev-copy]',resetStart);
    const body=scene.slice(resetStart,resetEnd);
    assert.doesNotMatch(body,/location\.reload/);
    assert.doesNotMatch(body,/resetScopeVariant/);
});

test("reset central limpa UX UP composição MAR CENA SOM e aliases da Home",()=>{
    const source=read("web/js/dev/development-reset.js");

    assert.match(source,/tq2\.dev\.scene-layout\.v3/);
    assert.match(source,/clearLocalLayersForScreen/);
    assert.match(source,/registry\.resetScope\(storageScopeId, screenId\)/);
    assert.match(source,/oceanScene\?\.clearConfig/);
    assert.match(source,/depthScene\?\.clearConfig/);
    assert.match(source,/audioScene\?\.clearConfig/);
    assert.match(source,/home\.background-pirate-main/);
    assert.match(source,/home\.background-default/);
    assert.match(source,/readLocalLayerRecords/);
});

test("asset visual visível recebe foco real para edição",()=>{
    const scene=read("web/js/dev/scene-editor.js");
    const runtime=read("web/js/core/screen-composition-runtime.js");

    assert.match(scene,/selected\.element\.focus\(\{ preventScroll: true \}\)/);
    assert.match(runtime,/element\.dataset\.tqEditorFocusable = "true"/);
    assert.match(runtime,/element\.tabIndex = -1/);
});

test("app remonta a tela depois do reset verificado",()=>{
    const app=read("web/js/app.js");
    assert.match(app,/tq:dev-remount-request/);
    assert.match(app,/root\.addEventListener\("tq:dev-remount-request",[\s\S]*render\(\)/);
});
