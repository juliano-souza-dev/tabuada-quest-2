const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX resolve alvo geométrico global sem regra por tela",()=>{
  const source=read("web/js/dev/scene-editor.js");
  const start=source.indexOf("function resolveGeometryElement");
  const end=source.indexOf("function shouldAutoMap", start);
  const block=source.slice(start,end);

  assert.match(block,/element\.matches\("img, picture, svg, canvas, video"\)/);
  assert.match(block,/sameVisualBox/);
  assert.match(block,/isInteractiveGeometryBoundary/);
  assert.doesNotMatch(block,/home|islands|region-island|world-map/i);
});

test("asset e função continuam separados ao resolver geometria",()=>{
  const source=read("web/js/dev/scene-editor.js");
  assert.match(
    source,
    /button, a, input, select, textarea, \[role='button'\][\s\S]*\[data-action\][\s\S]*\[data-tq-composition-function\]/
  );
  assert.match(source,/if \(isInteractiveGeometryBoundary\(parent\)\) \{[\s\S]*break;/);
});

test("movimento, escala, overlay, snapshot e z-index usam geometryTarget",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function geometryTarget\(node\)/);
  assert.match(source,/applyGeometry\(geometryTarget\(candidate\), geometry\)/);
  assert.match(source,/readGeometry\(geometryElement\)/);
  assert.match(source,/geometryTarget\(selected\)\.getBoundingClientRect\(\)/);
  assert.match(source,/readLayer\(geometryTarget\(selected\)\)/);
  assert.match(source,/applyLayer\(geometryTarget\(selected\)/);

  assert.doesNotMatch(source,/readGeometry\(selected\.element\)/);
  assert.doesNotMatch(source,/readGeometry\(node\.element\)/);
  assert.doesNotMatch(source,/selected\.element\.getBoundingClientRect\(\)/);
});

test("hitbox de função oculta não bloqueia asset visual abaixo",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/let node = selectableNodeFromElement\(event\.target\)/);
  assert.match(source,/if \(functionsHidden && node\.kind === "function"\) return null/);
  assert.match(source,/const geometricMatches = nodes/);
  assert.match(source,/const zDelta = readLayer\(targetB\) - readLayer\(targetA\)/);
});

test("qualquer mídia visual da tela pode entrar no UX",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(
    source,
    /if \(element\.matches\("img, picture, svg, canvas, video"\)\) return true/
  );
  assert.match(source,/if \(isSemanticSlotInnerVisual\(element\)\) return false/);
});
