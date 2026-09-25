const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("UX editor permite selecionar camada abaixo de elementos sobrepostos",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/data-dev-select-below/);
    assert.match(js,/function nodesAtPoint\(clientX, clientY\)/);
    assert.match(js,/document\.elementsFromPoint\(clientX, clientY\)/);
    assert.match(js,/function selectBelowAtPoint\(clientX, clientY, fromNode = selected\)/);
    assert.match(js,/if \(event\.altKey\)/);
    assert.match(js,/selectBelowButton\.addEventListener\("click", selectBelowCurrent\)/);
});

test("parallax salvo persiste cópia visual e geometria da fonte",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/const visualSnapshot = \(visual\) =>/);
    assert.match(app,/const cloneFromSnapshot = \(snapshot\) =>/);
    assert.match(app,/sourceVisual:\s*visualSnapshot\(visual\)/);
    assert.match(app,/sourceRect:\s*\{/);
    assert.match(app,/fx\.sourceRect/);
    assert.match(app,/fx\.sourceVisual/);
});

test("parallax salvo consegue renderizar sem o background original visível",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/const sourceStillVisible = visual instanceof Element/);
    assert.match(app,/root\.getComputedStyle\(visual\)\.display !== "none"/);
    assert.match(app,/activeRoot\.querySelector\("\.tq-canonical-stage"\)/);
    assert.match(app,/cloneVisualLayer\(sourceStillVisible \? visual : null, fx\.sourceVisual\)/);
});
