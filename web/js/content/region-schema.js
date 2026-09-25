(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const SCHEMA_VERSION = 2;
    const ISLANDS_PER_REGION = 5;
    const OPTIONAL_ACTIONS = Object.freeze([
        Object.freeze({ type: "open_merchant", label: "Navio mercador" })
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

    function createRequiredNavigationActions(regionId) {
        return [
            {
                id: regionId + "-go-back",
                type: "go_back",
                required: true
            },
            {
                id: regionId + "-open-world-map",
                type: "open_world_map",
                required: true
            }
        ];
    }

    function createSemanticRegionAssets() {
        const slots = TQ.content?.screenComposition?.getAssetSlots?.("region-map") || [];
        return slots.map((slot) => ({
            id: slot.id,
            label: slot.label,
            semanticType: slot.semanticType,
            acceptedTypes: [...(slot.acceptedTypes || [slot.semanticType])],
            required: Boolean(slot.required),
            action: slot.action || null,
            pairId: slot.pairId || null,
            pairState: slot.pairState || null,
            group: slot.group || null,
            asset: null
        }));
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
                compositionType: "region-map",
                assets: createSemanticRegionAssets(),
                actions: [
                    ...Array.from({ length: ISLANDS_PER_REGION }, (_, index) =>
                        createRequiredIslandAction(id, index + 1)
                    ),
                    ...createRequiredNavigationActions(id)
                ],
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
        region.screen.compositionType = "region-map";
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

        return ensureRequiredActions(region);
    }

    function ensureRequiredActions(definition) {
        const region = clone(definition);
        region.schemaVersion = SCHEMA_VERSION;
        region.screen = region.screen || { assets: [], actions: [], bindings: [] };
        region.screen.compositionType = "regions";

        const optional = (region.screen.actions || []).filter((action) =>
            OPTIONAL_ACTIONS.some((item) => item.type === action.type)
        );
        const requiredIslands = (region.islands || [])
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((island) => ({
                id: islandActionId(region.id, island.order),
                type: "open_island",
                targetId: island.id,
                required: true
            }));
        region.screen.actions = [
            ...requiredIslands,
            ...createRequiredNavigationActions(region.id),
            ...optional
        ];

        const previousAssets = new Map(
            (Array.isArray(region.screen.assets) ? region.screen.assets : [])
                .map((asset) => [String(asset?.id || ""), asset])
        );
        region.screen.assets = createSemanticRegionAssets().map((slot) => {
            const previous = previousAssets.get(slot.id);
            return {
                ...slot,
                semanticType: slot.acceptedTypes.includes(previous?.semanticType)
                    ? previous.semanticType
                    : slot.semanticType,
                asset: typeof previous?.asset === "string" && previous.asset.trim()
                    ? previous.asset.trim()
                    : null,
                localFileName: previous?.localFileName || null,
                source: previous?.source || null
            };
        });

        region.screen.bindings = Array.isArray(region.screen.bindings)
            ? region.screen.bindings.filter((binding) =>
                region.screen.assets.some((asset) => asset.id === binding?.assetId)
                && region.screen.actions.some((action) => action.id === binding?.actionId)
            )
            : [];
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
        const requiredSlots = createSemanticRegionAssets().filter((asset) => asset.required);
        for (const requiredSlot of requiredSlots) {
            if (!assetIds.has(requiredSlot.id)) {
                errors.push("Slot obrigatório ausente: " + requiredSlot.label);
            }
        }
        for (const asset of assets) {
            if (!asset?.id) errors.push("Todo slot visual precisa de ID");
            if (asset?.asset !== null && typeof asset?.asset !== "string") {
                errors.push("Vínculo visual inválido em " + String(asset?.id));
            }
        }

        const bindings = Array.isArray(screen.bindings) ? screen.bindings : [];
        for (const binding of bindings) {
            if (!assetIds.has(binding?.assetId)) {
                errors.push("Binding aponta para asset inexistente: " + String(binding?.assetId));
            }
            if (!actionIds.has(binding?.actionId)) {
                errors.push("Binding aponta para função inexistente: " + String(binding?.actionId));
            }
        }

        const requiredWithoutArt = assets.filter((asset) => asset.required && !asset.asset);
        if (requiredWithoutArt.length) {
            warnings.push(requiredWithoutArt.length + " slot(s) obrigatório(s) ainda sem arte vinculada");
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
        createSemanticRegionAssets,
        rebaseRegionId,
        ensureRequiredActions,
        setOptionalAction,
        validateRegionDefinition
    });
})(globalThis);
