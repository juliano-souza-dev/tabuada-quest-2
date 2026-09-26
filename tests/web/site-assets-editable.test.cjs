const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UX aceita mídia visual já renderizada pelo site sem regra por tela",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function isSiteVisualAsset\(element\)/);
  assert.match(source,/element\.matches\("img, picture, svg, canvas, video"\)/);
  assert.match(source,/element\.hasAttribute\("data-tq-asset-id"\)/);
  assert.doesNotMatch(
    source.slice(
      source.indexOf("function isSiteVisualAsset"),
      source.indexOf("function shouldAutoMap")
    ),
    /region-island-art|region-islands-background/
  );
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
