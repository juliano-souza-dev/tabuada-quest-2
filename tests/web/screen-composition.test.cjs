const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

function loadComposition(){
    const data=new Map();
    const context=vm.createContext({
        console,
        localStorage:{
            getItem(key){return data.has(key)?data.get(key):null;},
            setItem(key,value){data.set(key,String(value));},
            removeItem(key){data.delete(key);}
        },
        TabuadaQuest:{content:{}}
    });
    vm.runInContext(read("web/js/content/screen-composition.js"),context);
    vm.runInContext(read("web/js/content/region-schema.js"),context);
    return context.TabuadaQuest;
}

test("mapa semantico das telas respeita a composicao declarada",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;

    const home=composition.getAssetSlots("home");
    assert.equal(home.length,12);
    assert.equal(home.filter((slot)=>slot.group==="header").length,3);
    assert.equal(home.filter((slot)=>slot.group==="buttons").length,8);

    const nautical=composition.getAssetSlots("nautical-chart");
    assert.equal(nautical.length,3);
    assert.deepEqual(
        Array.from(composition.getFunctionSlots("nautical-chart"),(item)=>item.action),
        ["back","next-chart","previous-chart","open-region"]
    );

    const region=composition.getAssetSlots("islands");
    assert.equal(region.length,33);
    assert.equal(region.filter((slot)=>slot.required).length,13);
    assert.equal(region.filter((slot)=>slot.group==="clouds").length,10);
    assert.equal(region.filter((slot)=>slot.group==="environment").length,10);

    const islandGame=composition.getAssetSlots("challenge");
    assert.equal(islandGame.filter((slot)=>slot.semanticType==="ocean").length,1);
    assert.equal(islandGame.filter((slot)=>slot.semanticType==="cloud").length,10);
    assert.ok(islandGame.some((slot)=>slot.semanticType==="island_background"));
    assert.ok(islandGame.some((slot)=>slot.semanticType==="pier"));
});

test("cinco ilhas possuem pares bloqueada e desbloqueada",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;

    for(let island=1;island<=5;island+=1){
        const pair=composition.getPair("islands","regions.island."+island);
        assert.equal(pair.length,2);
        assert.deepEqual(
            Array.from(pair,(slot)=>slot.pairState).sort(),
            ["locked","unlocked"]
        );
        assert.ok(pair.every((slot)=>slot.required));
    }
});

test("regiao nova nasce com slots completos e todos os assets nulos",()=>{
    const TQ=loadComposition();
    const region=TQ.regionSchema.createRegionDefinition({
        order:23,
        id:"teste",
        label:"Teste"
    });

    assert.equal(region.schemaVersion,2);
    assert.equal(region.screen.compositionType,"region-map");
    assert.equal(region.screen.assets.length,33);
    assert.ok(region.screen.assets.every((slot)=>slot.asset===null));
    assert.equal(region.islands.length,5);

    const requiredTypes=region.screen.actions
        .filter((action)=>action.required)
        .map((action)=>action.type);
    assert.equal(requiredTypes.filter((type)=>type==="open_island").length,5);
    assert.ok(requiredTypes.includes("go_back"));
    assert.ok(requiredTypes.includes("open_world_map"));
});

test("navio e nuvem recebem somente efeitos compativeis",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;

    assert.deepEqual(
        Array.from(composition.allowedFxForSemanticType("ship")),
        ["depth","parallax","ship-rock"]
    );
    assert.deepEqual(
        Array.from(composition.depthRolesForSemanticType("ship")),
        ["ship"]
    );
    assert.deepEqual(
        Array.from(composition.depthRolesForSemanticType("cloud")),
        ["cloudFar","cloudNear"]
    );
    assert.deepEqual(
        Array.from(composition.allowedFxForSemanticType("ocean")),
        ["ocean"]
    );
});

test("fundo da Home suporta variantes e efeitos por fundo",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;
    const slot=composition.getSlot("home","home.background.main");

    assert.equal(slot.bindingMode,"variants");
    assert.equal(slot.fxPerVariant,true);

    composition.bindVariant(
        "home",
        "home",
        slot.id,
        "pirate-main",
        "./assets/backgrounds/main.webp",
        {effects:[{id:"clouds"}]}
    );
    composition.bindVariant(
        "home",
        "home",
        slot.id,
        "pirate-bay",
        "./assets/backgrounds/bay.webp",
        {effects:[{id:"fog"}]}
    );

    const binding=composition.readBinding("home","home",slot.id);
    assert.equal(binding.asset,null);
    assert.equal(binding.variants.length,2);
    assert.equal(binding.variants[0].effects.length,1);
    assert.equal(binding.variants[1].effects.length,1);
});
