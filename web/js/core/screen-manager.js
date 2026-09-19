(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function createScreenManager(rootElement) {
        if (!rootElement) {
            throw new Error("app root is required");
        }

        return {
            render(renderScreen, context) {
                rootElement.replaceChildren();
                const node = renderScreen(context);
                rootElement.appendChild(node);
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.screenManager = Object.freeze({ createScreenManager });
})(globalThis);
