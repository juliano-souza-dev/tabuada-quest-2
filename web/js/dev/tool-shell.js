(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    TQ.dev = TQ.dev || {};

    let activeTool = null;
    const listeners = new Set();

    function normalizeTool(tool) {
        const value = String(tool || "").trim().toLowerCase();
        return value || null;
    }

    function publish(tool, detail = {}) {
        activeTool = normalizeTool(tool);
        if (activeTool) {
            document.body.dataset.tqDevActiveTool = activeTool;
        } else {
            delete document.body.dataset.tqDevActiveTool;
        }

        const snapshot = Object.freeze({
            activeTool,
            ...detail
        });

        listeners.forEach((listener) => {
            try { listener(snapshot); } catch (_) {}
        });

        root.dispatchEvent(new CustomEvent("tq:dev-active-tool-changed", {
            detail: snapshot
        }));

        return snapshot;
    }

    function activate(tool, detail = {}) {
        const normalized = normalizeTool(tool);
        if (!normalized) return publish(null, detail);

        root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
            detail: {
                ...detail,
                tool: normalized,
                source: detail.source || "tool-shell"
            }
        }));

        return publish(normalized, detail);
    }

    function close(detail = {}) {
        return publish(null, detail);
    }

    function subscribe(listener) {
        if (typeof listener !== "function") return () => {};
        listeners.add(listener);
        listener(Object.freeze({ activeTool }));
        return () => listeners.delete(listener);
    }

    function onToolActivate(event) {
        const tool = normalizeTool(event.detail?.tool);
        if (!tool) return;
        if (tool === activeTool) return;
        publish(tool, {
            source: event.detail?.source || "external"
        });
    }

    root.addEventListener("tq:dev-tool-activate", onToolActivate);

    TQ.dev.toolShell = Object.freeze({
        activate,
        close,
        subscribe,
        getActiveTool: () => activeTool
    });
})(globalThis);
