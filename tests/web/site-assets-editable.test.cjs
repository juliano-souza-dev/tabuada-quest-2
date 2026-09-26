const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX aceita assets visuais já renderizados pelo site",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function isSiteVisualAsset\(element\)/);
  assert.match(source,/element\.hasAttribute\("data-tq-asset-id"\)/);
  assert.match(source,/region-island-art/);
  assert.match(source,/region-islands-background/);
  assert.match(source,/siteVisualAsset && kind === "container"/);
});

test("filtro de composição não descarta asset visual legado do site",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(
    source,
    /\["asset", "overlay", "background"\]\.includes\(kind\)[\s\S]*!siteVisualAsset/
  );
});

test("imagem interna de slot semântico não vira seleção duplicada",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function isSemanticSlotInnerVisual\(element\)/);
  assert.match(source,/const slot = element\.closest\("\[data-tq-composition-slot\]"\)/);
  assert.match(source,/if \(isSemanticSlotInnerVisual\(element\)\) return false/);
});

test("Região possui background DEV e artes de ilha renderizadas pelo site",()=>{
  const source=read("web/js/screens/islands-screen.js");

  assert.match(source,/data-tq-dev-id="islands\.region\.background"/);
  assert.match(source,/class="region-island-art"/);
});
