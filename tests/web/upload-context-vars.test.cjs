const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("UP mount define effectsScopeId e editorContext antes do fluxo transacional",()=>{
  const source=read("web/js/dev/asset-uploader.js");
  const mountStart=source.indexOf("function mount(options = {})");
  const transactionStart=source.indexOf("function applySemanticBehavior",mountStart);
  const mountHead=source.slice(mountStart,transactionStart);

  assert.match(
    mountHead,
    /const effectsScopeId = String\(options\.effectsScopeId \|\| screenId\)/
  );
  assert.match(
    mountHead,
    /const editorContext = options\.editorContext && typeof options\.editorContext === "object"/
  );
});

test("applySemanticBehavior usa escopo definido no mount",()=>{
  const source=read("web/js/dev/asset-uploader.js");
  assert.match(source,/depthScene\.readConfig\(effectsScopeId\)/);
  assert.match(source,/depthScene\.saveConfig\(effectsScopeId, next\)/);
});
