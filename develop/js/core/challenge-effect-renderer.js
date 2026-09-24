(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function getDurationMs(effect) {
        const value = Number(effect?.renderer?.durationMs);
        return Number.isFinite(value) && value >= 0 ? value : 600;
    }

    function render(effect, options = {}) {
        if (!effect) return "";
        const type = effect.type === "wrong" ? "wrong" : "correct";
        const text = effect.renderer?.kind === "text"
            ? String(effect.renderer.text || "")
            : "";
        const detail = options.detail ? `<div class="challenge-effect-detail">${options.detail}</div>` : "";
        const reward = options.reward ? `<div class="challenge-effect-reward">${options.reward}</div>` : "";

        return `
            <div
                class="challenge-effect challenge-effect-${type}"
                data-effect-id="${effect.id}"
                data-effect-type="${type}"
                style="--challenge-effect-duration:${getDurationMs(effect)}ms"
                role="status"
                aria-live="assertive">
                <div class="challenge-effect-text">${text}</div>
                ${detail}
                ${reward}
            </div>
        `;
    }

    function scheduleAutoAdvance(screen, effect, callback) {
        if (!screen || typeof callback !== "function") return () => {};
        const element = screen.querySelector?.(".challenge-effect[data-effect-type=\"correct\"]");
        if (!element) return () => {};

        let completed = false;
        let timerId = null;

        const finish = () => {
            if (completed) return;
            completed = true;
            if (timerId !== null) root.clearTimeout?.(timerId);
            element.removeEventListener?.("animationend", finish);
            if (screen.isConnected === false) return;
            callback();
        };

        element.addEventListener?.("animationend", finish, { once: true });
        const reducedMotion = root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
        const fallbackDelay = reducedMotion ? 180 : getDurationMs(effect) + 140;
        timerId = root.setTimeout?.(finish, fallbackDelay) ?? null;

        return () => {
            completed = true;
            if (timerId !== null) root.clearTimeout?.(timerId);
            element.removeEventListener?.("animationend", finish);
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.challengeEffectRenderer = Object.freeze({
        getDurationMs,
        render,
        scheduleAutoAdvance
    });
})(globalThis);
