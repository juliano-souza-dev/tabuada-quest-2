const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

test("botão Home global aparece no Mapa Mundo e nas Ilhas",()=>{
    const worldMap=read("web/js/screens/world-map-screen.js");
    const islands=read("web/js/screens/islands-screen.js");

    assert.match(worldMap,/class="global-home-button"/);
    assert.match(worldMap,/data-action="home"/);
    assert.match(worldMap,/onNavigate\("home"\)/);

    assert.match(islands,/class="global-home-button"/);
    assert.match(islands,/data-action="home"/);
    assert.match(islands,/onNavigate\("home"\)/);
});

test("botão Home global é textual e não depende de asset",()=>{
    const worldMap=read("web/js/screens/world-map-screen.js");
    const islands=read("web/js/screens/islands-screen.js");

    assert.match(worldMap,/>Home<\/button>/);
    assert.match(islands,/>Home<\/button>/);

    const buttonMarkup=worldMap.match(/<button[^>]*class="global-home-button"[\s\S]*?<\/button>/)?.[0] || "";
    assert.match(buttonMarkup,/>Home<\/button>/);
    assert.doesNotMatch(buttonMarkup,/<img/);
});

test("botão Home global fica sobreposto e centralizado no topo",()=>{
    const css=read("web/css/app.css");
    const start=css.indexOf(".global-home-button {");
    assert.ok(start>=0);
    const block=css.slice(start,css.indexOf("}",start)+1);

    assert.match(block,/position:\s*absolute/);
    assert.match(block,/z-index:\s*100/);
    assert.match(block,/left:\s*50%/);
    assert.match(block,/top:\s*max\(10px, env\(safe-area-inset-top\)\)/);
    assert.match(block,/transform:\s*translateX\(-50%\)/);
});
