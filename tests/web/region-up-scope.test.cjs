const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UP de região reabre UX com tela e escopo separados",()=>{
  const source=read("web/js/dev/asset-uploader.js");

  assert.match(source,/screenId: compositionScreenId/);
  assert.match(source,/storageScopeId: screenId/);
  assert.match(source,/effectsScopeId,/);
  assert.match(source,/editorContext,/);
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
