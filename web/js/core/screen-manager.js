(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function waitForVisualAssets(node) {
        const images = Array.from(node.querySelectorAll("img"));
        const imageJobs = images.map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
            });
        });
        const fontJob = document.fonts?.ready?.catch?.(() => {}) || Promise.resolve();
        return Promise.all([fontJob, ...imageJobs]);
    }

    function createScreenManager(rootElement) {
        if (!rootElement) throw new Error("app root is required");

        let transitionToken = 0;

        return {
            async render(renderScreen, context) {
                const token = ++transitionToken;
                const previous = rootElement.firstElementChild;
                const next = renderScreen(context);

                if (!previous) {
                    rootElement.appendChild(next);
                    return;
                }

                const loader = document.createElement("div");
                loader.className = "tq-screen-transition-loader";
                loader.setAttribute("role", "status");
                loader.setAttribute("aria-label", "Carregando");
                loader.innerHTML = '<div class="tq-ocean-loader-host"></div>';
                rootElement.appendChild(loader);
                const stopLoader = TQ.core.oceanLoader?.mount(loader.querySelector(".tq-ocean-loader-host"));

                next.classList.add("tq-screen-preparing");
                rootElement.appendChild(next);

                await waitForVisualAssets(next);
                if (token !== transitionToken) {
                    stopLoader?.();
                    loader.remove();
                    next.remove();
                    return;
                }

                await new Promise((resolve) => root.requestAnimationFrame(() => root.requestAnimationFrame(resolve)));
                previous.remove();
                next.classList.remove("tq-screen-preparing");
                stopLoader?.();
                loader.remove();
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.screenManager = Object.freeze({ createScreenManager, waitForVisualAssets });
})(globalThis);
