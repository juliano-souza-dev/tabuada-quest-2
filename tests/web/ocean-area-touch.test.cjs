const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("MAR usa camada modal que captura toque ao marcar a água",()=>{
  const js=read("web/js/dev/ocean-editor.js");
  const css=read("web/css/dev/ocean-editor.css");

  assert.match(js,/overlay\.addEventListener\("pointerdown", onDown, \{ passive: false \}\)/);
  assert.match(js,/overlay\.addEventListener\("pointermove", onMove, \{ passive: false \}\)/);
  assert.match(js,/overlay\.setPointerCapture\(event\.pointerId\)/);
  assert.match(js,/overlay\.hasPointerCapture\?\.\(pointerId\)/);
  assert.match(js,/tq-ocean-area-lasso-hint/);

  assert.match(css,/\.tq-ocean-area-lasso \{[\s\S]*pointer-events: auto;/);
  assert.match(css,/\.tq-ocean-area-lasso \{[\s\S]*touch-action: none;/);
  assert.match(css,/\.tq-ocean-area-lasso-hint/);
});

test("MAR remove captura e overlay ao sair da tela",()=>{
  const js=read("web/js/dev/ocean-editor.js");

  assert.match(js,/let areaSelectionCleanup = null/);
  assert.match(js,/areaSelectionCleanup\?\.\(\)/);
  assert.match(js,/overlay\.remove\(\);[\s\S]*hint\.remove\(\)/);
  assert.match(js,/areaSelectionCleanup = null/);
});
