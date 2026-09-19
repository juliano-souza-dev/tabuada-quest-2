(function (root) {
    // Visual handoff round: premium Home composition validated by Direction Visual.
    const TQ = root.TabuadaQuest;

    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) {
        return;
    }

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    function render() {
        screens.render(TQ.screens.home.renderHomeScreen, {
            state,
            onStateChange(nextState) {
                state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
                render();
            }
        });
    }

    render();
})(globalThis);
