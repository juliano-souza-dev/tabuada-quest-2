const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("Copiar layout inclui apenas o parallax do mesmo escopo lógico",()=>{
    const js=read("web/js/dev/scene-editor.js");

    assert.match(js,/PARALLAX_STORAGE_KEY = "tq2\.dev\.parallax\.effects\.v4"/);
    assert.match(js,/function readScopedParallax\(screenId, editorContext\)/);
    assert.match(js,/String\(fx\.backgroundId \|\| ""\) !== String\(screenId \|\| ""\)/);
    assert.match(js,/screenId === "islands"/);
    assert.match(js,/Number\(fx\.regionId\) === Number\(editorContext\?\.regionId\)/);
    assert.match(js,/parallax:\s*\{[\s\S]*effects:\s*readScopedParallax\(screenId, editorContext\)/);
});

test("FX possui botão para exportar a imagem do parallax",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/data-fx-export-image/);
    assert.match(app,/const exportParallaxImage = async \(\) =>/);
    assert.match(app,/canvas\.toBlob\(resolve, "image\/webp", \.94\)/);
    assert.match(app,/anchor\.download = "parallax-" \+ activeScreenId/);
    assert.match(app,/host\.querySelector\("\[data-fx-export-image\]"\)\.onclick = exportParallaxImage/);
});

test("imagem exportada respeita o recorte poligonal do efeito",()=>{
    const app=read("web/js/app.js");

    assert.match(app,/context\.clip\(\)/);
    assert.match(app,/points\.forEach\(\(point, index\) =>/);
    assert.match(app,/selectedFx\.bounds/);
    assert.match(app,/selectedFx\.sourceVisual/);
});
