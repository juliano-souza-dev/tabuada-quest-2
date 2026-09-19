(function (root) {
    const TQ = root.TabuadaQuest;

    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) {
        return;
    }

    const state = TQ.persistence.localStorage.loadState(root.localStorage);
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    screens.render(TQ.screens.home.renderHomeScreen, { state });
})(globalThis);
