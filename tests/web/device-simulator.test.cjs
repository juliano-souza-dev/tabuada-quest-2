const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("simulador DEV oferece os tamanhos móveis mais usados no Brasil",()=>{
  const source=read("web/js/dev/preview-controller.js");

  for(const id of [
    "br-414x896",
    "br-412x915",
    "br-384x832",
    "br-393x873",
    "br-390x844",
    "br-432x960"
  ]){
    assert.ok(source.includes('"' + id + '"'),id + " ausente");
  }

  assert.match(source,/DEFAULT_PROFILE_ID = "br-412x915"/);
  assert.match(source,/Statcounter Brasil · ago\/2026/);
});

test("simulador contém referências atuais de iPhone e Android",()=>{
  const source=read("web/js/dev/preview-controller.js");

  assert.match(source,/iPhone 16 \/ 15 · 393 × 852/);
  assert.match(source,/iPhone 15 Pro Max · 430 × 932/);
  assert.match(source,/iPhone 16 Pro Max · 440 × 956/);
  assert.match(source,/Galaxy S24 · ~360 × 800/);
  assert.match(source,/Galaxy S24 Ultra · ~390 × 850/);
});

test("desktop DEV usa iframe com viewport real e evita simulador recursivo",()=>{
  const preview=read("web/js/dev/preview-controller.js");
  const app=read("web/js/app.js");
  const css=read("web/css/dev/preview-controller.css");

  assert.match(preview,/const CHILD_PARAM = "tq_simulator_child"/);
  assert.match(preview,/url\.searchParams\.set\(CHILD_PARAM, "1"\)/);
  assert.match(preview,/<iframe[\s\S]*data-preview-iframe/);
  assert.match(preview,/iframe\.style\.width = logical\.width \+ "px"/);
  assert.match(preview,/iframe\.style\.height = logical\.height \+ "px"/);
  assert.match(preview,/isHostMode: \(\) => hostMode/);
  assert.match(preview,/if \(isChildRuntime\(\)\)/);
  assert.match(app,/if \(!TQ\.dev\?\.previewController\?\.isHostMode\?\.\(\)\) \{\s*render\(\);/);
  assert.match(css,/transform:\s*scale\(var\(--tq-preview-scale\)\)/);
  assert.match(css,/html\.tq-dev-simulator-host \.app-stage/);
});

test("simulador permite retrato, paisagem, custom, tablet e desktop",()=>{
  const source=read("web/js/dev/preview-controller.js");

  assert.match(source,/currentOrientation === "portrait"[\s\S]*"landscape"/);
  assert.match(source,/function toggleOrientation\(\)/);
  assert.match(source,/id: "custom"/);
  assert.match(source,/tablet-768x1024/);
  assert.match(source,/desktop-1366x768/);
  assert.match(source,/desktop-1920x1080/);
});
