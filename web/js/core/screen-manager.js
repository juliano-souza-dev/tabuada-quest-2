(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const FULL_BLEED_SOURCE_SELECTOR = [
        ":scope > .home-full-bleed-background",
        ".tq-canonical-stage [data-tq-asset-role='background']",
        ".world-map-art",
        ".region-islands-background",
        ".regions-map-image",
        ".challenge-art-background",
        ".result-art-background",
        ".pet-rescue-background",
        ".tavern-background"
    ].join(",");

    function disposeFullBleedBackdrop(screen) {
        try {
            screen?.__tqFullBleedObserver?.disconnect?.();
        } catch (_) {}
        if (screen) screen.__tqFullBleedObserver = null;
    }

    function ensureFullBleedBackdrop(screen) {
        if (!(screen instanceof Element)) return;
        if (!screen.querySelector(".tq-canonical-stage")) return;
        if (screen.querySelector(":scope > .tq-screen-full-bleed-backdrop")) return;

        const source = screen.querySelector(FULL_BLEED_SOURCE_SELECTOR);
        if (!(source instanceof HTMLImageElement)) return;

        const backdrop = document.createElement("img");
        backdrop.className = "tq-screen-full-bleed-backdrop";
        backdrop.alt = "";
        backdrop.setAttribute("aria-hidden", "true");

        function syncSource() {
            const nextSrc = source.currentSrc || source.src || source.getAttribute("src") || "";
            if (nextSrc && backdrop.src !== nextSrc) backdrop.src = nextSrc;
            const objectPosition = getComputedStyle(source).objectPosition;
            if (objectPosition) backdrop.style.objectPosition = objectPosition;
        }

        syncSource();
        screen.insertBefore(backdrop, screen.firstChild);

        const observer = new MutationObserver(() => {
            if (!screen.isConnected) {
                observer.disconnect();
                return;
            }
            syncSource();
        });
        observer.observe(source, {
            attributes: true,
            attributeFilter: ["src", "srcset", "style", "class"]
        });
        source.addEventListener("load", syncSource);

        screen.__tqFullBleedObserver = observer;
    }

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
                ensureFullBleedBackdrop(next);

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
                    disposeFullBleedBackdrop(next);
                    next.remove();
                    return;
                }

                await new Promise((resolve) => root.requestAnimationFrame(() => root.requestAnimationFrame(resolve)));
                disposeFullBleedBackdrop(previous);
                previous.remove();
                next.classList.remove("tq-screen-preparing");
                stopLoader?.();
                loader.remove();
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.screenManager = Object.freeze({
        createScreenManager,
        waitForVisualAssets,
        ensureFullBleedBackdrop
    });
})(globalThis);
