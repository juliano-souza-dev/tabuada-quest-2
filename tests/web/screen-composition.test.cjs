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
    assert.equal(home.length,53);
    assert.equal(home.filter((slot)=>slot.group==="header").length,4);
    assert.equal(home.filter((slot)=>slot.group==="character").length,1);
    assert.equal(home.filter((slot)=>slot.group==="buttons").length,8);
    assert.equal(home.find((slot)=>slot.id==="home.header.avatar").label,"Avatar rosto");
    assert.equal(home.find((slot)=>slot.id==="home.character.avatar-full").label,"Avatar completo");
    assert.equal(home.find((slot)=>slot.id==="home.character.avatar-full").required,true);
    assert.deepEqual(
        Array.from(composition.allowedFxForSemanticType("avatar_full")),
        ["depth"]
    );
    assert.deepEqual(
        Array.from(composition.allowedFxForSemanticType("avatar")),
        []
    );
    assert.equal(home.filter((slot)=>slot.semanticType==="ocean").length,1);
    assert.equal(home.filter((slot)=>slot.group==="background-clouds").length,10);
    assert.equal(home.filter((slot)=>slot.group==="background-ships").length,5);
    assert.equal(home.filter((slot)=>slot.group==="background-islands").length,3);
    assert.equal(home.filter((slot)=>slot.group==="background-pier").length,1);
    assert.equal(home.filter((slot)=>slot.group==="background-pier" && slot.required).length,1);
    assert.equal(home.filter((slot)=>slot.group==="background-scenery").length,20);
    assert.equal(home.filter((slot)=>slot.group==="background-scenery" && slot.required).length,0);
    assert.equal(home.filter((slot)=>slot.group==="background-ships" && slot.required).length,1);
    assert.equal(home.filter((slot)=>slot.semanticType==="level_plate").length,1);
    assert.equal(home.find((slot)=>slot.semanticType==="level_plate").required,true);

    const homeBackground=composition.getComposition("home","home.background.composition");
    const homeBackgroundSlots=composition.getCompositionSlots("home",homeBackground.id);
    assert.equal(homeBackgroundSlots.length,40);
    assert.deepEqual(
        Array.from(new Set(homeBackgroundSlots.map((slot)=>slot.semanticType))).sort(),
        ["cloud","environment","island","ocean","pier","ship"]
    );
    assert.ok(homeBackgroundSlots.every((slot)=>
        composition.compositionAcceptsSlot("home",homeBackground.id,slot)
    ));
    assert.ok(home.filter((slot)=>slot.group==="header").every((slot)=>
        !composition.compositionAcceptsSlot("home",homeBackground.id,slot)
    ));
    assert.equal(
        composition.compositionAcceptsSlot(
            "home",
            homeBackground.id,
            home.find((slot)=>slot.id==="home.character.avatar-full")
        ),
        false
    );
    assert.deepEqual(
        JSON.parse(JSON.stringify(composition.getAssetLimits("home"))),
        {
            "background-ocean": {label:"Oceano",min:1,max:1},
            "background-clouds": {label:"Nuvens",min:0,max:10},
            "background-ships": {label:"Navios",min:1,max:5},
            "background-islands": {label:"Ilhas",min:0,max:3},
            "background-pier": {label:"Pier",min:1,max:1},
            "background-scenery": {label:"Itens de cenário",min:0,max:20},
            "character": {label:"Avatar completo",min:1,max:1}
        }
    );

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
    assert.deepEqual(
        Array.from(region.find((slot)=>slot.group==="environment").acceptedTypes),
        ["environment","island"]
    );

    const islandGame=composition.getAssetSlots("challenge");
    assert.equal(islandGame.filter((slot)=>slot.semanticType==="ocean").length,1);
    assert.equal(islandGame.filter((slot)=>slot.semanticType==="cloud").length,10);
    assert.equal(islandGame.filter((slot)=>slot.semanticType==="cloud" && slot.required).length,0);
    assert.deepEqual(
        JSON.parse(JSON.stringify(composition.getAssetLimit("challenge","clouds"))),
        {label:"Nuvens",min:0,max:10}
    );
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
        ["depth","ship-rock"]
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

test("composição da Home mantém variantes por peça e restaura só a ativa",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;
    const slot=composition.getSlot("home","home.background.ocean");

    assert.equal(slot.bindingMode,"variants");
    assert.equal(slot.fxPerVariant,true);

    composition.bindVariant(
        "home",
        "home",
        slot.id,
        "pirate-main",
        "./assets/ocean-main.webp"
    );
    composition.bindVariant(
        "home",
        "home",
        slot.id,
        "pirate-bay",
        "./assets/ocean-bay.webp"
    );

    composition.resetScopeVariant("home","home","pirate-main");

    const binding=composition.readBinding("home","home",slot.id);
    assert.equal(binding.asset,null);
    assert.ok(binding.variants.some((variant)=>variant.id==="default"));
    assert.ok(binding.variants.some((variant)=>variant.id==="pirate-bay"));
    assert.ok(!binding.variants.some((variant)=>variant.id==="pirate-main"));
});

test("Home usa bindings publicados sem impedir reset explícito",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;

    const frame=composition.readBinding("home","home","home.header.frame");
    assert.equal(frame.asset,"./assets/ui/plaquinhas/coroa_da_rosa_dos_ventos.webp");

    const avatar=composition.readBinding("home","home","home.header.avatar");
    assert.equal(avatar.asset,"./assets/avatars/avatar-sofia-pirata-rosto.webp");

    assert.equal(composition.resolveHomeBackgroundGroupId("pirate-main"),"default");
    assert.equal(composition.HOME_BACKGROUND_GROUP_CATALOG.default.folder,"./assets/backgrounds/default/");

    const ocean=composition.readBinding("home","home","home.background.ocean");
    assert.equal(ocean.variants.length,1);
    assert.equal(ocean.variants[0].id,"default");
    assert.equal(ocean.variants[0].asset,"./assets/backgrounds/default/oceano.webp");

    const cloud1=composition.readBinding("home","home","home.background.cloud.1");
    assert.equal(cloud1.variants[0].asset,"./assets/backgrounds/default/cloud-sunset-01.webp");

    const ship1=composition.readBinding("home","home","home.background.ship.1");
    assert.equal(ship1.variants[0].asset,"./assets/backgrounds/default/navio-pirata.webp");

    const island1=composition.readBinding("home","home","home.background.island.1");
    assert.equal(island1.variants[0].asset,"./assets/backgrounds/default/island-01-unlocked.webp");

    const pier=composition.readBinding("home","home","home.background.pier");
    assert.equal(pier.variants[0].asset,"./assets/backgrounds/default/wooden-pier.webp");

    const scenery1=composition.readBinding("home","home","home.background.scenery.1");
    const scenery2=composition.readBinding("home","home","home.background.scenery.2");
    const scenery3=composition.readBinding("home","home","home.background.scenery.3");
    const sky=composition.readBinding("home","home","home.background.scenery.4");
    assert.equal(scenery1.variants[0].asset,"./assets/backgrounds/default/construcoes-piratas.webp");
    assert.equal(scenery2.variants[0].asset,"./assets/backgrounds/default/pirate-lantern.webp");
    assert.equal(scenery3.variants[0].asset,"./assets/backgrounds/default/home-art-overlay.webp");
    assert.equal(sky.variants[0].asset,"./assets/backgrounds/default/sky-sunset.webp");

    const play=composition.readBinding("home","home","home.button.play");
    const regions=composition.readBinding("home","home","home.button.regions");
    assert.equal(play.asset,"./assets/ui/icons/jogar.webp");
    assert.equal(regions.asset,"./assets/ui/icons/regioes.webp");

    composition.resetScope("home","home");

    assert.equal(
        composition.readBinding("home","home","home.header.frame").asset,
        "./assets/ui/plaquinhas/coroa_da_rosa_dos_ventos.webp"
    );
    assert.equal(
        composition.readBinding("home","home","home.background.scenery.4").variants[0].asset,
        "./assets/backgrounds/default/sky-sunset.webp"
    );
});

test("Home publica oceano e profundidade da composição pirate-main",()=>{
    const data=new Map();
    const context=vm.createContext({
        console,
        localStorage:{
            getItem(key){return data.has(key)?data.get(key):null;},
            setItem(key,value){data.set(key,String(value));},
            removeItem(key){data.delete(key);}
        },
        TabuadaQuest:{core:{}}
    });

    vm.runInContext(read("web/js/core/ocean-scene.js"),context);
    const ocean=context.TabuadaQuest.core.oceanScene.readConfig("home.background-pirate-main",null);
    const oceanDefault=context.TabuadaQuest.core.oceanScene.readConfig("home.background-default",null);
    assert.equal(ocean.enabled,true);
    assert.equal(oceanDefault.enabled,true);
    assert.equal(oceanDefault.movement,52);
    assert.equal(ocean.preset,"adventure");
    assert.equal(ocean.movement,52);
    assert.equal(ocean.speed,44);
    assert.equal(ocean.shine,4);
    assert.equal(ocean.foam,28);
    assert.equal(ocean.ripples,true);
    assert.equal(ocean.shipWake,false);
    assert.equal(ocean.quality,"balanced");
    assert.equal(ocean.area.length,220);

    vm.runInContext(read("web/js/core/depth-scene.js"),context);
    const depth=context.TabuadaQuest.core.depthScene.readConfig("home.background-pirate-main",null);
    const depthDefault=context.TabuadaQuest.core.depthScene.readConfig("home.background-default",null);
    assert.equal(depth.enabled,true);
    assert.equal(depthDefault.enabled,true);
    assert.equal(depthDefault.intensity,84);
    assert.equal(depth.intensity,84);
    assert.equal(depth.followPointer,false);
    assert.equal(depth.layers["home.background.ship.1"].role,"ship");
    assert.equal(depth.layers["home.background.cloud.1"].elementType,"cloud");
    assert.equal(depth.layers["home.background.cloud.1"].direction,"right");
    assert.equal(depth.layers["home.background.cloud.1"].depth,23);
    assert.equal(depth.layers["home.background.cloud.1"].opacity,34);
    assert.equal(depth.layers["home.background.cloud.2"].enabled,false);
    assert.equal(depth.layers["home.background.cloud.2"].tilt,45);
    assert.equal(depth.layers["home.background.pier"].elementType,"pier");
    assert.equal(depth.layers["home.background.pier"].direction,"right");
    assert.ok(!Object.keys(depth.layers).some((id)=>id.includes(".auto.")));
});

test("carregamento não contém reset automático de composição ou drafts locais",()=>{
    const compositionJs=read("web/js/content/screen-composition.js");
    const uploaderJs=read("web/js/dev/asset-uploader.js");

    assert.doesNotMatch(compositionJs,/ensureCompositionReset/);
    assert.doesNotMatch(compositionJs,/localStorage\.removeItem/);
    assert.doesNotMatch(uploaderJs,/ensureLocalDraftReset/);

    const restoreStart=uploaderJs.indexOf("async function restoreLocalLayers");
    const restoreEnd=uploaderJs.indexOf("\n    function mount(",restoreStart);
    const restoreBody=uploaderJs.slice(restoreStart,restoreEnd);

    assert.doesNotMatch(restoreBody,/deleteLocalLayerRecord/);
    assert.doesNotMatch(restoreBody,/\.clear\(\)/);
    assert.doesNotMatch(restoreBody,/localStorage\.removeItem/);
});

test("binding local vazio antigo não mascara asset publicado",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;

    const key=composition.STORAGE_KEY;
    globalThis.__noop=null;

    const contextFrame=composition.readBinding("home","home","home.header.frame");
    assert.equal(contextFrame.asset,"./assets/ui/plaquinhas/coroa_da_rosa_dos_ventos.webp");

    composition.bindAsset("home","home","home.header.frame",null);
    const stale=composition.readBinding("home","home","home.header.frame");
    assert.equal(stale.asset,"./assets/ui/plaquinhas/coroa_da_rosa_dos_ventos.webp");

    composition.unbindAsset("home","home","home.header.frame");
    assert.equal(composition.readBinding("home","home","home.header.frame").asset,null);

    composition.resetScope("home","home");
    assert.equal(
        composition.readBinding("home","home","home.header.frame").asset,
        "./assets/ui/plaquinhas/coroa_da_rosa_dos_ventos.webp"
    );
});

test("remoção explícita de variante publicada usa tombstone e reset restaura",()=>{
    const TQ=loadComposition();
    const composition=TQ.content.screenComposition;
    const slotId="home.background.ocean";

    assert.ok(
        composition.readBinding("home","home",slotId).variants
            .some((variant)=>variant.id==="default")
    );

    composition.unbindVariant("home","home",slotId,"default");
    assert.ok(
        !composition.readBinding("home","home",slotId).variants
            .some((variant)=>variant.id==="default")
    );

    composition.resetScopeVariant("home","home","default");
    assert.ok(
        composition.readBinding("home","home",slotId).variants
            .some((variant)=>variant.id==="default")
    );
});
