const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX mobile usa fallback geométrico e coordenadas lógicas",()=>{
  const source=read("web/js/dev/scene-editor.js");
  assert.match(source,/nodesAtPoint\(event\.clientX, event\.clientY\)/);
  assert.match(source,/screenRoot\.style\.touchAction = opened \? "none" : originalScreenTouchAction/);
  assert.match(source,/sceneEngine\.stageCoordinateSpace/);
  assert.match(source,/coordinateSpace\.clientDeltaToLocal/);
  assert.match(source,/typeof node\.element\?\.setPointerCapture === "function"/);
});

test("segundo dedo vira pinça do asset selecionado e não nova seleção",()=>{
  const source=read("web/js/dev/scene-editor.js");
  assert.match(source,/const activePointers = new Map/);
  assert.match(source,/function startPinchInteraction/);
  assert.match(source,/activePointers\.size === 1 && selected/);
  assert.match(source,/if \(insideSelected\) node = selected/);
  assert.match(source,/Redimensionado por pinça/);
});

test("UX mobile disables browser pan on semantic canvas",()=>{
  const css=read("web/css/dev/scene-editor.css");
  assert.match(css,/\.tq-dev-scene-editing \[data-tq-composition-screen\]/);
  assert.match(css,/\.tq-dev-scene-editing \.tq-engine-canvas/);
  assert.match(css,/touch-action: none !important/);
});
