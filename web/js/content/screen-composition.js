(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.composition-bindings.v1";
    const SCHEMA_VERSION = 1;

    const SEMANTIC_TYPES = Object.freeze({
        frame: Object.freeze({ label: "Placa / moldura", fx: Object.freeze([]) }),
        avatar: Object.freeze({ label: "Avatar", fx: Object.freeze([]) }),
        logo: Object.freeze({ label: "Logo", fx: Object.freeze([]) }),
        home_background: Object.freeze({
            label: "Fundo da Home",
            fx: Object.freeze(["depth", "parallax", "background-animation"])
        }),
        ui_button: Object.freeze({ label: "Botão visual", fx: Object.freeze([]) }),
        ocean: Object.freeze({ label: "Oceano", fx: Object.freeze(["ocean"]) }),
        island_state: Object.freeze({
            label: "Ilha",
            fx: Object.freeze(["depth", "parallax"])
        }),
        cloud: Object.freeze({
            label: "Nuvem",
            fx: Object.freeze(["depth", "parallax"])
        }),
        environment: Object.freeze({
            label: "Cenário / edifício",
            fx: Object.freeze(["depth", "parallax"])
        }),
        ship: Object.freeze({
            label: "Navio",
            fx: Object.freeze(["depth", "parallax", "ship-rock"])
        }),
        island_background: Object.freeze({
            label: "Ilha ao fundo",
            fx: Object.freeze(["depth", "parallax"])
        }),
        pier: Object.freeze({
            label: "Pier",
            fx: Object.freeze(["depth", "parallax"])
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

    const homeSlots = Object.freeze([
        assetSlot("home.header.frame", "Placa moldura", "frame", { required: true, group: "header" }),
        assetSlot("home.header.avatar", "Avatar", "avatar", { required: true, group: "header" }),
        assetSlot("home.header.logo", "Logo", "logo", { required: true, group: "header" }),
        assetSlot("home.background.main", "Fundo da Home", "home_background", { required: true, group: "background" }),

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
    regionSlots.push(...repeatedAssets("regions.environment", "Cenário", "environment", 10, {
        group: "environment",
        acceptedTypes: ["environment", "ship"]
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
        regions: Object.freeze({
            id: "regions",
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
        islands: "regions",
        challenge: "island-game"
    });

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function resolveScreenType(screenId) {
        const id = String(screenId || "");
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

    function allowedFxForSlot(screenId, slotId, semanticTypeOverride = null) {
        const slot = getSlot(screenId, slotId);
        const semanticType = semanticTypeOverride || slot?.semanticType;
        return allowedFxForSemanticType(semanticType);
    }

    function screenAllowsFx(screenId, fxId) {
        const wanted = String(fxId || "");
        return getAssetSlots(screenId).some((slot) =>
            allowedFxForSemanticType(slot.semanticType).includes(wanted)
            || (slot.acceptedTypes || []).some((type) => allowedFxForSemanticType(type).includes(wanted))
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
            asset: null
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
            result[slot.id] = {
                slotId: slot.id,
                semanticType,
                asset: typeof current?.asset === "string" && current.asset.trim()
                    ? current.asset.trim()
                    : null
            };
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

    function setSemanticType(scopeId, screenId, slotId, semanticType) {
        const current = readBinding(scopeId, screenId, slotId);
        if (!current) return null;
        return bindAsset(scopeId, screenId, slotId, current.asset, semanticType);
    }

    function unbindAsset(scopeId, screenId, slotId) {
        return bindAsset(scopeId, screenId, slotId, null);
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

    TQ.content = TQ.content || {};
    TQ.content.screenComposition = Object.freeze({
        STORAGE_KEY,
        SCHEMA_VERSION,
        SEMANTIC_TYPES,
        SCREENS,
        SCREEN_ALIASES,
        resolveScreenType,
        getScreen,
        getAssetSlots,
        getFunctionSlots,
        getDynamicSlots,
        getSlot,
        getPair,
        allowedFunctionActions,
        allowedFxForSemanticType,
        allowedFxForSlot,
        screenAllowsFx,
        readBindings,
        readBinding,
        bindAsset,
        setSemanticType,
        unbindAsset,
        resetScope,
        resetAll,
        describeSlot
    });
})(globalThis);
