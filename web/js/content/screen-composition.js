(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.composition-bindings.v2";
    const SCHEMA_VERSION = 2;
    const FX_LABELS = Object.freeze({
        ocean: "Mar",
        depth: "Profundidade",
        "ship-rock": "Balanço do navio",
        "background-animation": "Animações do fundo"
    });

    const SEMANTIC_TYPES = Object.freeze({
        frame: Object.freeze({ label: "Placa / moldura", fx: Object.freeze([]), defaultZ: 40 }),
        avatar: Object.freeze({ label: "Avatar", fx: Object.freeze([]), defaultZ: 41 }),
        logo: Object.freeze({ label: "Logo", fx: Object.freeze([]), defaultZ: 42 }),
        home_background: Object.freeze({
            label: "Composição do fundo",
            fx: Object.freeze([]),
            defaultZ: 1
        }),
        home_backdrop: Object.freeze({
            label: "Fundo base / céu",
            fx: Object.freeze(["depth", "background-animation"]),
            depthRoles: Object.freeze(["sky", "custom"]),
            defaultZ: 1
        }),
        ui_button: Object.freeze({ label: "Botão visual", fx: Object.freeze([]), defaultZ: 30 }),
        ocean: Object.freeze({ label: "Oceano", fx: Object.freeze(["ocean"]), defaultZ: 1 }),
        island_state: Object.freeze({
            label: "Ilha",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["world", "custom"]),
            defaultZ: 20
        }),
        cloud: Object.freeze({
            label: "Nuvem",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["cloudFar", "cloudNear"]),
            defaultZ: 12
        }),
        environment: Object.freeze({
            label: "Cenário / edifício",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["world", "custom"]),
            defaultZ: 22
        }),
        ship: Object.freeze({
            label: "Navio",
            fx: Object.freeze(["depth", "ship-rock"]),
            depthRoles: Object.freeze(["ship"]),
            defaultZ: 24
        }),
        island: Object.freeze({
            label: "Ilha",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["world", "custom"]),
            defaultZ: 20
        }),
        island_background: Object.freeze({
            label: "Ilha ao fundo",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["world", "custom"]),
            defaultZ: 10
        }),
        pier: Object.freeze({
            label: "Pier",
            fx: Object.freeze(["depth"]),
            depthRoles: Object.freeze(["world", "custom"]),
            defaultZ: 25
        })
    });

    function assetSlot(id, label, semanticType, options = {}) {
        return Object.freeze({
            id,
            label,
            kind: "asset",
            semanticType,
            acceptedTypes: Object.freeze(options.acceptedTypes || [semanticType]),
            required: Boolean(options.required),
            action: options.action || null,
            pairId: options.pairId || null,
            pairState: options.pairState || null,
            group: options.group || null,
            compositionId: options.compositionId || null,
            bindingMode: options.bindingMode === "variants" ? "variants" : "single",
            fxPerVariant: Boolean(options.fxPerVariant),
            asset: null
        });
    }

    function functionSlot(id, label, action, options = {}) {
        return Object.freeze({
            id,
            label,
            kind: "function",
            action,
            required: options.required !== false,
            group: options.group || null
        });
    }

    function repeatedAssets(prefix, label, semanticType, count, options = {}) {
        return Array.from({ length: count }, (_, index) =>
            assetSlot(
                prefix + "." + (index + 1),
                label + " " + (index + 1),
                semanticType,
                { ...options, required: false }
            )
        );
    }

    const HOME_BACKGROUND_COMPOSITION_ID = "home.background.composition";
    const homeBackgroundPart = (id, label, semanticType, options = {}) =>
        assetSlot(id, label, semanticType, {
            ...options,
            group: options.group || "background-composition",
            compositionId: HOME_BACKGROUND_COMPOSITION_ID,
            bindingMode: "variants",
            fxPerVariant: true
        });

    const homeSlots = Object.freeze([
        assetSlot("home.header.frame", "Placa moldura", "frame", { required: true, group: "header" }),
        assetSlot("home.header.avatar", "Avatar", "avatar", { required: true, group: "header" }),
        assetSlot("home.header.logo", "Logo", "logo", { required: true, group: "header" }),

        homeBackgroundPart("home.background.ocean", "Oceano", "ocean", { required: true }),
        ...Array.from({ length: 10 }, (_, index) =>
            homeBackgroundPart(
                "home.background.cloud." + (index + 1),
                "Nuvem " + (index + 1),
                "cloud",
                { group: "background-clouds" }
            )
        ),
        ...Array.from({ length: 5 }, (_, index) =>
            homeBackgroundPart(
                "home.background.ship." + (index + 1),
                "Navio " + (index + 1),
                "ship",
                { group: "background-ships" }
            )
        ),
        ...Array.from({ length: 3 }, (_, index) =>
            homeBackgroundPart(
                "home.background.island." + (index + 1),
                "Ilha " + (index + 1),
                "island",
                { group: "background-islands" }
            )
        ),

        assetSlot("home.button.shipyard", "Estaleiro", "ui_button", { required: true, action: "shipyard", group: "buttons" }),
        assetSlot("home.button.collectibles", "Colecionáveis", "ui_button", { required: true, action: "collectibles", group: "buttons" }),
        assetSlot("home.button.crew", "Tripulação", "ui_button", { required: true, action: "crew", group: "buttons" }),
        assetSlot("home.button.shop", "Loja", "ui_button", { required: true, action: "shop", group: "buttons" }),
        assetSlot("home.button.items", "Baú de itens", "ui_button", { required: true, action: "items", group: "buttons" }),
        assetSlot("home.button.daily-reward", "Recompensa diária", "ui_button", { required: true, action: "daily-reward", group: "buttons" }),
        assetSlot("home.button.regions", "Regiões", "ui_button", { required: true, action: "regions", group: "buttons" }),
        assetSlot("home.button.play", "Jogar", "ui_button", { required: true, action: "play", group: "buttons" })
    ]);

    const nauticalSlots = Object.freeze([
        assetSlot("nautical.button.back", "Botão voltar", "ui_button", { required: true, action: "back" }),
        assetSlot("nautical.button.next", "Seta avançar", "ui_button", { required: true, action: "next-chart" }),
        assetSlot("nautical.button.previous", "Seta retroceder", "ui_button", { required: true, action: "previous-chart" })
    ]);

    const regionSlots = [];
    regionSlots.push(
        assetSlot("regions.ocean", "Background oceano", "ocean", { required: true, group: "background" }),
        assetSlot("regions.button.back", "Botão voltar", "ui_button", { required: true, action: "back", group: "navigation" }),
        assetSlot("regions.button.nautical-chart", "Mapa mundi", "ui_button", { required: true, action: "open-nautical-chart", group: "navigation" })
    );
    for (let island = 1; island <= 5; island += 1) {
        const pairId = "regions.island." + island;
        regionSlots.push(
            assetSlot(pairId + ".locked", "Ilha " + island + " bloqueada", "island_state", {
                required: true,
                action: "open-island-" + island,
                pairId,
                pairState: "locked",
                group: "islands"
            }),
            assetSlot(pairId + ".unlocked", "Ilha " + island + " desbloqueada", "island_state", {
                required: true,
                action: "open-island-" + island,
                pairId,
                pairState: "unlocked",
                group: "islands"
            })
        );
    }
    regionSlots.push(...repeatedAssets("regions.cloud", "Nuvem", "cloud", 10, { group: "clouds" }));
    regionSlots.push(...repeatedAssets("regions.environment", "Elemento de ambiente", "environment", 10, {
        group: "environment",
        acceptedTypes: ["environment", "island"]
    }));

    const islandGameSlots = Object.freeze([
        assetSlot("island-game.ocean", "Oceano", "ocean", { required: true, group: "background" }),
        ...repeatedAssets("island-game.cloud", "Nuvem", "cloud", 10, { group: "clouds" }),
        assetSlot("island-game.island-background", "Ilha ao fundo", "island_background", { required: true }),
        assetSlot("island-game.pier", "Pier", "pier", { required: true })
    ]);

    const SCREENS = Object.freeze({
        home: Object.freeze({
            id: "home",
            label: "Home",
            assets: homeSlots,
            compositions: Object.freeze([
                Object.freeze({
                    id: HOME_BACKGROUND_COMPOSITION_ID,
                    label: "Fundo da Home",
                    equipStatePath: "ui.homeBackgroundId",
                    memberGroup: "background-composition"
                })
            ]),
            functions: Object.freeze([
                functionSlot("home.fn.shipyard", "Abrir estaleiro", "shipyard"),
                functionSlot("home.fn.collectibles", "Abrir colecionáveis", "collectibles"),
                functionSlot("home.fn.crew", "Abrir tripulação", "crew"),
                functionSlot("home.fn.shop", "Abrir loja", "shop"),
                functionSlot("home.fn.items", "Abrir baú de itens", "items"),
                functionSlot("home.fn.daily-reward", "Abrir recompensa diária", "daily-reward"),
                functionSlot("home.fn.regions", "Abrir regiões", "regions"),
                functionSlot("home.fn.play", "Jogar", "play")
            ]),
            dynamic: Object.freeze([])
        }),
        "nautical-chart": Object.freeze({
            id: "nautical-chart",
            label: "Carta náutica",
            assets: nauticalSlots,
            functions: Object.freeze([
                functionSlot("nautical.fn.back", "Voltar", "back"),
                functionSlot("nautical.fn.next", "Avançar carta", "next-chart"),
                functionSlot("nautical.fn.previous", "Retroceder carta", "previous-chart"),
                functionSlot("nautical.fn.open-region", "Abrir região", "open-region")
            ]),
            dynamic: Object.freeze([])
        }),
        "region-map": Object.freeze({
            id: "region-map",
            label: "Região",
            assets: Object.freeze(regionSlots),
            functions: Object.freeze([
                functionSlot("regions.fn.back", "Voltar", "back"),
                functionSlot("regions.fn.nautical-chart", "Abrir carta náutica", "open-nautical-chart"),
                ...Array.from({ length: 5 }, (_, index) =>
                    functionSlot(
                        "regions.fn.island." + (index + 1),
                        "Abrir Ilha " + (index + 1),
                        "open-island-" + (index + 1)
                    )
                ),
                functionSlot("regions.fn.merchant", "Abrir navio mercador", "open-merchant", { required: false })
            ]),
            dynamic: Object.freeze([])
        }),
        "island-game": Object.freeze({
            id: "island-game",
            label: "Ilha · jogo",
            assets: islandGameSlots,
            functions: Object.freeze([
                functionSlot("island-game.fn.answer.1", "Alternativa 1", "answer-1"),
                functionSlot("island-game.fn.answer.2", "Alternativa 2", "answer-2"),
                functionSlot("island-game.fn.answer.3", "Alternativa 3", "answer-3"),
                functionSlot("island-game.fn.answer.4", "Alternativa 4", "answer-4"),
                functionSlot("island-game.fn.continue", "Continuar", "continue")
            ]),
            dynamic: Object.freeze([
                Object.freeze({ id: "island-game.text.equation", label: "Texto da conta", kind: "dynamicText" }),
                Object.freeze({ id: "island-game.effect.correct", label: "Área de efeito acerto", kind: "effect", effect: "correct" }),
                Object.freeze({ id: "island-game.effect.wrong", label: "Área de efeito erro", kind: "effect", effect: "wrong" })
            ])
        })
    });

    const SCREEN_ALIASES = Object.freeze({
        home: "home",
        "world-map": "nautical-chart",
        regions: "nautical-chart",
        "development-regions": "nautical-chart",
        islands: "region-map",
        challenge: "island-game"
    });

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function resolveScreenType(screenId) {
        const id = String(screenId || "");
        if (id.startsWith("region-builder.")) return "region-map";
        return SCREEN_ALIASES[id] || (SCREENS[id] ? id : null);
    }

    function getScreen(screenId) {
        const type = resolveScreenType(screenId);
        return type ? SCREENS[type] || null : null;
    }

    function getAssetSlots(screenId) {
        return getScreen(screenId)?.assets || [];
    }

    function getFunctionSlots(screenId) {
        return getScreen(screenId)?.functions || [];
    }

    function getDynamicSlots(screenId) {
        return getScreen(screenId)?.dynamic || [];
    }

    function getCompositions(screenId) {
        return getScreen(screenId)?.compositions || [];
    }

    function getComposition(screenId, compositionId) {
        return getCompositions(screenId)
            .find((item) => item.id === String(compositionId || "")) || null;
    }

    function getSlot(screenId, slotId) {
        return getAssetSlots(screenId).find((slot) => slot.id === String(slotId || "")) || null;
    }

    function getPair(screenId, pairId) {
        return getAssetSlots(screenId).filter((slot) => slot.pairId && slot.pairId === pairId);
    }

    function allowedFunctionActions(screenId) {
        return Object.freeze(getFunctionSlots(screenId).map((item) => item.action));
    }

    function allowedFxForSemanticType(semanticType) {
        return SEMANTIC_TYPES[semanticType]?.fx || Object.freeze([]);
    }

    function fxLabel(fxId) {
        return FX_LABELS[fxId] || String(fxId || "");
    }

    function defaultLayerForSemanticType(semanticType) {
        return Number(SEMANTIC_TYPES[semanticType]?.defaultZ) || 1;
    }

    function depthRolesForSemanticType(semanticType) {
        return SEMANTIC_TYPES[semanticType]?.depthRoles || Object.freeze([]);
    }

    function allowedFxForSlot(screenId, slotId, semanticTypeOverride = null) {
        const slot = getSlot(screenId, slotId);
        const semanticType = semanticTypeOverride || slot?.semanticType;
        return allowedFxForSemanticType(semanticType);
    }

    function screenAllowsFx(screenId, fxId) {
        const wanted = String(fxId || "");
        return getAssetSlots(screenId).some((slot) =>
            allowedFxForSemanticType(slot.semanticType).includes(wanted)
            || (slot.acceptedTypes || []).some((type) =>
                allowedFxForSemanticType(type).includes(wanted)
            )
        );
    }

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return {
                version: SCHEMA_VERSION,
                scopes: parsed?.scopes && typeof parsed.scopes === "object" ? parsed.scopes : {}
            };
        } catch (_) {
            return { version: SCHEMA_VERSION, scopes: {} };
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: SCHEMA_VERSION,
            scopes: store?.scopes && typeof store.scopes === "object" ? store.scopes : {}
        }));
    }

    function emptyBinding(slot) {
        return {
            slotId: slot.id,
            semanticType: slot.semanticType,
            asset: null,
            ...(slot.bindingMode === "variants" ? { variants: [] } : {})
        };
    }

    function readBindings(scopeId, screenId) {
        const scope = String(scopeId || "");
        const stored = readStore().scopes[scope]?.bindings || {};
        const result = {};
        getAssetSlots(screenId).forEach((slot) => {
            const current = stored[slot.id];
            const semanticType = slot.acceptedTypes.includes(current?.semanticType)
                ? current.semanticType
                : slot.semanticType;
            const baseBinding = {
                slotId: slot.id,
                semanticType,
                asset: typeof current?.asset === "string" && current.asset.trim()
                    ? current.asset.trim()
                    : null
            };
            if (slot.bindingMode === "variants") {
                baseBinding.variants = (Array.isArray(current?.variants) ? current.variants : [])
                    .filter((variant) => variant && typeof variant === "object" && String(variant.id || "").trim())
                    .map((variant) => ({
                        id: String(variant.id).trim(),
                        label: String(variant.label || variant.id).trim(),
                        asset: typeof variant.asset === "string" && variant.asset.trim()
                            ? variant.asset.trim()
                            : null,
                        effects: Array.isArray(variant.effects) ? clone(variant.effects) : []
                    }));
            }
            result[slot.id] = baseBinding;
        });
        return result;
    }

    function readBinding(scopeId, screenId, slotId) {
        const slot = getSlot(screenId, slotId);
        if (!slot) return null;
        return readBindings(scopeId, screenId)[slot.id] || emptyBinding(slot);
    }

    function bindAsset(scopeId, screenId, slotId, asset, semanticType = null) {
        const slot = getSlot(screenId, slotId);
        if (!slot) return null;
        const type = slot.acceptedTypes.includes(semanticType) ? semanticType : slot.semanticType;

        if (slot.bindingMode === "variants") {
            return bindVariant(
                scopeId,
                screenId,
                slotId,
                "default",
                asset,
                { label: "Padrão", semanticType: type }
            );
        }

        const store = readStore();
        const scope = String(scopeId || "");
        store.scopes[scope] = store.scopes[scope] || { screenType: resolveScreenType(screenId), bindings: {} };
        store.scopes[scope].screenType = resolveScreenType(screenId);
        store.scopes[scope].bindings = store.scopes[scope].bindings || {};
        store.scopes[scope].bindings[slot.id] = {
            slotId: slot.id,
            semanticType: type,
            asset: typeof asset === "string" && asset.trim() ? asset.trim() : null
        };
        writeStore(store);
        return clone(store.scopes[scope].bindings[slot.id]);
    }

    function bindVariant(scopeId, screenId, slotId, variantId, asset, options = {}) {
        const slot = getSlot(screenId, slotId);
        if (!slot || slot.bindingMode !== "variants") return null;

        const id = String(variantId || "default").trim() || "default";
        const current = readBinding(scopeId, screenId, slot.id) || emptyBinding(slot);
        const semanticType = slot.acceptedTypes.includes(options.semanticType)
            ? options.semanticType
            : current.semanticType || slot.semanticType;
        const variants = (current.variants || []).filter((variant) => variant.id !== id);
        variants.push({
            id,
            label: String(options.label || id).trim() || id,
            asset: typeof asset === "string" && asset.trim() ? asset.trim() : null,
            effects: Array.isArray(options.effects) ? clone(options.effects) : []
        });

        const store = readStore();
        const scope = String(scopeId || "");
        store.scopes[scope] = store.scopes[scope] || { screenType: resolveScreenType(screenId), bindings: {} };
        store.scopes[scope].screenType = resolveScreenType(screenId);
        store.scopes[scope].bindings = store.scopes[scope].bindings || {};
        store.scopes[scope].bindings[slot.id] = {
            slotId: slot.id,
            semanticType,
            asset: null,
            variants
        };
        writeStore(store);
        return clone(store.scopes[scope].bindings[slot.id]);
    }

    function setSemanticType(scopeId, screenId, slotId, semanticType) {
        const slot = getSlot(screenId, slotId);
        const current = readBinding(scopeId, screenId, slotId);
        if (!slot || !current) return null;
        const type = slot.acceptedTypes.includes(semanticType) ? semanticType : slot.semanticType;

        if (slot.bindingMode === "variants") {
            const store = readStore();
            const scope = String(scopeId || "");
            store.scopes[scope] = store.scopes[scope] || { screenType: resolveScreenType(screenId), bindings: {} };
            store.scopes[scope].bindings = store.scopes[scope].bindings || {};
            store.scopes[scope].bindings[slot.id] = {
                ...current,
                semanticType: type
            };
            writeStore(store);
            return clone(store.scopes[scope].bindings[slot.id]);
        }
        return bindAsset(scopeId, screenId, slotId, current.asset, type);
    }

    function unbindAsset(scopeId, screenId, slotId) {
        const slot = getSlot(screenId, slotId);
        if (!slot) return null;
        if (slot.bindingMode === "variants") {
            const store = readStore();
            const scope = String(scopeId || "");
            store.scopes[scope] = store.scopes[scope] || { screenType: resolveScreenType(screenId), bindings: {} };
            store.scopes[scope].bindings = store.scopes[scope].bindings || {};
            store.scopes[scope].bindings[slot.id] = emptyBinding(slot);
            writeStore(store);
            return clone(store.scopes[scope].bindings[slot.id]);
        }
        return bindAsset(scopeId, screenId, slotId, null);
    }

    function unbindVariant(scopeId, screenId, slotId, variantId) {
        const slot = getSlot(screenId, slotId);
        if (!slot || slot.bindingMode !== "variants") return null;

        const id = String(variantId || "default").trim() || "default";
        const current = readBinding(scopeId, screenId, slot.id) || emptyBinding(slot);
        const store = readStore();
        const scope = String(scopeId || "");
        store.scopes[scope] = store.scopes[scope] || { screenType: resolveScreenType(screenId), bindings: {} };
        store.scopes[scope].bindings = store.scopes[scope].bindings || {};
        store.scopes[scope].bindings[slot.id] = {
            slotId: slot.id,
            semanticType: current.semanticType || slot.semanticType,
            asset: null,
            variants: (current.variants || []).filter((variant) => variant.id !== id)
        };
        writeStore(store);
        return clone(store.scopes[scope].bindings[slot.id]);
    }

    function resetScope(scopeId, screenId) {
        const scope = String(scopeId || "");
        const store = readStore();
        store.scopes[scope] = {
            screenType: resolveScreenType(screenId),
            bindings: Object.fromEntries(
                getAssetSlots(screenId).map((slot) => [slot.id, emptyBinding(slot)])
            )
        };
        writeStore(store);
        return readBindings(scope, screenId);
    }

    function resetScopeVariant(scopeId, screenId, variantId = null) {
        const scope = String(scopeId || "");
        const store = readStore();
        const screenType = resolveScreenType(screenId);
        const slots = getAssetSlots(screenId);
        const currentBindings = store.scopes[scope]?.bindings || {};
        const wantedVariant = variantId === null ? null : (String(variantId || "default").trim() || "default");

        const nextBindings = Object.fromEntries(slots.map((slot) => {
            if (slot.bindingMode !== "variants" || wantedVariant === null) {
                return [slot.id, emptyBinding(slot)];
            }

            const current = currentBindings[slot.id] || emptyBinding(slot);
            return [slot.id, {
                slotId: slot.id,
                semanticType: current.semanticType || slot.semanticType,
                asset: null,
                variants: (current.variants || []).filter((variant) => variant.id !== wantedVariant)
            }];
        }));

        store.scopes[scope] = {
            screenType,
            bindings: nextBindings
        };
        writeStore(store);
        return readBindings(scope, screenId);
    }

    function resetAll() {
        writeStore({ version: SCHEMA_VERSION, scopes: {} });
    }

    function describeSlot(screenId, scopeId, slotId) {
        const slot = getSlot(screenId, slotId);
        if (!slot) return null;
        const binding = readBinding(scopeId, screenId, slotId);
        return {
            ...clone(slot),
            binding,
            fx: [...allowedFxForSemanticType(binding.semanticType)]
        };
    }

    const screenComposition = Object.freeze({
        STORAGE_KEY,
        SCHEMA_VERSION,
        SEMANTIC_TYPES,
        FX_LABELS,
        SCREENS,
        SCREEN_ALIASES,
        resolveScreenType,
        getScreen,
        getAssetSlots,
        getFunctionSlots,
        getDynamicSlots,
        getCompositions,
        getComposition,
        getSlot,
        getPair,
        allowedFunctionActions,
        allowedFxForSemanticType,
        fxLabel,
        defaultLayerForSemanticType,
        depthRolesForSemanticType,
        allowedFxForSlot,
        screenAllowsFx,
        readBindings,
        readBinding,
        bindAsset,
        bindVariant,
        setSemanticType,
        unbindAsset,
        unbindVariant,
        resetScope,
        resetScopeVariant,
        resetAll,
        describeSlot
    });

    TQ.content = Object.freeze({
        ...(TQ.content || {}),
        screenComposition
    });
})(globalThis);
