const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/dev/scene-engine.js");
require("../../web/js/dev/preview-controller.js");

const engine=globalThis.TabuadaQuest.dev.sceneEngine;
const preview=globalThis.TabuadaQuest.dev.previewController;

test("scene engine expõe geometria única e helpers de pinça",()=>{
  assert.equal(typeof engine.resolveGeometryElement,"function");
  assert.equal(typeof engine.stageCoordinateSpace,"function");
  assert.equal(engine.pointerDistance({x:0,y:0},{x:3,y:4}),5);
  assert.deepEqual(engine.pointerCenter({x:0,y:2},{x:4,y:6}),{x:2,y:4});
});

test("preview preserva exatamente largura altura e proporção do preset",()=>{
  const profile=preview.PROFILES["desktop-1920x1080"];
  const fit=preview.computePreviewFit(profile,1400,900);
  assert.equal(profile.width,1920);
  assert.equal(profile.height,1080);
  assert.ok(Math.abs(fit.aspectRatio-(16/9))<1e-12);
  assert.ok(Math.abs(fit.renderWidth/fit.renderHeight-(16/9))<1e-12);
});

test("Galaxy A15/A16 usa painel lógico único e escala uniforme",()=>{
  const profile=preview.PROFILES["galaxy-a15-a16"];
  const fit=preview.computePreviewFit(profile,1200,1000);
  assert.equal(profile.width,412);
  assert.equal(profile.height,892.6667);
  assert.equal(fit.scale,Math.min(1,(1200-32)/412,(1000-86)/892.6667));
});

test("scene editor v4 usa engine compartilhada e pinça",()=>{
  const source=fs.readFileSync(path.join(__dirname,"../../web/js/dev/scene-editor.js"),"utf8");
  assert.match(source,/const sceneEngine = TQ\.dev\?\.sceneEngine/);
  assert.match(source,/function startPinchInteraction/);
  assert.match(source,/activePointers = new Map/);
  assert.match(source,/sceneEngine\.stageCoordinateSpace/);
  assert.match(source,/Redimensionado por pinça/);
});
