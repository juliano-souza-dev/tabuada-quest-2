const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("asset externo vira camada DEV livre equivalente ao UP",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function materializeExternalVisualAssets\(screenRoot, screenId\)/);
  assert.match(source,/tq-dev-local-live-asset tq-dev-localized-external-asset/);
  assert.match(source,/sceneEngine\.stageCoordinateSpace\(source, screenRoot\)/);
  assert.match(source,/coordinateSpace\.clientPointToLocal\(rect\.left, rect\.top\)/);
  assert.match(source,/coordinateSpace\.clientDeltaToLocal\(rect\.width, 0\)/);
  assert.match(source,/proxy\.style\.position = "absolute"/);
  assert.match(source,/proxy\.style\.pointerEvents = "none"/);
});

test("localização preserva id e desacopla o asset do wrapper original",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/const id = source\.dataset\.tqDevId[\s\S]*generatedId\(source, screenRoot, screenId\)/);
  assert.match(source,/proxy\.dataset\.tqDevId = id/);
  assert.match(source,/source\.setAttribute\("data-tq-dev-external-source", "true"\)/);
  assert.match(source,/source\.style\.setProperty\("visibility", "hidden", "important"\)/);
  assert.match(source,/if \(element\.hasAttribute\("data-tq-dev-external-source"\)\) return false/);
});

test("runtime pode adicionar assets depois e o UX os normaliza sem remontar",()=>{
  const source=read("web/js/dev/scene-editor.js");
  const start=source.indexOf("function refreshNodeRegistry");
  const end=source.indexOf("function filteredNodes",start);
  const block=source.slice(start,end);

  assert.match(block,/materializeExternalVisualAssets\(screenRoot, screenId\)/);
  assert.match(block,/localizedExternalVisuals\.push\(\.\.\.newlyLocalized\)/);
  assert.match(block,/syncLocalizedExternalVisualAssets\(localizedExternalVisuals\)/);
});

test("ao desmontar o editor a camada proxy sai e o visual original volta",()=>{
  const source=read("web/js/dev/scene-editor.js");

  assert.match(source,/function releaseLocalizedExternalVisualAssets/);
  assert.match(source,/restoreInlineStyle\([\s\S]*"visibility"/);
  assert.match(source,/source\.removeAttribute\("data-tq-dev-external-source"\)/);
  assert.match(source,/releaseLocalizedExternalVisualAssets\(localizedExternalVisuals\)/);
});
