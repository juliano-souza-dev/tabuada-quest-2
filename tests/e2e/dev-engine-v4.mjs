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

// Exact preview profiles and actual rendered frame.
const desktopContext=await browser.newContext({viewport:{width:1440,height:1000}});
const desktopPage=await desktopContext.newPage();
await desktopPage.goto(baseURL+"/preview-harness.html",{waitUntil:"networkidle"});

const preview=await desktopPage.evaluate(()=>{
  const api=TabuadaQuest.dev.previewController;
  const p=api.PROFILES["desktop-1366x768"];
  const fit=api.computePreviewFit(p,1440,1000);
  api.applyProfile(p);
  return {p,fit};
});
assert.equal(preview.p.width,1366);
assert.equal(preview.p.height,768);
assert.ok(Math.abs(preview.fit.aspectRatio-(1366/768))<1e-12);
assert.ok(Math.abs((preview.fit.renderWidth/preview.fit.renderHeight)-(1366/768))<1e-12);

await desktopPage.waitForTimeout(50);
const stage1366=await desktopPage.locator(".app-stage").boundingBox();
const viewport1366=await desktopPage.locator(".app-viewport").boundingBox();
const css1366=await desktopPage.evaluate(()=>({
  logicalWidth:document.querySelector(".app-stage")?.dataset.tqPreviewWidth,
  logicalHeight:document.querySelector(".app-stage")?.dataset.tqPreviewHeight,
  scale:document.querySelector(".app-stage")?.dataset.tqPreviewScale
}));
assert.equal(css1366.logicalWidth,"1366");
assert.equal(css1366.logicalHeight,"768");
assert.ok(stage1366.width<=1366 && stage1366.height<=768);
assert.ok(Math.abs(stage1366.width/stage1366.height-(1366/768))<0.002);
assert.ok(Math.abs(viewport1366.width/viewport1366.height-(1366/768))<0.002);

await desktopPage.evaluate(()=>{
  TabuadaQuest.dev.previewController.applyProfile(
    TabuadaQuest.dev.previewController.PROFILES["desktop-1920x1080"]
  );
});
await desktopPage.waitForTimeout(50);
const stage1920=await desktopPage.locator(".app-stage").boundingBox();
const css1920=await desktopPage.evaluate(()=>({
  logicalWidth:document.querySelector(".app-stage")?.dataset.tqPreviewWidth,
  logicalHeight:document.querySelector(".app-stage")?.dataset.tqPreviewHeight,
  scale:document.querySelector(".app-stage")?.dataset.tqPreviewScale
}));
assert.equal(css1920.logicalWidth,"1920");
assert.equal(css1920.logicalHeight,"1080");
assert.ok(Number(css1920.scale)<1);
assert.ok(Math.abs(stage1920.width/stage1920.height-(16/9))<0.002);

await desktopPage.screenshot({path:"test-results/dev-engine-desktop-preview.png",fullPage:true});
await desktopContext.close();

await browser.close();
console.log("DEV engine mobile + exact desktop preview E2E OK");
