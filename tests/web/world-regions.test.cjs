const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

const content = globalThis.TabuadaQuest.content;

test("Mapa Mundo possui as 22 Regiões canônicas em ordem", () => {
    assert.equal(content.worldRegions.length, 22);
    assert.deepEqual(
        content.worldRegions.map((region) => region.label),
        [
            "CORSÁRIO",
            "BIRADES",
            "ZONA OURO",
            "TERRAS GÉLIDAS",
            "ZONA SAFIRA",
            "VALE ESMERALDA",
            "FANTASMAS",
            "MARÉ SOMBRIA",
            "TEMPESTÁRIA",
            "MAR DE FERRO",
            "ZONA KRAKEN",
            "TERRAS DE CINZA",
            "OBSIDIANA",
            "ZONA RUBI",
            "ESCARLATE",
            "ZONA DO DRAGÃO",
            "TERRAS DO TITÃ",
            "CRISTÁLIA",
            "ILHAS CELESTES",
            "COROA DO MAR",
            "ZONA FÊNIX",
            "REINO DAS MARÉS"
        ]
    );
});

test("IDs do Mapa Mundo são únicos e consultáveis", () => {
    const ids = content.worldRegions.map((region) => region.id);
    assert.equal(new Set(ids).size, 22);
    assert.equal(content.getWorldRegion(13).label, "OBSIDIANA");
    assert.equal(content.getWorldRegion(22).label, "REINO DAS MARÉS");
    assert.equal(content.getWorldRegion(23), null);
});


test("TERRAS GÉLIDAS ocupa oficialmente a Região 4",()=>{
    assert.equal(content.getWorldRegion(4).label,"TERRAS GÉLIDAS");
    assert.equal(content.getWorldRegion(6).label,"VALE ESMERALDA");
});
