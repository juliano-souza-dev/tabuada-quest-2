(function (root) {
    const TQ = root.TabuadaQuest;
    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) return;

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    function save(nextState) {
        state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
        render();
    }

    function navigate(screenId) {
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
            regions: TQ.screens.regions.renderRegionsScreen,
            islands: TQ.screens.islands.renderIslandsScreen,
            travel: TQ.screens.travel.renderIslandTravelScreen,
            challenge: TQ.screens.challenge.renderChallengeScreen,
            result: TQ.screens.result.renderResultScreen
        };
        const renderer = renderers[state.ui.lastScreen] || renderers.home;

        screens.render(renderer, {
            state,
            onStateChange: save,
            onNavigate: navigate
        });
    }

    render();
})(globalThis);
