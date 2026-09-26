const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UP reativa slot preenchido no estado persistido do UX",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/function activateSavedSceneSlot/);
  assert.match(source,/tq2\.dev\.scene-layout\.v3/);
  assert.match(source,/deleted: false/);
  assert.match(source,/hidden: false/);
  assert.match(source,/slotElement\.removeAttribute\("data-tq-dev-deleted"\)/);
  assert.match(source,/slotElement\.removeAttribute\("data-tq-dev-hidden"\)/);
});

test("asset adicionado sincroniza seleção por evento depois de ficar visível",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/function selectUxOn/);
  assert.match(source,/tq:dev-select-node/);
  assert.match(source,/root\.requestAnimationFrame\(\(\) => \{\s*syncSelected\(\);/);
});

test("adicionar ao destino ativa o slot visual antes de selecionar",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/const attachedParent = attachLocalLayerImage/);
  assert.match(source,/activateSavedSceneSlot\(screenId, slot\.id, attachedParent\)/);
  assert.match(source,/selectUxOn\(semanticSlot \|\| image\)/);
});
