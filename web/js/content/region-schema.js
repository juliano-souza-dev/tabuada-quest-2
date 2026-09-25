(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const SCHEMA_VERSION = 1;
    const ISLANDS_PER_REGION = 5;
    const OPTIONAL_ACTIONS = Object.freeze([
        Object.freeze({ type: "open_merchant", label: "Navio mercador" }),
        Object.freeze({ type: "go_home", label: "Home" }),
        Object.freeze({ type: "go_back", label: "Voltar" }),
        Object.freeze({ type: "open_world_map", label: "Mapa Mundo" })
    ]);
    const REWARD_TYPES = Object.freeze([
        "ruby",
        "pet",
        "chest",
        "map_fragment",
        "coins",
        "gems",
        "item",
        "collectible"
    ]);

    function slugify(value, fallback = "nova-regiao") {
        const slug = String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return slug || fallback;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function islandId(regionId, order) {
        return regionId + "-island-" + order;
    }

    function islandActionId(regionId, order) {
        return regionId + "-open-island-" + order;
    }

    function createIsland(regionId, order) {
        return {
            id: islandId(regionId, order),
            order,
            label: "Ilha " + order,
            rewards: []
        };
    }

    function createRequiredIslandAction(regionId, order) {
        return {
            id: islandActionId(regionId, order),
            type: "open_island",
            targetId: islandId(regionId, order),
            required: true
        };
    }

    function createRegionDefinition(options = {}) {
        const order = Math.max(1, Math.trunc(Number(options.order) || 1));
        const label = String(options.label || ("Nova Região " + order)).trim() || ("Nova Região " + order);
        const id = slugify(options.id || label, "nova-regiao-" + order);

        return {
            schemaVersion: SCHEMA_VERSION,
            contentVersion: Math.max(1, Math.trunc(Number(options.contentVersion) || order)),
            type: "region",
            id,
            order,
            label,
            unlock: {
                type: "after_region",
                regionId: options.unlockAfterRegionId ?? null
            },
            islands: Array.from({ length: ISLANDS_PER_REGION }, (_, index) =>
                createIsland(id, index + 1)
            ),
            screen: {
                assets: [],
                actions: Array.from({ length: ISLANDS_PER_REGION }, (_, index) =>
                    createRequiredIslandAction(id, index + 1)
                ),
                bindings: []
            }
        };
    }

    function rebaseRegionId(definition, nextId) {
        const region = clone(definition);
        const oldId = region.id;
        const normalized = slugify(nextId, oldId || "nova-regiao");
        if (!oldId || oldId === normalized) {
            region.id = normalized;
            return region;
        }

        region.id = normalized;
        region.islands = (region.islands || []).map((island, index) => {
            const order = Number(island.order) || index + 1;
            const previousId = island.id;
            const id = islandId(normalized, order);
            return { ...island, id, order, _previousId: previousId };
        });

        const islandMap = new Map(region.islands.map((island) => [island._previousId, island.id]));
        region.islands = region.islands.map(({ _previousId, ...island }) => island);

        region.screen = region.screen || { assets: [], actions: [], bindings: [] };
        region.screen.actions = (region.screen.actions || []).map((action) => {
            if (action.type !== "open_island") return action;
            const targetId = islandMap.get(action.targetId) || action.targetId;
            const target = region.islands.find((island) => island.id === targetId);
            return {
                ...action,
                id: target ? islandActionId(normalized, target.order) : action.id,
                targetId
            };
        });

        return region;
    }

    function ensureRequiredActions(definition) {
        const region = clone(definition);
        region.screen = region.screen || { assets: [], actions: [], bindings: [] };
        const optional = (region.screen.actions || []).filter((action) => action.type !== "open_island");
        const required = (region.islands || [])
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((island) => ({
                id: islandActionId(region.id, island.order),
                type: "open_island",
                targetId: island.id,
                required: true
            }));
        region.screen.actions = [...required, ...optional];
        region.screen.assets = Array.isArray(region.screen.assets) ? region.screen.assets : [];
        region.screen.bindings = Array.isArray(region.screen.bindings) ? region.screen.bindings : [];
        return region;
    }

    function setOptionalAction(definition, type, enabled) {
        const known = OPTIONAL_ACTIONS.some((item) => item.type === type);
        if (!known) return clone(definition);

        const region = ensureRequiredActions(definition);
        const actions = region.screen.actions.filter((action) => action.type !== type);

        if (enabled) {
            actions.push({
                id: region.id + "-" + type.replace(/_/g, "-"),
                type,
                required: false
            });
        }

        region.screen.actions = actions;
        return region;
    }

    function validateRegionDefinition(definition) {
        const errors = [];
        const warnings = [];
        const region = definition && typeof definition === "object" ? definition : {};

        if (region.schemaVersion !== SCHEMA_VERSION) errors.push("schemaVersion inválido");
        if (region.type !== "region") errors.push("type deve ser region");
        if (!String(region.id || "").trim()) errors.push("ID da região é obrigatório");
        if (!String(region.label || "").trim()) errors.push("Nome da região é obrigatório");
        if (!Number.isInteger(region.order) || region.order < 1) errors.push("order deve ser inteiro positivo");

        const islands = Array.isArray(region.islands) ? region.islands : [];
        if (islands.length !== ISLANDS_PER_REGION) {
            errors.push("A região precisa ter exatamente 5 ilhas");
        }

        const islandIds = new Set();
        for (const island of islands) {
            if (!island?.id) errors.push("Toda ilha precisa de ID");
            if (islandIds.has(island?.id)) errors.push("ID de ilha duplicado: " + island.id);
            islandIds.add(island?.id);
            if (!Number.isInteger(island?.order) || island.order < 1 || island.order > ISLANDS_PER_REGION) {
                errors.push("Ordem de ilha inválida");
            }
            if (!Array.isArray(island?.rewards)) errors.push("rewards da ilha deve ser lista");
            for (const reward of Array.isArray(island?.rewards) ? island.rewards : []) {
                if (!REWARD_TYPES.includes(reward?.type)) {
                    errors.push("Tipo de recompensa inválido: " + String(reward?.type));
                }
            }
        }

        const screen = region.screen && typeof region.screen === "object" ? region.screen : {};
        const actions = Array.isArray(screen.actions) ? screen.actions : [];
        const actionIds = new Set();
        for (const action of actions) {
            if (!action?.id) errors.push("Toda função precisa de ID");
            if (actionIds.has(action?.id)) errors.push("ID de função duplicado: " + action.id);
            actionIds.add(action?.id);
        }

        for (const island of islands) {
            const matches = actions.filter((action) =>
                action.type === "open_island" && action.targetId === island.id
            );
            if (matches.length !== 1) {
                errors.push("A ilha " + (island.label || island.id) + " precisa de exatamente uma função open_island");
            }
        }

        const assets = Array.isArray(screen.assets) ? screen.assets : [];
        const assetIds = new Set(assets.map((asset) => asset?.id).filter(Boolean));
        const bindings = Array.isArray(screen.bindings) ? screen.bindings : [];
        for (const binding of bindings) {
            if (!assetIds.has(binding?.assetId)) {
                errors.push("Binding aponta para asset inexistente: " + String(binding?.assetId));
            }
            if (!actionIds.has(binding?.actionId)) {
                errors.push("Binding aponta para função inexistente: " + String(binding?.actionId));
            }
        }

        const unboundRequired = actions.filter((action) =>
            action.required
            && !bindings.some((binding) => binding.actionId === action.id)
        );
        if (unboundRequired.length) {
            warnings.push(unboundRequired.length + " função(ões) obrigatória(s) ainda sem asset visual");
        }

        if (assets.length === 0) {
            warnings.push("Tela com 0 assets: válido durante a construção DEV");
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    TQ.regionSchema = Object.freeze({
        SCHEMA_VERSION,
        ISLANDS_PER_REGION,
        OPTIONAL_ACTIONS,
        REWARD_TYPES,
        slugify,
        clone,
        createRegionDefinition,
        rebaseRegionId,
        ensureRequiredActions,
        setOptionalAction,
        validateRegionDefinition
    });
})(globalThis);
