const test=require("node:test");
const assert=require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
const regions=globalThis.TabuadaQuest.content.regions;

test("catálogo funcional usa exatamente as 22 Regiões canônicas",()=>{
    assert.deepEqual(regions.map(r=>r.label),[
        "CORSÁRIO","BIRADES","ZONA OURO","VALE ESMERALDA","ZONA SAFIRA","TERRAS GÉLIDAS",
        "FANTASMAS","MARÉ SOMBRIA","TEMPESTÁRIA","MAR DE FERRO","ZONA KRAKEN","TERRAS DE CINZA",
        "OBSIDIANA","ZONA RUBI","ESCARLATE","ZONA DO DRAGÃO","TERRAS DO TITÃ","CRISTÁLIA",
        "ILHAS CELESTES","COROA DO MAR","ZONA FÊNIX","REINO DAS MARÉS"
    ]);
    assert.equal(regions.length,22);
    assert.ok(regions.every(r=>r.islandsTotal===5));
    assert.equal(regions[21].isFinalRegion,true);
});

test("campaignTotals representa 22x5 sem alterar as 110 Ilhas",()=>{
    const totals=globalThis.TabuadaQuest.content.campaignTotals;
    assert.equal(totals.regions,22);
    assert.equal(totals.islandsPerRegion,5);
    assert.equal(totals.islands,110);
});
