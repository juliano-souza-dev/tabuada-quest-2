const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("caixa de seleção do editor move o item selecionado sem deixar o gesto cair no fundo",()=>{
    const js=read("web/js/dev/scene-editor.js");
    const css=read("web/css/dev/scene-editor.css");

    assert.match(js,/data-dev-move-surface/);
    assert.match(js,/function onSelectionOverlayDown\(event\)/);
    assert.match(js,/startInteraction\(event, selected, "move"\)/);
    assert.match(js,/overlay\.addEventListener\("pointerdown", onSelectionOverlayDown\)/);

    assert.match(css,/\.tq-scene-dev-selection\s*\{[^}]*pointer-events:\s*auto/s);
    assert.match(css,/\.tq-scene-dev-selection-move-surface\s*\{/);
    assert.match(css,/cursor:\s*move/);
    assert.match(css,/touch-action:\s*none/);
});
