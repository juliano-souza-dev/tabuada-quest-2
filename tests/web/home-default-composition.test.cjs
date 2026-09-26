const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("Home default publica todos os assets essenciais",()=>{
  const source=read("web/js/content/screen-composition.js");
  [
    "home.header.frame",
    "home.header.avatar",
    "home.header.logo",
    "home.header.level-plate",
    "home.character.avatar-full",
    "home.background.ocean",
    "home.background.ship.1",
    "home.background.pier",
    "home.background.scenery.3",
    "home.background.scenery.4",
    "home.button.play",
    "home.button.crew",
    "home.button.shipyard",
    "home.button.regions",
    "home.button.daily-reward",
    "home.button.shop",
    "home.button.collectibles",
    "home.button.items"
  ].forEach((id)=>assert.match(source,new RegExp(id.replaceAll(".","\\."))));
});

test("Home resolve avatar frame nível e personagem a partir do estado",()=>{
  const source=read("web/js/core/screen-composition-runtime.js");
  assert.match(source,/slot\.id === "home\.header\.frame"/);
  assert.match(source,/slot\.id === "home\.header\.avatar"/);
  assert.match(source,/slot\.id === "home\.header\.level-plate"/);
  assert.match(source,/slot\.id === "home\.character\.avatar-full"/);
  assert.match(source,/home\.text\.player-name/);
  assert.match(source,/home\.text\.coins/);
  assert.match(source,/home\.text\.gems/);
});

test("Home default possui efeito de oceano publicado",()=>{
  const source=read("web/js/core/ocean-scene.js");
  assert.match(source,/"home\.background-default": HOME_DEFAULT_OCEAN_CONFIG/);
  assert.match(source,/enabled: true/);
  assert.match(source,/ripples: true/);
  assert.match(source,/shipWake: true/);
  assert.match(source,/shine: 9/);
  assert.match(source,/foam: 7/);
});

test("Home composta posiciona cenário e hitboxes por código",()=>{
  const css=read("web/css/screens/home.css");
  assert.match(css,/HOME DEFAULT · composição publicada por código/);
  assert.match(css,/home\.background\.ocean/);
  assert.match(css,/home\.background\.pier/);
  assert.match(css,/home\.character\.avatar-full/);
  assert.match(css,/data-tq-composition-function="play"/);
  assert.match(css,/data-tq-composition-function="crew"/);
  assert.match(css,/data-tq-composition-function="shipyard"/);
  assert.match(css,/region-ocean-motion/);
});

test("migração única limpa apenas overrides antigos da Home",()=>{
  const source=read("web/js/app.js");
  assert.match(source,/tq2\.dev\.home-composition-build/);
  assert.match(source,/20260926-home-default-v3/);
  assert.match(source,/resetScope\?\.\("home", "home"\)/);
  assert.match(source,/clearLocalLayersForScreen\?\.\("home", screenRoot\)/);
});
