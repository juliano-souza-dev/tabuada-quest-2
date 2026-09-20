(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const PLACEHOLDER_MESSAGE = "Mapa mundo ainda está em produção.";

    function open({ onNavigate } = {}) {
        // Ponto único de entrada do Mapa mundo.
        // Quando a tela real existir, a troca para onNavigate("world-map")
        // deve acontecer somente aqui.
        if (typeof root.alert === "function") {
            root.alert(PLACEHOLDER_MESSAGE);
        }

        return Object.freeze({
            handled: true,
            implemented: false,
            nextScreen: "world-map",
            canNavigate: typeof onNavigate === "function"
        });
    }

    TQ.core = TQ.core || {};
    TQ.core.worldMap = Object.freeze({
        open,
        PLACEHOLDER_MESSAGE
    });
})(globalThis);
