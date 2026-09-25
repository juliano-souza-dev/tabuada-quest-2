const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("UX oculta asset sem excluir ou desvincular",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/data-tq-dev-hidden/);
    assert.match(js,/isEditorHidden/);
    assert.match(js,/setEditorHidden/);
    assert.match(js,/hidden:\s*true/);
    assert.match(js,/Ocultar no editor/);
    assert.match(js,/Mostrar todos/);
    assert.match(js,/Asset oculto apenas no editor/);
});

test("estado oculto participa do snapshot e da restauração local",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/isEditorHidden\(node\.element\) \? \{ hidden: true \} : \{\}/);
    assert.match(js,/setEditorHidden\(node\.element, Boolean\(saved\[node\.id\]\.hidden\)\)/);
    assert.match(js,/setEditorHidden\(node\.element, Boolean\(geometry\.hidden\)\)/);
});

test("asset oculto some somente enquanto UX está ativo",()=>{
    const css=read("web/css/dev/scene-editor.css");

    assert.match(css,/\.tq-dev-scene-editing \[data-tq-dev-hidden="true"\]/);
    assert.doesNotMatch(css,/^\s*\[data-tq-dev-hidden="true"\]\s*\{/m);
    assert.match(css,/visibility:\s*hidden\s*!important/);
});

test("asset oculto continua selecionável pela lista e pode ser mostrado novamente",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/option\.textContent\s*=\s*[\s\S]*isEditorHidden/);
    assert.match(js,/toggleSelectedEditorVisibility/);
    assert.match(js,/showAllEditorHidden/);
    assert.match(js,/Mostrar no editor/);
});
