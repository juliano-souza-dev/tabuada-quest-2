const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("MAR preserva alpha da textura e descarta transparência vazia",()=>{
  const source=read("web/js/core/ocean-scene.js");
  assert.match(source,/float sourceAlpha = color\.a/);
  assert.match(source,/if \(sourceAlpha < 0\.015\) discard/);
  assert.match(source,/foam \*= sourceAlpha/);
  assert.match(source,/gl_FragColor = vec4\(color\.rgb, sourceAlpha\)/);
  assert.doesNotMatch(source,/gl_FragColor = vec4\(color\.rgb, 1\.0\)/);
});

test("Home default não publica ilha de campanha",()=>{
  const source=read("web/js/content/screen-composition.js");
  const start=source.indexOf("const PUBLISHED_BINDINGS");
  const end=source.indexOf("function readStore", start);
  const published=source.slice(start,end);
  assert.doesNotMatch(published,/home\.background\.island\.1/);
});

test("Home v2 mantém hierarquia de planos",()=>{
  const css=read("web/css/screens/home.css");
  assert.match(css,/HOME DEFAULT · composição publicada por código · 2026-09-26 · v2/);
  assert.match(css,/PLANO 0 · céu e horizonte/);
  assert.match(css,/PLANO 1 · oceano com WebGL/);
  assert.match(css,/PLANO 2 · porto distante e navio/);
  assert.match(css,/PLANO 3 · pier e cenário de primeiro plano/);
});
