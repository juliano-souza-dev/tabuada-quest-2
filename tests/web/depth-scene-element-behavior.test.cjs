const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("CENA oferece tipo de elemento e direção para nuvens",()=>{
    const editor=read("web/js/dev/depth-editor.js");

    assert.match(editor,/data-depth-element-type/);
    assert.match(editor,/Tipo de elemento/);
    assert.match(editor,/data-depth-direction/);
    assert.match(editor,/Sentido das nuvens/);
    assert.match(editor,/applyElementType/);
    assert.match(editor,/Nuvem · fluxo infinito aplicado/);
});

test("configuração CENA persiste elementType e direction por layer",()=>{
    const core=read("web/js/core/depth-scene.js");
    const editor=read("web/js/dev/depth-editor.js");

    assert.match(core,/elementType:\s*source\.elementType/);
    assert.match(core,/direction:\s*source\.direction === "right" \? "right" : "left"/);
    assert.match(editor,/elementType:\s*elementType\.value/);
    assert.match(editor,/direction:\s*direction\.value/);
});

test("nuvem usa travessia contínua com wrap e não vai-e-volta horizontal",()=>{
    const core=read("web/js/core/depth-scene.js");

    assert.match(core,/elementType === "cloud"/);
    assert.match(core,/const travel = sceneWidth \+ entry\.baseWidth \+ margin \* 2/);
    assert.match(core,/const distance = \(\(now \* pixelsPerMs\) \+ phaseDistance\) % travel/);
    assert.match(core,/layer\.direction === "right"/);

    const cloudBlock=core.match(/if \(elementType === "cloud"[\s\S]*?\n\s*\}/)?.[0] || "";
    assert.doesNotMatch(cloudBlock,/Math\.sin\([^)]*\).*autoX/);
});

test("tipo semântico existente ativa comportamento mesmo sem override CENA",()=>{
    const core=read("web/js/core/depth-scene.js");

    assert.match(core,/function effectiveElementType\(layer, semanticType = null\)/);
    assert.match(core,/elementTypeFromSemantic\(semanticType\)/);
    assert.match(core,/island_background:\s*"island"/);
    assert.match(core,/island_state:\s*"island"/);
});

test("tipos conhecidos têm perfis de comportamento",()=>{
    const core=read("web/js/core/depth-scene.js");

    for(const type of ["cloud","ship","island","environment","pier","avatar_full","custom"]){
        assert.match(core,new RegExp(type.replace("_","_")+"\\s*:\\s*Object\\.freeze"));
    }
    assert.match(core,/animation:\s*"cloud-loop"/);
    assert.match(core,/animation:\s*"ship-rock"/);
});
