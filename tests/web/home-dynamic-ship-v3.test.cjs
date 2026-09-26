const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("El Colombo é o navio padrão do catálogo",()=>{
  const source=read("web/js/content/game-content.js");
  assert.match(
    source,
    /id: "ship-colombo"[\s\S]*asset: "\.\/assets\/transitions\/el-colombo\/images\/el-colombo\.webp"[\s\S]*isDefault: true/
  );
  assert.match(source,/defaultShipId: "ship-colombo"/);
});

test("estado inicial compra e equipa o navio padrão",()=>{
  const source=read("web/js/domain/player-state.js");
  assert.match(
    source,
    /shop: \{ purchasedItemIds: \[DEFAULT_SHIP_ID, DEFAULT_FRAME_ID\], equippedShipId: DEFAULT_SHIP_ID \}/
  );
  assert.match(source,/const DEFAULT_SHIP_ID = "ship-colombo"/);
});

test("Home resolve navio pelo equippedShipId",()=>{
  const source=read("web/js/core/screen-composition-runtime.js");
  assert.match(source,/slot\.id === "home\.background\.ship\.1"/);
  assert.match(source,/runtimeState\?\.shop\?\.equippedShipId/);
  assert.match(source,/TQ\.content\?\.defaultShipId \|\| "ship-colombo"/);
  assert.match(source,/runtimeAsset = equippedShip\?\.asset \|\| binding\.asset/);
  assert.match(source,/screenRoot\.dataset\.tqEquippedShipId/);
});

test("binding publicado da Home usa El Colombo como fallback e não navio fixo antigo",()=>{
  const source=read("web/js/content/screen-composition.js");
  const start=source.indexOf('"home.background.ship.1"');
  const end=source.indexOf('"home.background.pier"',start);
  const block=source.slice(start,end);
  assert.match(block,/el-colombo\/images\/el-colombo\.webp/);
  assert.doesNotMatch(block,/navio-pirata\.webp/);
});

test("Home v3 remove colagem extra e mantém cena essencial",()=>{
  const source=read("web/js/content/screen-composition.js");
  const start=source.indexOf("const PUBLISHED_BINDINGS");
  const end=source.indexOf("function readStore",start);
  const published=source.slice(start,end);

  assert.doesNotMatch(published,/home\.background\.cloud\.[1-4]/);
  assert.doesNotMatch(published,/home\.background\.scenery\.1/);
  assert.doesNotMatch(published,/home\.background\.scenery\.2/);
  assert.match(published,/home\.background\.scenery\.3/);
  assert.match(published,/home\.background\.scenery\.4/);
  assert.match(published,/home\.background\.ocean/);
  assert.match(published,/home\.background\.pier/);
});

test("oceano padrão v3 é mais sutil",()=>{
  const source=read("web/js/core/ocean-scene.js");
  assert.match(source,/movement: 18/);
  assert.match(source,/speed: 22/);
  assert.match(source,/shine: 9/);
  assert.match(source,/foam: 7/);
});
