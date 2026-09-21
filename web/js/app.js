(function (root) {
    const TQ = root.TabuadaQuest;
    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) return;

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    let worldMapPreviewRegionId = null;
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    function save(nextState) {
        state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
        render();
    }

    function setWorldMapPreviewRegion(regionId) {
        const normalized = Number(regionId);
        worldMapPreviewRegionId = Number.isInteger(normalized) && normalized >= 1 && normalized <= 22
            ? normalized
            : null;
    }

    function navigate(screenId) {
        if (!["world-map", "islands"].includes(screenId)) {
            worldMapPreviewRegionId = null;
        }

        state = TQ.persistence.localStorage.saveState(
            root.localStorage,
            TQ.domain.playerState.withLastScreen(state, screenId)
        );
        render();
    }

    function render() {
        const renderers = {
            home: TQ.screens.home.renderHomeScreen,
            crew: TQ.screens.crew.renderCrewScreen,
            collectibles: TQ.screens.collectibles.renderCollectiblesScreen,
            shop: TQ.screens.shop.renderShopScreen,
            "world-map": TQ.screens.worldMap.renderWorldMapScreen,
            regions: TQ.screens.regions.renderRegionsScreen,
            islands: TQ.screens.islands.renderIslandsScreen,
            travel: TQ.screens.travel.renderIslandTravelScreen,
            challenge: TQ.screens.challenge.renderChallengeScreen,
            "special-mission": TQ.screens.specialMission.renderSpecialMissionScreen,
            chest: TQ.screens.chest.renderChestScreen,
            result: TQ.screens.result.renderResultScreen
        };
        const renderer = renderers[state.ui.lastScreen] || renderers.home;

        screens.render(renderer, {
            state,
            onStateChange: save,
            onNavigate: navigate,
            previewRegionId: worldMapPreviewRegionId,
            onPreviewRegionChange: setWorldMapPreviewRegion
        });
    }

    render();
})(globalThis);
