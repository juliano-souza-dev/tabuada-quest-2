const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX mobile suporta pinça proporcional com dois toques",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/const activePointers = new Map\(\)/);
  assert.match(source,/function startPinchInteraction\(node\)/);
  assert.match(source,/mode: "pinch"/);
  assert.match(source,/pointerDistance\(touches\[0\], touches\[1\]\)/);
  assert.match(source,/sx: Math\.max\(\.05, interaction\.geometry\.sx \* factor\)/);
  assert.match(source,/sy: Math\.max\(\.05, interaction\.geometry\.sy \* factor\)/);
  assert.match(source,/Redimensionado por pinça/);
});

test("segunda ponta da pinça mantém o asset já selecionado",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/event\.pointerType === "touch"[\s\S]*selectedRect = selected\.element\.getBoundingClientRect\(\)/);
  assert.match(source,/node = selected/);
});

test("MAR oferece múltiplas formas para área do efeito",()=>{
  const source=read("web/js/dev/ocean-editor.js");

  assert.match(source,/value="freehand"/);
  assert.match(source,/value="polygon"/);
  assert.match(source,/value="rectangle"/);
  assert.match(source,/value="ellipse"/);
  assert.match(source,/Ponto a ponto · polígono/);
});

test("área ponto a ponto permite desfazer concluir e fechar tocando no primeiro ponto",()=>{
  const source=read("web/js/dev/ocean-editor.js");

  assert.match(source,/data-ocean-area-undo/);
  assert.match(source,/data-ocean-area-finish/);
  assert.match(source,/points\.length >= 3[\s\S]*Math\.hypot\(point\.x - points\[0\]\.x/);
  assert.match(source,/saveArea\("Área ponto a ponto salva"\)/);
});

test("retângulo e elipse viram polígonos compatíveis com o motor atual",()=>{
  const source=read("web/js/dev/ocean-editor.js");

  assert.match(source,/function pointsForRectangle/);
  assert.match(source,/function pointsForEllipse/);
  assert.match(source,/Array\.from\(\{ length: count \}/);
  assert.match(source,/config\.area = points\.map/);
});
