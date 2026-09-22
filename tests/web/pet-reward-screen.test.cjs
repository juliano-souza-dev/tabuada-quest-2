const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.join(__dirname,"../../");
const read=(relative)=>fs.readFileSync(path.join(root,relative),"utf8");

test("asset global de resgate de PET usa WebP sem o PNG temporário",()=>{
    assert.equal(
        fs.existsSync(path.join(root,"web/assets/global/pet_rescue_screen.webp")),
        true
    );
    assert.equal(
        fs.existsSync(path.join(root,"web/assets/global/ac5173e1-4012-4f34-b6b6-d5c2785dd8f5.png")),
        false
    );

    const content=read("web/js/content/game-content.js");
    assert.match(
        content,
        /petRescueScreen:\s*"\.\/assets\/global\/pet_rescue_screen\.webp/
    );
});

test("tela de PET usa o asset global e mantém PET e bônus dinâmicos",()=>{
    const screen=read("web/js/screens/pet-screen.js");
    assert.match(screen,/TQ\.content\.assets\.global\.petRescueScreen/);
    assert.match(screen,/class="pet-rescue-pet"/);
    assert.match(screen,/resolvePetAsset\(petReward, pet\)/);
    assert.match(screen,/resolvePetBonusText\(petReward, pet\)/);
    assert.match(screen,/class="pet-rescue-bonus"/);
    assert.match(screen,/data-action="continue"/);
});

test("PET específico e bônus da recompensa têm prioridade sobre fallback",()=>{
    delete global.TabuadaQuest;
    global.TabuadaQuest={content:{assets:{pet:"fallback-pet.webp"}}};
    const modulePath=require.resolve("../../web/js/screens/pet-screen.js");
    delete require.cache[modulePath];
    require(modulePath);

    const petScreen=global.TabuadaQuest.screens.pet;

    assert.equal(
        petScreen.resolvePetAsset(
            {asset:"reward-pet.webp"},
            {asset:"catalog-pet.webp"}
        ),
        "reward-pet.webp"
    );

    assert.equal(
        petScreen.resolvePetAsset({}, {asset:"catalog-pet.webp"}),
        "catalog-pet.webp"
    );

    assert.equal(
        petScreen.resolvePetBonusText(
            {bonusText:"+10% de Ouro em cada baú encontrado."},
            {bonusText:"fallback"}
        ),
        "+10% de Ouro em cada baú encontrado."
    );
});
