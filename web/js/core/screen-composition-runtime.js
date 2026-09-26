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

    function orphanLegacyPresentation(screenRoot) {
        if (!(screenRoot instanceof Element)) return;

        const functions = [...screenRoot.querySelectorAll("[data-tq-composition-function]")];
        const keep = new Set([screenRoot]);

        functions.forEach((fn) => {
            let current = fn;
            while (current && current !== screenRoot) {
                keep.add(current);
                current = current.parentElement;
            }
        });

        const dynamics = [...screenRoot.querySelectorAll("[data-tq-composition-dynamic]")];
        dynamics.forEach((dynamic) => {
            let current = dynamic;
            while (current && current !== screenRoot) {
                keep.add(current);
                current = current.parentElement;
            }
        });

        screenRoot
            .querySelectorAll(".tq-safe-visual-area, .tq-canonical-stage")
            .forEach((element) => {
                let current = element;
                while (current && current !== screenRoot) {
                    keep.add(current);
                    current = current.parentElement;
                }
            });

        screenRoot.dataset.tqOrphanSurface = "true";

        [...screenRoot.querySelectorAll("*")].forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            if (element.closest(".tq-composition-runtime-layer")) return;

            if (element.hasAttribute("data-tq-composition-dynamic")) {
                element.dataset.tqOrphanDynamic = "true";
                return;
            }

            if (element.hasAttribute("data-tq-composition-function")) {
                element.dataset.tqOrphanFunction = "true";
                element.style.setProperty("background", "transparent", "important");
                element.style.setProperty("background-image", "none", "important");
                element.style.setProperty("border-color", "transparent", "important");
                element.style.setProperty("box-shadow", "none", "important");
                element.style.setProperty("color", "transparent", "important");
                element.style.setProperty("text-shadow", "none", "important");
                return;
            }

            if (keep.has(element)) {
                element.dataset.tqOrphanStructure = "true";
                element.style.setProperty("background", "transparent", "important");
                element.style.setProperty("background-image", "none", "important");
                element.style.setProperty("border-color", "transparent", "important");
                element.style.setProperty("box-shadow", "none", "important");
                element.style.setProperty("color", "transparent", "important");
                element.style.setProperty("text-shadow", "none", "important");
                return;
            }

            element.dataset.tqOrphanLegacyChrome = "true";
            element.style.setProperty("display", "none", "important");
            element.style.setProperty("visibility", "hidden", "important");
            element.style.setProperty("opacity", "0", "important");
            element.style.setProperty("pointer-events", "none", "important");
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
        element.dataset.tqEditorFocusable = "true";
        element.tabIndex = -1;
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

    function createSlotElement(slot, binding, index = 0) {
        const element = document.createElement("div");
        element.className = "tq-composition-slot";
        decorateElement(element, slot, binding);
        element.dataset.tqSlotEmpty = binding?.asset ? "false" : "true";
        element.hidden = !binding?.asset;
        element.dataset.tqSlotIndex = String(index);
        element.style.position = "absolute";
        element.style.left = "0";
        element.style.top = "0";
        const fullSize = slot.semanticType === "ocean";
        element.style.width = fullSize ? "100%" : "120px";
        element.style.height = fullSize ? "100%" : "120px";
        element.style.zIndex = String(
            TQ.content.screenComposition.defaultLayerForSemanticType(
                binding?.semanticType || slot.semanticType
            )
        );
        element.style.pointerEvents = "none";
        element.style.userSelect = "none";
        return element;
    }

    function renderSlotVisual(slotElement, slot, binding, previewSrc = null) {
        if (!(slotElement instanceof HTMLElement)) return;
        slotElement.replaceChildren();
        const src = previewSrc || binding?.asset || null;
        slotElement.dataset.tqSlotEmpty = src ? "false" : "true";
        slotElement.hidden = !src;
        slotElement.dataset.tqSemanticType = binding?.semanticType || slot.semanticType;
        if (!src) return;

        const image = document.createElement("img");
        image.className = "tq-composition-bound-asset";
        image.src = src;
        image.alt = "";
        image.draggable = false;
        image.style.position = "absolute";
        image.style.inset = "0";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.maxWidth = "none";
        image.style.maxHeight = "none";
        image.style.objectFit = "contain";
        image.style.objectPosition = "center";
        image.style.pointerEvents = "none";
        image.style.userSelect = "none";
        slotElement.appendChild(image);
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
            const playerName = screenRoot.querySelector(".home-frame-text");
            if (playerName) markDynamic(playerName, "home.text.player-name", "Nome do jogador");
            const coins = screenRoot.querySelector(".wallet-value.coins");
            if (coins) markDynamic(coins, "home.text.coins", "Ouro");
            const gems = screenRoot.querySelector(".wallet-value.gems");
            if (gems) markDynamic(gems, "home.text.gems", "Gemas");
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

    function functionInstanceId(original, index) {
        const base = original.dataset.tqDevId
            || original.dataset.tqCompositionFunction
            || "function";
        const target = original.dataset.regionId
            || original.dataset.islandId
            || original.dataset.answer
            || original.dataset.builderActionId
            || original.dataset.action
            || (index + 1);
        return base + ".instance." + String(target);
    }

    function createEngineFunctionLayer(screenRoot) {
        const originals = [...screenRoot.querySelectorAll("[data-tq-composition-function]")];

        const canvas = document.createElement("div");
        canvas.className = "tq-engine-canvas tq-canonical-stage";
        canvas.dataset.tqEngineCanvas = "true";
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.overflow = "hidden";
        canvas.style.pointerEvents = "none";
        canvas.style.background = "transparent";

        const functionLayer = document.createElement("div");
        functionLayer.className = "tq-engine-function-layer";
        functionLayer.style.position = "absolute";
        functionLayer.style.inset = "0";
        functionLayer.style.pointerEvents = "none";
        canvas.appendChild(functionLayer);

        const proxies = [];

        originals.forEach((original, index) => {
            const proxy = document.createElement("button");
            const action = original.dataset.tqCompositionFunction || "";
            const label = original.dataset.tqDevLabel
                || original.getAttribute("aria-label")
                || action
                || ("Função " + (index + 1));
            const column = index % 3;
            const row = Math.floor(index / 3);

            proxy.type = "button";
            proxy.className = "tq-engine-function-proxy";
            proxy.dataset.tqEngineFunctionProxy = "true";
            proxy.dataset.tqCompositionFunction = action;
            proxy.dataset.tqDevId = functionInstanceId(original, index);
            proxy.dataset.tqEngineFunctionId = proxy.dataset.tqDevId;
            proxy.dataset.tqEngineFunctionType = original.dataset.tqDevId || action;
            proxy.dataset.tqDevKind = "function";
            proxy.dataset.tqDevRole = "button";
            proxy.dataset.tqDevAction = action;
            proxy.dataset.tqDevLabel = label;
            proxy.setAttribute("aria-label", label);
            proxy.disabled = Boolean(original.disabled);

            proxy.style.position = "absolute";
            proxy.style.left = (18 + column * 118) + "px";
            proxy.style.top = (18 + row * 82) + "px";
            proxy.style.width = "104px";
            proxy.style.height = "64px";
            proxy.style.margin = "0";
            proxy.style.padding = "0";
            proxy.style.border = "0";
            proxy.style.background = "transparent";
            proxy.style.color = "transparent";
            proxy.style.boxShadow = "none";
            proxy.style.pointerEvents = "auto";

            proxy.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (screenRoot.classList.contains("tq-dev-scene-editing")) return;
                if (original.disabled) return;

                original.click();
            });

            functionLayer.appendChild(proxy);
            proxies.push(proxy);
        });

        screenRoot.appendChild(canvas);

        const onBoundAssetClick = (event) => {
            if (screenRoot.classList.contains("tq-dev-scene-editing")) return;

            const asset = event.target.closest?.("[data-tq-bound-function-id]");
            if (!asset || !screenRoot.contains(asset)) return;

            const functionId = asset.dataset.tqBoundFunctionId;
            const proxy = proxies.find(
                (item) => item.dataset.tqDevId === functionId
            );

            if (!proxy || proxy.disabled) return;

            event.preventDefault();
            event.stopPropagation();
            proxy.click();
        };

        screenRoot.addEventListener("click", onBoundAssetClick, true);

        return {
            canvas,
            proxies,
            destroy() {
                screenRoot.removeEventListener("click", onBoundAssetClick, true);
                canvas.remove();
            }
        };
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
        screenRoot.dataset.tqEngineMode = "true";
        if (screenType === "home") {
            screenRoot.dataset.tqActiveHomeComposition = String(
                registry.resolveHomeBackgroundGroupId?.(
                    runtimeState?.ui?.homeBackgroundId || "default"
                ) || "default"
            );
        }
        screenRoot.classList.add("tq-composition-reset");

        decorateFunctions(screenRoot, screenType);
        hideLegacyVisuals(screenRoot);
        orphanLegacyPresentation(screenRoot);

        const engine = createEngineFunctionLayer(screenRoot);

        const assetLayer = document.createElement("div");
        assetLayer.className = "tq-engine-asset-layer";
        assetLayer.style.position = "absolute";
        assetLayer.style.inset = "0";
        assetLayer.style.pointerEvents = "none";
        assetLayer.style.overflow = "visible";
        engine.canvas.insertBefore(assetLayer, engine.canvas.firstChild);

        const slotElements = new Map();
        const slots = registry.getAssetSlots(screenType);

        function resolveBinding(slot, bindings) {
            const binding = bindings[slot.id] || {
                slotId: slot.id,
                semanticType: slot.semanticType,
                asset: null
            };

            if (screenType === "home") {
                const avatarId = String(runtimeState?.player?.avatarId || "sofia");
                const frameId = String(runtimeState?.player?.frameId || "");
                const level = Math.max(1, Math.min(10, Number(runtimeState?.progression?.level) || 1));
                let runtimeAsset = null;

                if (slot.id === "home.header.frame") {
                    runtimeAsset = TQ.content?.frames?.find?.((item) => item.id === frameId)?.asset
                        || TQ.content?.frames?.find?.((item) => item.isDefault)?.asset
                        || binding.asset;
                } else if (slot.id === "home.header.avatar") {
                    runtimeAsset = TQ.content?.assets?.avatars?.[avatarId]
                        || TQ.content?.assets?.avatars?.sofia
                        || binding.asset;
                } else if (slot.id === "home.header.level-plate") {
                    runtimeAsset = TQ.content?.levelBadges?.[level - 1] || binding.asset;
                } else if (slot.id === "home.character.avatar-full") {
                    runtimeAsset = TQ.content?.assets?.homeHeroes?.[avatarId]
                        || TQ.content?.assets?.homeHeroes?.sofia
                        || binding.asset;
                } else if (slot.id === "home.background.ship.1") {
                    const defaultShipId = TQ.content?.defaultShipId || "ship-colombo";
                    const equippedShipId = String(runtimeState?.shop?.equippedShipId || defaultShipId);
                    const ships = TQ.content?.shopCatalog?.ships || [];
                    const equippedShip = ships.find?.((item) => item.id === equippedShipId)
                        || ships.find?.((item) => item.id === defaultShipId)
                        || ships.find?.((item) => item.isDefault)
                        || ships[0]
                        || null;
                    runtimeAsset = equippedShip?.asset || binding.asset;
                    if (runtimeAsset) {
                        screenRoot.dataset.tqEquippedShipId = equippedShip?.id || defaultShipId;
                    }
                }

                if (runtimeAsset) {
                    return {
                        ...binding,
                        asset: runtimeAsset
                    };
                }
            }

            if (slot.bindingMode !== "variants") return binding;

            const preferredId = screenType === "home"
                ? registry.resolveHomeBackgroundGroupId?.(
                    runtimeState?.ui?.homeBackgroundId || "default"
                ) || "default"
                : "default";
            const variants = Array.isArray(binding.variants) ? binding.variants : [];
            const activeVariant = variants.find((variant) => variant.id === preferredId)
                || variants.find((variant) => variant.id === "default")
                || variants.find((variant) => variant.asset)
                || null;

            return {
                ...binding,
                asset: activeVariant?.asset || null,
                activeVariantId: activeVariant?.id || preferredId,
                activeVariantEffects: activeVariant?.effects || []
            };
        }

        slots.forEach((slot, index) => {
            const bindings = registry.readBindings(scopeId, screenType);
            const binding = resolveBinding(slot, bindings);
            const slotElement = createSlotElement(slot, binding, index);
            slotElements.set(slot.id, slotElement);
            assetLayer.appendChild(slotElement);
        });

        function refresh() {
            const bindings = registry.readBindings(scopeId, screenType);

            slots.forEach((slot) => {
                const slotElement = slotElements.get(slot.id);
                if (!(slotElement instanceof HTMLElement)) return;

                const binding = resolveBinding(slot, bindings);
                decorateElement(slotElement, slot, binding);
                slotElement.style.zIndex = String(
                    registry.defaultLayerForSemanticType(binding?.semanticType || slot.semanticType)
                );

                const localDraft = slotElement.querySelector(
                    ".tq-dev-local-live-asset[data-tq-local-persisted='true']"
                );

                if (localDraft instanceof HTMLImageElement) {
                    slotElement
                        .querySelectorAll(".tq-composition-bound-asset")
                        .forEach((image) => image.remove());
                    slotElement.dataset.tqSlotEmpty = "false";
                    slotElement.hidden = false;
                    slotElement.dataset.tqSemanticType = localDraft.dataset.tqSemanticType
                        || binding?.semanticType
                        || slot.semanticType;
                    return;
                }

                renderSlotVisual(slotElement, slot, binding);
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
            getSlots: () => slots,
            getSlotElement: (slotId) => slotElements.get(String(slotId || "")) || null,
            destroy() {
                root.removeEventListener("tq:composition-binding-changed", onBindingChanged);
                engine.destroy();
                screenRoot.classList.remove("tq-composition-reset");
                delete screenRoot.dataset.tqCompositionScreen;
                delete screenRoot.dataset.tqCompositionScope;
                delete screenRoot.dataset.tqEngineMode;
                delete screenRoot.dataset.tqActiveHomeComposition;
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.screenCompositionRuntime = Object.freeze({
        hideLegacyVisuals,
        decorateElement,
        decorateFunctions,
        orphanLegacyPresentation,
        createEngineFunctionLayer,
        createSlotElement,
        renderSlotVisual,
        mount
    });
})(globalThis);
