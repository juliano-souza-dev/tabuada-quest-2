const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete global.TabuadaQuest;
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/scheduler.js");
require("../../web/js/domain/player-state.js");
require("../../web/js/domain/gameplay-session.js");
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const islands=global.TabuadaQuest.screens.islands;
const playerState=global.TabuadaQuest.domain.playerState;

test("preview deriva Regiões implementadas do REGION_VISUAL_CONFIG",()=>{
    const expected=Object.keys(islands.REGION_VISUAL_CONFIG)
        .map(Number)
        .sort((a,b)=>a-b);

    assert.deepEqual(islands.getImplementedRegionIds(),expected);
    for(const regionId of expected){
        assert.ok(islands.getRegionVisualConfig(regionId));
        assert.equal(islands.getDevelopmentRegionStatus(regionId),"completed");
    }
});

test("Região sem implementação visual permanece apenas como prévia",()=>{
    assert.equal(islands.getDevelopmentRegionStatus(999),"preview");
});

test("status automático de desenvolvimento não depende do estado persistente do jogador",()=>{
    const before={campaign:{unlockedRegionIds:[1],completedRegionIds:[]}};
    const snapshot=JSON.stringify(before);
    islands.getDevelopmentRegionStatus(13);
    assert.equal(JSON.stringify(before),snapshot);
});


test("atalho temporário de desenvolvimento mantém acesso à lista sem asset",()=>{
    assert.equal(global.TabuadaQuest.content.development.shortcutsEnabled,true);

    const home=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/home-screen.js"),
        "utf8"
    );
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    const developmentScreen=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/development-regions-screen.js"),
        "utf8"
    );
    const islandsScreen=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(home,/data-action="development-regions"/);
    assert.match(app,/"development-regions": TQ\.screens\.developmentRegions\.renderDevelopmentRegionsScreen/);
    assert.match(developmentScreen,/Acesso de desenvolvimento/);
    assert.match(developmentScreen,/onPreviewRegionChange/);
    assert.match(developmentScreen,/onNavigate\("islands"\)/);
    assert.match(islandsScreen,/previewMode \? "development-regions" : "regions"/);
});


test("DEV Regiões é um destino válido do estado de navegação",()=>{
    const initial=playerState.createInitialState();
    const next=playerState.withLastScreen(initial,"development-regions");

    assert.equal(next.ui.lastScreen,"development-regions");
});


test("Ilha aberta pelo DEV inicia desafio sem exigir desbloqueio da campanha",()=>{
    const initial=playerState.createInitialState();
    const snapshot=JSON.stringify(initial);

    const next=islands.createDevelopmentIslandEntryState(initial,2,5);

    assert.equal(next.ui.lastScreen,"challenge");
    assert.equal(next.learning.activeSession.regionId,2);
    assert.equal(next.learning.activeSession.islandId,5);
    assert.ok(next.learning.activeSession.currentChallenge);
    assert.equal(JSON.stringify(initial),snapshot);
});

test("fluxo DEV usa estado volátil e não salva partida de teste no progresso real",()=>{
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    const islandsSource=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(app,/let developmentState = null/);
    assert.match(app,/let developmentMode = false/);
    assert.match(app,/if \(developmentMode\) \{\s*developmentState = nextState;/);
    assert.match(app,/screenId === "development-regions"/);
    assert.match(app,/developmentState = TQ\.domain\.playerState\.withLastScreen/);
    assert.match(app,/screenId === "home"/);

    assert.match(islandsSource,/createDevelopmentIslandEntryState/);
    assert.match(islandsSource,/onStateChange\(createDevelopmentIslandEntryState\(state, regionId, islandId\)\)/);
    assert.doesNotMatch(islandsSource,/if \(previewMode\) return;/);
});


test("DEV Regiões usa seleção própria e callback explícito para abrir Ilha",()=>{
    const app=fs.readFileSync(
        path.join(__dirname,"../../web/js/app.js"),
        "utf8"
    );
    const islandsSource=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    assert.match(app,/let developmentRegionId = null/);
    assert.match(app,/function setDevelopmentRegion\(regionId\)/);
    assert.match(app,/function openDevelopmentIsland\(regionId, islandId\)/);
    assert.match(app,/TQ\.screens\.islands\.createDevelopmentIslandEntryState/);
    assert.match(app,/previewRegionId: developmentMode \? developmentRegionId : worldMapPreviewRegionId/);
    assert.match(app,/onPreviewRegionChange: developmentMode \? setDevelopmentRegion : setWorldMapPreviewRegion/);
    assert.match(app,/onDevelopmentIslandOpen: openDevelopmentIsland/);

    assert.match(islandsSource,/if \(developmentMode\) \{/);
    assert.match(islandsSource,/onDevelopmentIslandOpen\(regionId, islandId\)/);
    assert.match(islandsSource,/if \(previewMode\) return;/);
});

test("prévia normal de mapa continua não-jogável",()=>{
    const islandsSource=fs.readFileSync(
        path.join(__dirname,"../../web/js/screens/islands-screen.js"),
        "utf8"
    );

    const devBranch=islandsSource.indexOf("if (developmentMode) {");
    const previewGuard=islandsSource.indexOf("if (previewMode) return;",devBranch);
    assert.ok(devBranch>=0);
    assert.ok(previewGuard>devBranch);
});
