const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("guia mobile DEV fica persistente e abre NAV",()=>{
  const app=read("web/js/app.js");
  assert.match(app,/mobileBadge\.hidden = false/);
  assert.match(app,/mobileBadge\.addEventListener\("click", \(\) => openNavigator\(true\)\)/);
  assert.match(app,/syncMobileGuide\(\)/);
  assert.doesNotMatch(app,/setTimeout\(\(\) => \{\s*mobileBadge\.hidden = true;\s*\}, 3200\)/);
});

test("NAV mobile não ocupa o mesmo botão redondo da coluna de ferramentas",()=>{
  const css=read("web/css/app.css");
  assert.match(css,/@media \(max-width: 620px\)[\s\S]*\.tq-dev-nav-toggle \{\s*display: none !important;/);
  assert.match(css,/\.tq-dev-mobile-context:not\(\[hidden\]\)[\s\S]*left: 10px;[\s\S]*right: 82px;/);
  assert.match(css,/pointer-events: auto/);
});

test("painel NAV tem fechamento explícito",()=>{
  const app=read("web/js/app.js");
  assert.match(app,/data-dev-nav-close/);
  assert.match(app,/openNavigator\(false\)/);
});
