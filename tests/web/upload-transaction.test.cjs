const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UP congela destino antes de abrir seletor de arquivo",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/function captureUploadIntent\(mode = "add"\)/);
  assert.match(source,/slotId: slot\?\.id \|\| null/);
  assert.match(source,/semanticType,/);
  assert.match(source,/variantId:/);
  assert.match(source,/folder: currentFolder\(\)/);
  assert.match(source,/uploadIntent = intent;[\s\S]*fileInput\.click\(\)/);
});

test("UP usa transação bloqueada e verifica persistência + DOM",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/let uploadBusy = false/);
  assert.match(source,/function setUploadBusy/);
  assert.match(source,/UP 1\/4 · salvando/);
  assert.match(source,/UP 2\/4 · carregando na tela/);
  assert.match(source,/UP 3\/4 · verificando/);
  assert.match(source,/UP 4\/4 · pronto/);
  assert.match(source,/async function verifyLocalLayer/);
  assert.match(source,/readLocalLayerRecords\(screenId\)/);
  assert.match(source,/!image\.isConnected/);
  assert.match(source,/slotElement\.dataset\.tqSlotEmpty === "true"/);
});

test("UP seleciona novo asset por evento sem remontar UX",()=>{
  const uploader=read("web/js/dev/asset-uploader.js");
  const scene=read("web/js/dev/scene-editor.js");

  assert.match(uploader,/tq:dev-select-node/);
  assert.doesNotMatch(uploader,/function reopenUxOn/);
  assert.doesNotMatch(uploader,/sceneEditor\?\.mount\(appRoot/);

  assert.match(scene,/function onExternalSelect/);
  assert.match(scene,/root\.addEventListener\("tq:dev-select-node"/);
  assert.match(scene,/setOpened\(true\)/);
});

test("slots vazios existem internamente mas não aparecem no UX",()=>{
  const scene=read("web/js/dev/scene-editor.js");

  assert.doesNotMatch(
    scene,
    /if \(semanticAsset && \(element\.dataset\.tqSlotEmpty === "true" \|\| element\.hidden\)\) \{\s*return null;/
  );
  assert.match(scene,/function isInactiveCompositionSlot/);
  assert.match(scene,/!isInactiveCompositionSlot\(node\)/);
});

test("Subir arquivo não cria binding publicado antes do arquivo existir",()=>{
  const source=read("web/js/dev/asset-uploader.js");
  const start=source.indexOf("function persistPendingUpload");
  const end=source.indexOf("function validateClassification",start);
  const block=source.slice(start,end);

  assert.match(block,/state: "awaiting-publish"/);
  assert.doesNotMatch(block,/compositionRegistry\.bindAsset/);
  assert.doesNotMatch(block,/compositionRegistry\.bindVariant/);
  assert.doesNotMatch(block,/tq:composition-binding-changed/);
});
