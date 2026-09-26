const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UP congela identidade da tela e escopo regional separadamente",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/function captureUploadIntent/);
  assert.match(source,/screenId,/);
  assert.match(source,/compositionScreenId: resolvedCompositionScreenId/);
  assert.match(source,/slotId: slot\?\.id/);
  assert.match(source,/folder: currentFolder\(\)/);
});

test("UP seleciona o asset por evento sem remontar o UX",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/function selectUxOn/);
  assert.match(source,/tq:dev-select-node/);
  assert.match(source,/scopeId: screenId/);
  assert.doesNotMatch(source,/sceneEditor\?\.mount\(appRoot/);
});

test("app passa contexto completo da região para o UP",()=>{
  const source=read("web/js/app.js");

  assert.match(
    source,
    /assetUploader\?\.mount\(\{[\s\S]*compositionScreenId: editorScreenId,[\s\S]*effectsScopeId: editorEffectScope,[\s\S]*editorContext: \{[\s\S]*\.\.\.editorContext/
  );
});

test("Mapa da Região continua usando storage scope por região",()=>{
  const source=read("web/js/app.js");

  assert.match(
    source,
    /editorScreenId === "islands" && editorContext\.regionId[\s\S]*return `islands\.region-\$\{editorContext\.regionId\}`/
  );
});
