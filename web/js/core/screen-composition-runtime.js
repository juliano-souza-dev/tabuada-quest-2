(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function hasUrlBackground(element) {
        if (!(element instanceof Element)) return false;
        const computed = root.getComputedStyle(element);
        return String(computed.backgroundImage || "").includes("url(");
    }

    function clearInlineUrlProperties(element) {
        if (!(element instanceof HTMLElement)) return;
        const names = [];
        for (let index = 0; index < element.style.length; index += 1) {
            names.push(element.style[index]);
        }
        names.forEach((name) => {
            const value = element.style.getPropertyValue(name);
            if (String(value || "").includes("url(")) {
                element.style.setProperty(name, "none");
            }
        });
    }

    function hideLegacyVisuals(screenRoot) {
        if (!(screenRoot instanceof Element)) return;

        const visuals = [
            ...screenRoot.querySelectorAll("img, picture, video, svg")
        ];

        visuals.forEach((element) => {
            if (element.closest(".tq-composition-runtime-layer")) return;
            if (element.hasAttribute("data-tq-composition-slot")) return;
            element.dataset.tqCompositionLegacy = "true";
            element.style.visibility = "hidden";
            element.style.pointerEvents = "none";
        });

        [screenRoot, ...screenRoot.querySelectorAll("*")].forEach((element) => {
            if (element.closest?.(".tq-composition-runtime-layer")) return;
            if (element.hasAttribute?.("data-tq-composition-slot")) return;
            if (hasUrlBackground(element)) {
                element.dataset.tqCompositionLegacyBackground = "true";
                if (element instanceof HTMLElement) {
                    element.style.backgroundImage = "none";
                }
            }
            clearInlineUrlProperties(element);
        });
    }

    function stageFor(screenRoot) {
        return screenRoot.querySelector(".tq-canonical-stage")
            || screenRoot.querySelector(".tq-safe-visual-area")
            || screenRoot;
    }

    function decorateElement(element, slot, binding) {
        element.dataset.tqCompositionSlot = slot.id;
        element.dataset.tqSemanticType = binding?.semanticType || slot.semanticType;
        element.dataset.tqDevId = slot.id;
        element.dataset.tqDevKind = "asset";
        element.dataset.tqDevRole = "object";
        element.dataset.tqDevLabel = slot.label;
        element.dataset.tqAssetId = slot.id;
        element.dataset.tqAssetRole = "object";
        element.dataset.tqAssetLabel = slot.label;
        if (slot.pairId) {
            element.dataset.tqPairId = slot.pairId;
            element.dataset.tqPairState = slot.pairState || "";
        }
        if (slot.action) element.dataset.tqCompositionAction = slot.action;
        return element;
    }

    function createBoundImage(slot, binding) {
        if (!binding?.asset) return null;
        const image = document.createElement("img");
        image.className = "tq-composition-bound-asset";
        decorateElement(image, slot, binding);
        image.src = binding.asset;
        image.alt = "";
        image.draggable = false;
        image.style.position = "absolute";
        image.style.left = "30%";
        image.style.top = "28%";
        image.style.width = "40%";
        image.style.height = "auto";
        image.style.maxWidth = "none";
        image.style.maxHeight = "70%";
        image.style.objectFit = "contain";
        image.style.objectPosition = "center";
        image.style.zIndex = "20";
        image.style.pointerEvents = "auto";
        image.style.userSelect = "none";
        return image;
    }

    function mount(options = {}) {
        const registry = TQ.content?.screenComposition;
        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const screenId = String(options.screenId || "");
        const scopeId = String(options.scopeId || screenId);
        const screenType = registry?.resolveScreenType?.(screenId);

        if (!registry || !screenRoot || !screenType) {
            return {
                active: false,
                screenType: null,
                refresh: () => {},
                getSlots: () => [],
                destroy: () => {}
            };
        }

        screenRoot.dataset.tqCompositionScreen = screenType;
        screenRoot.dataset.tqCompositionScope = scopeId;
        screenRoot.classList.add("tq-composition-reset");

        hideLegacyVisuals(screenRoot);

        const stage = stageFor(screenRoot);
        if (root.getComputedStyle(stage).position === "static") {
            stage.style.position = "relative";
        }

        const layer = document.createElement("div");
        layer.className = "tq-composition-runtime-layer";
        layer.dataset.tqDevIgnore = "true";
        layer.setAttribute("aria-hidden", "true");
        layer.style.position = "absolute";
        layer.style.inset = "0";
        layer.style.zIndex = "2";
        layer.style.pointerEvents = "none";
        stage.appendChild(layer);

        function refresh() {
            layer.replaceChildren();
            const bindings = registry.readBindings(scopeId, screenType);
            registry.getAssetSlots(screenType).forEach((slot) => {
                const binding = bindings[slot.id];
                const image = createBoundImage(slot, binding);
                if (!image) return;
                image.style.pointerEvents = "auto";
                layer.appendChild(image);
            });
            root.dispatchEvent(new CustomEvent("tq:composition-runtime-refreshed", {
                detail: { screenType, scopeId }
            }));
        }

        refresh();

        return {
            active: true,
            screenType,
            scopeId,
            refresh,
            getSlots: () => registry.getAssetSlots(screenType),
            destroy() {
                layer.remove();
                screenRoot.classList.remove("tq-composition-reset");
                delete screenRoot.dataset.tqCompositionScreen;
                delete screenRoot.dataset.tqCompositionScope;
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.screenCompositionRuntime = Object.freeze({
        hideLegacyVisuals,
        decorateElement,
        mount
    });
})(globalThis);
