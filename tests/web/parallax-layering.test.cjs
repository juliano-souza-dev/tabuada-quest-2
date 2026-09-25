const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("parallax é uma camada-base abaixo dos assets da cena",()=>{
    const css=read("web/css/app.css");
    assert.match(css,/\.tq-parallax-region\s*\{[\s\S]*z-index:var\(--tq-parallax-z, 1\)/);
    assert.match(css,/--tq-parallax-z:\s*1/);
});

test("assets com camada definida pelo UX podem ficar acima do parallax",()=>{
    const css=read("web/css/app.css");
    assert.match(css,/data-tq-dev-kind="asset"\]\[data-tq-dev-layered="true"/);
    assert.match(css,/z-index:\s*var\(--tq-dev-z, 2\)\s*!important/);
});

test("FX renderizado é marcado como camada visual parallax",()=>{
    const app=read("web/js/app.js");
    assert.match(app,/el\.dataset\.tqVisualLayer = "parallax"/);
    assert.match(app,/region\.dataset\.tqVisualLayer = "parallax"/);
    assert.match(app,/--tq-parallax-z/);
});
