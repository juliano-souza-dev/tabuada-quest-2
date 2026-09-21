const test=require("node:test");
const assert=require("node:assert/strict");

global.TabuadaQuest={};
require("../../web/js/content/game-content.js");
const content=global.TabuadaQuest.content;

const expected={
    1:[
        "Mapa da Bandeira Corsária",
        "Mapa do Saque Perdido",
        "Mapa da Rota dos Corsários",
        "Mapa do Tesouro do Capitão",
        "Mapa da Âncora Dourada"
    ],
    13:[
        "Mapa da Rocha Negra",
        "Mapa das Cinzas Eternas",
        "Mapa do Fogo Obsidiano",
        "Mapa da Cratera Sombria",
        "Mapa do Coração de Obsidiana"
    ],
    14:[
        "Mapa do Rubi Sangrento",
        "Mapa da Gruta Carmesim",
        "Mapa das Pedras Rubras",
        "Mapa do Coração Rubi",
        "Mapa da Coroa Escarlate"
    ],
    15:[
        "Mapa do Mar Escarlate",
        "Mapa das Falésias Vermelhas",
        "Mapa da Lua Carmesim",
        "Mapa da Maré Rubra",
        "Mapa do Horizonte Escarlate"
    ]
};

test("catálogo textual preserva cinco mapas por Região definida",()=>{
    for(const [regionId,names] of Object.entries(expected)){
        const maps=content.getRegionTextMaps(Number(regionId));
        assert.equal(maps.length,5);
        assert.deepEqual(maps.map(map=>map.label),names);
    }
});

test("mapas permanecem somente textuais nesta etapa",()=>{
    const all=Object.values(content.regionTextMaps).flatMap(region=>region.maps);
    assert.equal(all.length,20);
    for(const map of all){
        assert.equal(map.representation,"text");
        assert.equal(map.asset,null);
    }
});

test("Região sem catálogo retorna lista vazia",()=>{
    assert.deepEqual(content.getRegionTextMaps(2),[]);
});
