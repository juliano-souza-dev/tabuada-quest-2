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
        const screenId = state.ui.lastScreen === "regions" ? "regions" : "home";
        const renderer = screenId === "regions"
            ? TQ.screens.regions.renderRegionsScreen
            : TQ.screens.home.renderHomeScreen;

        screens.render(renderer, {
            state,
            onStateChange: save,
            onNavigate: navigate
        });
    }

    render();
})(globalThis);
