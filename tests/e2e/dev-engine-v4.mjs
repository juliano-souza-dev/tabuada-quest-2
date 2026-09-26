import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const baseURL=process.env.TQ_E2E_URL || "http://127.0.0.1:4173";
fs.mkdirSync("test-results",{recursive:true});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:412,height:893},
  isMobile:true,
  hasTouch:true,
  deviceScaleFactor:2.625
});
const page=await context.newPage();
await page.goto(baseURL+"/dev-engine-harness.html",{waitUntil:"networkidle"});

const initial=await page.locator(".visual-frame").boundingBox();
assert.ok(initial?.width>100 && initial?.height>100,"asset visual inicial precisa existir");

// One-finger move. The visible wrapper, not only inspector state, must move.
await page.locator("#asset").dispatchEvent("pointerdown",{
  pointerId:1,pointerType:"touch",isPrimary:true,clientX:130,clientY:230,bubbles:true
});
await page.evaluate(()=>{
  window.dispatchEvent(new PointerEvent("pointermove",{
    pointerId:1,pointerType:"touch",isPrimary:true,clientX:175,clientY:275,bubbles:true
  }));
  window.dispatchEvent(new PointerEvent("pointerup",{
    pointerId:1,pointerType:"touch",isPrimary:true,clientX:175,clientY:275,bubbles:true
  }));
});
await page.waitForTimeout(50);
const moved=await page.locator(".visual-frame").boundingBox();
assert.ok(moved.x>initial.x+30,"drag precisa mover a arte visual no eixo X");
assert.ok(moved.y>initial.y+30,"drag precisa mover a arte visual no eixo Y");

// Two-finger pinch on the same selected asset. Selection cannot jump.
const box=await page.locator(".visual-frame").boundingBox();
const cx=box.x+box.width/2;
const cy=box.y+box.height/2;
await page.locator("#asset").dispatchEvent("pointerdown",{
  pointerId:11,pointerType:"touch",isPrimary:true,clientX:cx-20,clientY:cy,bubbles:true
});
await page.locator("#asset").dispatchEvent("pointerdown",{
  pointerId:12,pointerType:"touch",isPrimary:false,clientX:cx+20,clientY:cy,bubbles:true
});
await page.evaluate(({cx,cy})=>{
  window.dispatchEvent(new PointerEvent("pointermove",{
    pointerId:12,pointerType:"touch",isPrimary:false,clientX:cx+55,clientY:cy,bubbles:true
  }));
},{cx,cy});
await page.waitForTimeout(50);
await page.evaluate(({cx,cy})=>{
  window.dispatchEvent(new PointerEvent("pointerup",{
    pointerId:12,pointerType:"touch",isPrimary:false,clientX:cx+55,clientY:cy,bubbles:true
  }));
  window.dispatchEvent(new PointerEvent("pointerup",{
    pointerId:11,pointerType:"touch",isPrimary:true,clientX:cx-20,clientY:cy,bubbles:true
  }));
},{cx,cy});

const pinched=await page.locator(".visual-frame").boundingBox();
assert.ok(pinched.width>moved.width*1.4,"pinça precisa aumentar a largura visual");
assert.ok(pinched.height>moved.height*1.4,"pinça precisa aumentar a altura visual");

const state=await page.evaluate(()=>{
  const asset=document.querySelector("#asset");
  const frame=document.querySelector(".visual-frame");
  return {
    selected:asset?.getAttribute("data-tq-dev-selected"),
    sx:Number.parseFloat(frame?.style.getPropertyValue("--tq-dev-sx")),
    sy:Number.parseFloat(frame?.style.getPropertyValue("--tq-dev-sy")),
    x:Number.parseFloat(frame?.style.getPropertyValue("--tq-dev-x")),
    y:Number.parseFloat(frame?.style.getPropertyValue("--tq-dev-y"))
  };
});
assert.equal(state.selected,"true","pinça deve preservar o asset selecionado");
assert.ok(Math.abs(state.sx-state.sy)<0.001,"pinça deve preservar proporção X/Y");
assert.ok(Number.isFinite(state.x)&&Number.isFinite(state.y),"geometria persistida deve ser numérica");

await page.screenshot({path:"test-results/dev-engine-mobile.png",fullPage:true});

// Exact preview profiles and aspect-ratio fit.
await page.goto(baseURL+"/",{waitUntil:"domcontentloaded"});
const preview=await page.evaluate(()=>{
  const api=TabuadaQuest.dev.previewController;
  const p=api.PROFILES["desktop-1366x768"];
  const fit=api.computePreviewFit(p,1440,1000);
  return {p,fit};
});
assert.equal(preview.p.width,1366);
assert.equal(preview.p.height,768);
assert.ok(Math.abs(preview.fit.aspectRatio-(1366/768))<1e-12);
assert.ok(Math.abs((preview.fit.renderWidth/preview.fit.renderHeight)-(1366/768))<1e-12);

await browser.close();
console.log("DEV engine mobile + preview E2E OK");
