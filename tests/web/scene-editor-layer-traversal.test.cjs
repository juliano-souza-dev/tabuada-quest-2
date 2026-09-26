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

test("hit stack geométrico ordena visual por z e área",()=>{
    const engine=read("web/js/dev/scene-engine.js");

    assert.match(engine,/function hitTest\(nodes, clientX, clientY/);
    assert.match(engine,/if \(zA !== zB\) return zB - zA/);
    assert.match(engine,/return rectA\.width \* rectA\.height - rectB\.width \* rectB\.height/);
});

test("funções podem ser excluídas do hit stack sem esconder assets",()=>{
    const engine=read("web/js/dev/scene-engine.js");
    const scene=read("web/js/dev/scene-editor.js");

    assert.match(engine,/if \(!includeFunctions && node\.kind === "function"\) return false/);
    assert.match(scene,/functionsHidden && candidate\.kind === "function"/);
    assert.match(scene,/selectBelowAtPoint/);
});
