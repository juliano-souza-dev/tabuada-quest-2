(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function open({ onNavigate } = {}) {
        const canNavigate = typeof onNavigate === "function";
        if (canNavigate) onNavigate("world-map");

        return Object.freeze({
            handled: true,
            implemented: true,
            mode: "development-navigation",
            nextScreen: "world-map",
            canNavigate
        });
    }

    TQ.core = TQ.core || {};
    TQ.core.worldMap = Object.freeze({
        open
    });
})(globalThis);
