const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete global.TabuadaQuest;
require("../../web/js/content/game-content.js");

const TQ=global.TabuadaQuest;
const webRoot=path.join(__dirname,"../../web");

test("os 30 PETs possuem assets WebP físicos, únicos e otimizados",()=>{
    assert.equal(TQ.content.pets.length,30);

    const assetPaths=TQ.content.pets.map((pet)=>pet.asset);
    assert.equal(new Set(assetPaths).size,30);

    for(const pet of TQ.content.pets){
        const relative=pet.asset.replace(/^\.\//,"");
        const absolute=path.join(webRoot,relative);
        assert.equal(fs.existsSync(absolute),true,`${pet.id} sem asset físico: ${relative}`);
        const size=fs.statSync(absolute).size;
        assert.ok(size>20_000,`${pet.label} parece inválido: ${size} bytes`);
        assert.ok(size<250_000,`${pet.label} está pesado demais: ${size} bytes`);
    }
});

test("ordem dos 29 novos PETs ocupa os 29 resgates após o Capitão Axolote",()=>{
    const expected=[
        "Capitão Axolote","Pluma","Faísca","Marujo","Coral","Pingo","Trovão","Rubi",
        "Pirilampo","Bolota","Brisa","Dourado","Pipoca","Cascalho","Estrela","Fumaça",
        "Pérola","Farofa","Tempestade","Biscoito","Oceano","Canela","Relâmpago",
        "Bambuzinho","Tesouro","Azulão","Cacau","Capitão","Jujuba","Farol"
    ];
    assert.deepEqual(TQ.content.pets.map((pet)=>pet.label),expected);
});

test("cada asset de PET aponta para o resgate canônico da própria Região e Ilha",()=>{
    for(const pet of TQ.content.pets){
        const match=pet.id.match(/^pet-r(\d+)-i(\d+)$/);
        assert.ok(match,`ID não canônico: ${pet.id}`);
        const reward=TQ.content.getIslandPrimaryReward(Number(match[1]),Number(match[2]));
        assert.equal(reward?.type,"pet");
        assert.equal(reward?.petId,pet.id);
    }
});
