const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

test("MAR marca a água por pontos e só conclui com polígono válido",()=>{
  const js=read("web/js/dev/ocean-editor.js");
  const css=read("web/css/dev/ocean-editor.css");

  assert.match(js,/data-ocean-point-count/);
  assert.match(js,/data-ocean-point-undo/);
  assert.match(js,/data-ocean-point-clear/);
  assert.match(js,/data-ocean-point-cancel/);
  assert.match(js,/data-ocean-point-finish disabled/);
  assert.match(js,/points\.push\(pointFromEvent\(event\)\)/);
  assert.match(js,/finishButton\.disabled = points\.length < 3/);
  assert.match(js,/polygon\.setAttribute\("points", points\.length >= 3 \? serialized : ""\)/);
  assert.match(js,/config\.area = points\.map/);
  assert.match(js,/persist\("Área da água salva · " \+ points\.length \+ " pontos"\)/);

  assert.match(css,/\.tq-ocean-area-point-menu \{/);
  assert.match(css,/\.tq-ocean-area-lasso-point \{/);
  assert.match(css,/\.tq-ocean-area-lasso-shape \{[\s\S]*fill: rgba\(74,202,232,\.26\)/);
});

test("MAR mantém controles de desfazer, limpar, cancelar e concluir",()=>{
  const js=read("web/js/dev/ocean-editor.js");

  assert.match(js,/function undoPoint\(\)/);
  assert.match(js,/points\.pop\(\)/);
  assert.match(js,/function clearPoints\(\)/);
  assert.match(js,/points = \[\]/);
  assert.match(js,/function cancel\(\)/);
  assert.match(js,/function finish\(\)/);
  assert.match(js,/areaSelectionCleanup = cleanup/);
});
