const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("região nova sem assets marca a superfície visual como vazia",()=>{
    const js=read("web/js/screens/development-region-builder-screen.js");
    assert.match(js,/const visualAssets = Array\.isArray\(normalizedDraft\.screen\?\.assets\)/);
    assert.match(js,/screen\.dataset\.tqEmptySurface = visualAssets\.length \? "false" : "true"/);
});

test("superfície visual vazia usa fundo transparente",()=>{
    const base=read("web/css/base.css");
    const builder=read("web/css/dev/region-builder.css");

    assert.match(base,/body\.tq-empty-surface-active[\s\S]*background:\s*transparent\s*!important/);
    assert.match(builder,/\.region-builder-preview-screen\s*\{[\s\S]*background:\s*transparent/);
    assert.match(builder,/data-tq-empty-surface="true"[\s\S]*background-image:\s*none\s*!important/);
});

test("modo transparente é removido automaticamente ao trocar para uma tela normal",()=>{
    const app=read("web/js/app.js");
    assert.match(app,/const emptySurfaceActive = screenRoot\.dataset\.tqEmptySurface === "true"/);
    assert.match(app,/document\.body\.classList\.toggle\("tq-empty-surface-active", emptySurfaceActive\)/);
    assert.match(app,/appRoot\.classList\.toggle\("tq-empty-surface-active", emptySurfaceActive\)/);
});
