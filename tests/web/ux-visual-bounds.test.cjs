const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX selection follows painted asset instead of semantic slot box",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function visualElement\(node\)/);
  assert.match(source,/\.tq-dev-local-live-asset\[data-tq-local-persisted='true'\]/);
  assert.match(source,/\.tq-composition-bound-asset/);
  assert.match(source,/function visualClientRect\(node\)/);
  assert.match(source,/const painted = imagePaintedClientRect\(visual\)/);

  const overlayStart=source.indexOf("function updateOverlay()");
  const overlayEnd=source.indexOf("function scheduleOverlay()",overlayStart);
  const overlay=source.slice(overlayStart,overlayEnd);
  assert.match(overlay,/const rect = visualClientRect\(selected\)/);
  assert.doesNotMatch(overlay,/geometryTarget\(selected\)\.getBoundingClientRect\(\)/);
});

test("image visual bounds account for object-fit and transparent pixels",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function normalizedImageAlphaBounds\(image\)/);
  assert.match(source,/alphaThreshold = 8/);
  assert.match(source,/function imagePaintedClientRect\(image\)/);
  assert.match(source,/style\.objectFit/);
  assert.match(source,/style\.objectPosition/);
  assert.match(source,/image\.clientWidth \|\| image\.offsetWidth/);
  assert.match(source,/localLeft = contentLeft \+ \(alpha\?\.left \?\? 0\) \* contentWidth/);
});

test("resize handle uses visual box but persists transform on geometry owner",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/const geometryRect = geometryElement\.getBoundingClientRect\(\);[\s\S]*const rect = visualClientRect\(node\) \|\| geometryRect/);
  assert.match(source,/geometryRect,/);
  assert.match(source,/const predictedLeft = geometryRect\.left \+ offsetLeft \* factorX/);
  assert.match(source,/const desiredLeft = handle\.includes\("w"\)/);
  assert.match(source,/const anchorShift = interaction\.coordinateSpace\.clientDeltaToLocal/);
  assert.match(source,/applyGeometryLinked\(node, \{[\s\S]*x: interaction\.geometry\.x \+ anchorShift\.x/);
});

test("hit testing and select-below use visual bounds",()=>{
  const source=read("web/js/dev/scene-editor.js");

  const hitStart=source.indexOf("function nodesAtPoint");
  const hitEnd=source.indexOf("function pointerRecord",hitStart);
  const hit=source.slice(hitStart,hitEnd);

  assert.match(hit,/visualClientRect\(node\)/);
  assert.match(hit,/visualClientRect\(a\)/);
  assert.match(hit,/visualClientRect\(b\)/);
  assert.match(hit,/visualClientRect\(selected\)/);
});
