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

        const isSemantic = (element) =>
            Boolean(
                element?.closest?.(".tq-composition-runtime-layer")
                || element?.hasAttribute?.("data-tq-composition-slot")
            );

        const hideVisual = (element) => {
            if (!(element instanceof HTMLElement) || isSemantic(element)) return;
            element.dataset.tqCompositionLegacy = "true";
            element.style.setProperty("display", "none", "important");
            element.style.setProperty("visibility", "hidden", "important");
            element.style.setProperty("opacity", "0", "important");
            element.style.setProperty("pointer-events", "none", "important");
        };

        const legacyVisuals = new Set([
            ...screenRoot.querySelectorAll("img, picture, video, svg, canvas"),
            ...screenRoot.querySelectorAll(
                '[data-tq-dev-kind="asset"], [data-tq-dev-kind="overlay"], [data-tq-dev-kind="background"], ' +
                '[data-tq-asset-role="object"], [data-tq-asset-role="overlay"], [data-tq-asset-role="background"], ' +
                '.region-island-art-shell, .region-fallback-lock'
            )
        ]);

        legacyVisuals.forEach(hideVisual);

        [screenRoot, ...screenRoot.querySelectorAll("*")].forEach((element) => {
            if (isSemantic(element)) return;
            if (hasUrlBackground(element)) {
                element.dataset.tqCompositionLegacyBackground = "true";
                if (element instanceof HTMLElement) {
                    element.style.setProperty("background-image", "none", "important");
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
        if (binding?.activeVariantId) {
            element.dataset.tqCompositionVariant = binding.activeVariantId;
        }
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
        image.style.zIndex = String(TQ.content.screenComposition.defaultLayerForSemanticType(binding?.semanticType || slot.semanticType));
        image.style.pointerEvents = "none";
        image.style.userSelect = "none";
        return image;
    }

    function markFunction(element, screenType, canonicalAction) {
        const registry = TQ.content?.screenComposition;
        if (!(element instanceof Element) || !registry) return false;
        const fn = registry.getFunctionSlots(screenType)
            .find((item) => item.action === canonicalAction);
        if (!fn) return false;

        element.dataset.tqCompositionFunction = canonicalAction;
        element.dataset.tqDevId = fn.id;
        element.dataset.tqDevKind = "function";
        element.dataset.tqDevRole = "button";
        element.dataset.tqDevAction = canonicalAction;
        element.dataset.tqDevLabel = fn.label;
        return true;
    }

    function markDynamic(element, id, label, kind = "dynamicText") {
        if (!(element instanceof Element)) return;
        element.dataset.tqCompositionDynamic = id;
        element.dataset.tqDevId = id;
        element.dataset.tqDevKind = kind;
        element.dataset.tqDevLabel = label;
    }

    function decorateFunctions(screenRoot, screenType) {
        if (!(screenRoot instanceof Element)) return;

        if (screenType === "home") {
            const actionMap = {
                items: "items",
                play: "play",
                crew: "crew",
                shipyard: "shipyard",
                regions: "regions",
                daily: "daily-reward",
                shop: "shop",
                collection: "collectibles"
            };
            screenRoot.querySelectorAll("[data-action]").forEach((element) => {
                const canonical = actionMap[element.dataset.action];
                if (canonical) markFunction(element, screenType, canonical);
            });
            return;
        }

        if (screenType === "nautical-chart") {
            screenRoot.querySelectorAll("[data-action]").forEach((element) => {
                const action = element.dataset.action;
                if (["back", "previous-chart", "next-chart"].includes(action)) {
                    markFunction(element, screenType, action);
                }
            });
            screenRoot.querySelectorAll("[data-region-id]").forEach((element) => {
                markFunction(element, screenType, "open-region");
            });
            return;
        }

        if (screenType === "region-map") {
            const actionMap = {
                "back-regions": "back",
                "open-world-map": "open-nautical-chart",
                "open-ruby-shop": "open-merchant"
            };
            screenRoot.querySelectorAll("[data-action]").forEach((element) => {
                const canonical = actionMap[element.dataset.action];
                if (canonical) markFunction(element, screenType, canonical);
            });
            screenRoot.querySelectorAll("[data-island-id]").forEach((element) => {
                const islandId = Number(element.dataset.islandId);
                if (Number.isInteger(islandId) && islandId >= 1 && islandId <= 5) {
                    markFunction(element, screenType, "open-island-" + islandId);
                }
            });

            const builderIslands = [...screenRoot.querySelectorAll(
                '[data-builder-action-id][data-tq-dev-action="open_island"]'
            )];
            builderIslands.forEach((element, index) => {
                if (index < 5) markFunction(element, screenType, "open-island-" + (index + 1));
            });
            screenRoot.querySelectorAll('[data-builder-action-id][data-tq-dev-action="go_back"]')
                .forEach((element) => markFunction(element, screenType, "back"));
            screenRoot.querySelectorAll('[data-builder-action-id][data-tq-dev-action="open_world_map"]')
                .forEach((element) => markFunction(element, screenType, "open-nautical-chart"));
            screenRoot.querySelectorAll('[data-builder-action-id][data-tq-dev-action="open_merchant"]')
                .forEach((element) => markFunction(element, screenType, "open-merchant"));
            return;
        }

        if (screenType === "island-game") {
            [...screenRoot.querySelectorAll(".challenge-art-answer[data-answer]")]
                .slice(0, 4)
                .forEach((element, index) => {
                    markFunction(element, screenType, "answer-" + (index + 1));
                });
            screenRoot.querySelectorAll('[data-action="prepare-next"], [data-action="continue-feedback"]')
                .forEach((element) => markFunction(element, screenType, "continue"));

            const equation = screenRoot.querySelector(".tabuada-pergunta-numero");
            if (equation) {
                markDynamic(
                    equation,
                    "island-game.text.equation",
                    "Texto da conta",
                    "dynamicText"
                );
            }

            const correct = screenRoot.querySelector(".challenge-feedback-layer.is-correct");
            if (correct) {
                markDynamic(
                    correct,
                    "island-game.effect.correct",
                    "Área de efeito acerto",
                    "overlay"
                );
            }

            const wrong = screenRoot.querySelector(".challenge-feedback-layer.is-wrong");
            if (wrong) {
                markDynamic(
                    wrong,
                    "island-game.effect.wrong",
                    "Área de efeito erro",
                    "overlay"
                );
            }
        }
    }

    function mount(options = {}) {
        const registry = TQ.content?.screenComposition;
        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const screenId = String(options.screenId || "");
        const scopeId = String(options.scopeId || screenId);
        const screenType = registry?.resolveScreenType?.(screenId);
        const runtimeState = options.state || null;

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

        decorateFunctions(screenRoot, screenType);
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
                const localDraft = screenRoot.querySelector(
                    '.tq-dev-local-live-asset[data-tq-composition-slot="' + slot.id + '"]'
                );
                if (localDraft) return;

                let binding = bindings[slot.id];
                if (slot.bindingMode === "variants") {
                    const variants = Array.isArray(binding?.variants) ? binding.variants : [];
                    const preferredId = String(runtimeState?.ui?.homeBackgroundId || "");
                    const activeVariant = variants.find((variant) => variant.id === preferredId)
                        || variants.find((variant) => variant.id === "default")
                        || variants.find((variant) => variant.asset)
                        || variants[0]
                        || null;
                    binding = {
                        ...binding,
                        asset: activeVariant?.asset || null,
                        activeVariantId: activeVariant?.id || null,
                        activeVariantEffects: activeVariant?.effects || []
                    };
                }
                const image = createBoundImage(slot, binding);
                if (!image) return;
                image.style.pointerEvents = "none";
                layer.appendChild(image);
            });
            root.dispatchEvent(new CustomEvent("tq:composition-runtime-refreshed", {
                detail: { screenType, scopeId }
            }));
        }

        function onBindingChanged(event) {
            if (String(event.detail?.scopeId || "") !== scopeId) return;
            refresh();
        }

        root.addEventListener("tq:composition-binding-changed", onBindingChanged);
        refresh();

        return {
            active: true,
            screenType,
            scopeId,
            refresh,
            getSlots: () => registry.getAssetSlots(screenType),
            destroy() {
                root.removeEventListener("tq:composition-binding-changed", onBindingChanged);
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
        decorateFunctions,
        mount
    });
})(globalThis);
