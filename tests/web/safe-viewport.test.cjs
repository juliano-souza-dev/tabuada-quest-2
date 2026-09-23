const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/core/safe-viewport.js");

const safeViewport=globalThis.TabuadaQuest.core.safeViewport;

function assertCanonicalRatio(geometry){
    if (!geometry.renderWidth || !geometry.renderHeight) return;
    const renderedRatio=geometry.renderWidth/geometry.renderHeight;
    const canonicalRatio=941/1672;
    assert.ok(
        Math.abs(renderedRatio-canonicalRatio)<1e-9,
        `proporção deformada: ${renderedRatio} != ${canonicalRatio}`
    );
}

test("cover canônico preenche toda a viewport sem deformar",()=>{\n    const geometry=safeViewport.computeFit(393,774,941,1672,"cover");\n    assert.ok(geometry.renderWidth>=393);\n    assert.ok(geometry.renderHeight>=774);\n    assert.ok(geometry.offsetX<=0);\n    assert.ok(geometry.offsetY<=0);\n    assertCanonicalRatio(geometry);\n});\n\ntest("fit canônico usa toda a largura segura de um celular alto sem deformar",()=>{
    const geometry=safeViewport.computeFit(393,774);
    assert.equal(geometry.renderWidth,393);
    assert.ok(geometry.renderHeight<774);
    assert.ok(geometry.offsetY>0);
    assertCanonicalRatio(geometry);
});

test("fit canônico usa a altura segura de um tablet e ultrapassa o antigo teto de 540px",()=>{
    const geometry=safeViewport.computeFit(800,1200);
    assert.equal(geometry.renderHeight,1200);
    assert.ok(geometry.renderWidth>540);
    assert.ok(geometry.renderWidth<800);
    assert.ok(geometry.offsetX>0);
    assertCanonicalRatio(geometry);
});

test("fit canônico permanece proporcional em viewport 4:3 vertical",()=>{
    const geometry=safeViewport.computeFit(900,1200);
    assert.equal(geometry.renderHeight,1200);
    assert.ok(geometry.renderWidth<900);
    assertCanonicalRatio(geometry);
});

test("safe area reduz a área útil sem alterar a composição",()=>{
    const viewport={width:393,height:852};
    const insets={top:47,bottom:31,left:0,right:0};
    const geometry=safeViewport.computeFit(
        viewport.width-insets.left-insets.right,
        viewport.height-insets.top-insets.bottom
    );
    assert.ok(geometry.renderWidth<=393);
    assert.ok(geometry.renderHeight<=774);
    assertCanonicalRatio(geometry);
});

test("fontes de layout usam o contrato compartilhado de safe viewport",()=>{
    const base=fs.readFileSync(path.join(__dirname,"../../web/css/base.css"),"utf8");
    const vertical=fs.readFileSync(path.join(__dirname,"../../web/css/screens/vertical-slice.css"),"utf8");
    const worldMap=fs.readFileSync(path.join(__dirname,"../../web/css/screens/world-map.css"),"utf8");
    const home=fs.readFileSync(path.join(__dirname,"../../web/css/screens/home.css"),"utf8");
    const activity=fs.readFileSync(
        path.join(__dirname,"../../app/src/main/java/com/tabuadaquest/app/MainActivity.java"),
        "utf8"
    );

    assert.match(base,/--tq-safe-top/);
    assert.match(base,/--tq-native-safe-bottom/);
    assert.match(base,/html:not\(\.tq-native-runtime\) \.app-viewport/);
    assert.match(base,/\.tq-safe-visual-area/);

    assert.doesNotMatch(vertical,/56\.2\d*(?:d?vh|vh),\s*540px/);
    assert.doesNotMatch(worldMap,/540px/);
    assert.match(home,/home-safe-visual-area/);\n    assert.doesNotMatch(home,/object-fit:\\s*fill/);\n    assert.doesNotMatch(worldMap,/object-fit:\\s*fill/);\n    assert.doesNotMatch(vertical,/object-fit:\\s*fill/);

    assert.match(activity,/getInsetsIgnoringVisibility/);
    assert.match(activity,/WindowInsets\.Type\.displayCutout/);
    assert.match(activity,/--tq-native-safe-top/);
    assert.match(activity,/LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES/);
});

test("telas imersivas vinculam seus stages ao controlador canônico",()=>{
    const sources=[
        "home-screen.js",
        "world-map-screen.js",
        "islands-screen.js",
        "challenge-screen.js",
        "result-screen.js",
        "pet-screen.js"
    ].map((file)=>fs.readFileSync(
        path.join(__dirname,"../../web/js/screens",file),
        "utf8"
    ));

    for(const source of sources){
        assert.match(source,/bindCanonicalStage/);
        assert.match(source,/tq-safe-visual-area/);
    }
});
