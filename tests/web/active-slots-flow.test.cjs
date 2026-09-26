const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("slots vazios ficam fora da tela e do UX",()=>{
    const runtime=read("web/js/core/screen-composition-runtime.js");
    const scene=read("web/js/dev/scene-editor.js");

    assert.match(runtime,/element\.hidden = !binding\?\.asset/);
    assert.match(runtime,/slotElement\.hidden = !src/);
    assert.match(runtime,/slotElement\.hidden = false/);

    assert.match(
        scene,
        /semanticAsset && \(element\.dataset\.tqSlotEmpty === "true" \|\| element\.hidden\)/
    );
});

test("Copiar exporta apenas slots com asset ativo",()=>{
    const scene=read("web/js/dev/scene-editor.js");

    assert.match(scene,/registry\.getAssetSlots\(screenType\)[\s\S]*\.filter\(Boolean\)/);
    assert.match(scene,/element\.dataset\.tqSlotEmpty === "true"/);
    assert.match(scene,/element\.hidden/);
});

test("UP ativa slot e aplica comportamento sem recarregar",()=>{
    const uploader=read("web/js/dev/asset-uploader.js");
    const app=read("web/js/app.js");
    const depthEditor=read("web/js/dev/depth-editor.js");

    assert.match(uploader,/slot\.hidden = false/);
    assert.match(uploader,/function applySemanticBehavior/);
    assert.match(uploader,/depthScene\.elementTypeFromSemantic\(semanticType\)/);
    assert.match(uploader,/depthScene\.applyElementType/);
    assert.match(uploader,/applySemanticBehavior\(slot, record\.semanticType\)/);

    assert.match(app,/effectsScopeId: editorEffectScope/);
    assert.match(
        depthEditor,
        /config = TQ\.core\.depthScene\.readConfig\(scopeId, regionId\);\s*controller\?\.update\?\.\(config\);\s*fillTargets/
    );
});
