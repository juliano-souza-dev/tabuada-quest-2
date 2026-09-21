const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/result-screen.js");

const TQ=globalThis.TabuadaQuest;

test("tela de conclusão usa o asset global WebP aprovado",()=>{
    const asset=TQ.content.assets.global.victoryScreen;
    assert.match(asset,/assets\/global\/gb_win\.webp/);

    const cleanPath=asset.split("?")[0].replace(/^\.\//,"");
    assert.equal(
        fs.existsSync(path.join(__dirname,"../../web",cleanPath)),
        true,
        `asset ausente: ${cleanPath}`
    );
});

test("resultado mantém dados da partida como overlays dinâmicos",()=>{
    const source=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/result-screen.js"),
        "utf8"
    );

    assert.match(source,/TQ\.content\.assets\.global\?\.victoryScreen/);
    assert.match(source,/result\.plannedAnswered/);
    assert.match(source,/result\.correctAnswers/);
    assert.match(source,/result\.wrongAnswers/);
    assert.match(source,/result\.recoveryAnswers/);
    assert.match(source,/result\.reward/);
    assert.match(source,/data-action="islands"/);
    assert.match(source,/data-action="regions"/);
    assert.match(source,/data-action="special-mission"/);
    assert.doesNotMatch(source,/Ilha \${result\.islandId} concluída/);
    assert.doesNotMatch(source,/resgatado/);
    assert.doesNotMatch(source,/conquistado/);
});

test("CSS mantém stage proporcional e hitboxes alinhadas ao asset",()=>{
    const css=fs.readFileSync(
        path.join(__dirname,"../../web/css/screens/vertical-slice.css"),
        "utf8"
    );

    assert.match(css,/\.result-art-stage/);
    assert.match(css,/aspect-ratio:\s*941\s*\/\s*1672/);
    assert.match(css,/\.result-art-title/);
    assert.match(css,/\.result-art-stats/);
    assert.match(css,/\.result-art-reward-zone/);
    assert.match(css,/\.result-art-structural-rewards/);
    assert.match(css,/\.result-art-numeric-rewards/);
    assert.match(css,/flex-direction:\s*column/);
    assert.match(css,/\.result-art-action-primary/);
    assert.match(css,/\.result-art-action-secondary/);
});
