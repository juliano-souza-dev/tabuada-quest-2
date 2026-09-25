const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("editor visual exporta contexto explícito da tela, Região e horário",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/storageScopeId/);
    assert.match(js,/screenTypeLabel/);
    assert.match(js,/regionId:\s*editorContext\.regionId/);
    assert.match(js,/regionPage:\s*editorContext\.regionPage/);
    assert.match(js,/capturedAt:\s*capturedAt\.toISOString\(\)/);
    assert.match(js,/capturedAtLocal:\s*formatLocalTimestamp\(capturedAt\)/);
    assert.match(js,/timeZone:\s*editorContext\.timeZone/);
});

test("editor mostra contexto da tela no painel e na barra compacta",()=>{
    const js=read("web/js/dev/scene-editor.js");
    const css=read("web/css/dev/scene-editor.css");

    assert.match(js,/data-dev-context-title/);
    assert.match(js,/data-dev-context-region/);
    assert.match(js,/data-dev-context-clock/);
    assert.match(js,/data-dev-compact-context/);
    assert.match(css,/\.tq-scene-dev-context\s*\{/);
});

test("layout de islands é persistido por Região sem mudar o tipo lógico da tela",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/resolveDevelopmentEditorContext/);
    assert.match(app,/resolveDevelopmentStorageScope/);
    assert.match(app,/editorScreenId === "islands"/);
    assert.match(app,/`islands\.region-\$\{editorContext\.regionId\}`/);
    assert.match(app,/screenId:\s*editorScreenId,[\s\S]*storageScopeId:\s*editorStorageScope/);
    assert.match(app,/restoreLocalLayers\?\.\(\{[\s\S]*screenId:\s*editorStorageScope/);
});

test("snapshot promovido em 25-09 pertence à Região 2",()=>{
    const css=read("web/css/screens/vertical-slice.css");

    assert.match(css,/Islands UX snapshot · Region 2 · 2026-09-25/);
    assert.match(css,/data-region-id="2"/);
    assert.doesNotMatch(css,/Islands UX snapshot · Region 1 · 2026-09-25/);
});
