const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX mobile uses geometry fallback when touch target is canvas",()=>{
  const source=read("web/js/dev/scene-editor.js");
  assert.match(source,/nodesAtPoint\(event\.clientX, event\.clientY\)/);
  assert.match(source,/screenRoot\.style\.touchAction = opened \? "none" : originalScreenTouchAction/);
  assert.match(source,/event\.preventDefault\(\);\s*event\.stopPropagation\(\);\s*const node = interaction\.node/);
  assert.match(source,/typeof node\.element\?\.setPointerCapture === "function"/);
});

test("UX mobile disables browser pan on semantic canvas",()=>{
  const css=read("web/css/dev/scene-editor.css");
  assert.match(css,/\.tq-dev-scene-editing \[data-tq-composition-screen\]/);
  assert.match(css,/\.tq-dev-scene-editing \.tq-engine-canvas/);
  assert.match(css,/touch-action: none !important/);
});
