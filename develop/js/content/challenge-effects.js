(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_EFFECT_IDS = Object.freeze({
        correct: "effect-correct-default",
        wrong: "effect-wrong-default"
    });

    const defaultCatalog = Object.freeze([
        Object.freeze({
            id: DEFAULT_EFFECT_IDS.correct,
            type: "correct",
            effectType: "correct",
            name: "Acerto padrão",
            renderer: Object.freeze({
                kind: "text",
                text: "Muito bem! ✨",
                durationMs: 680
            }),
            asset: null
        }),
        Object.freeze({
            id: DEFAULT_EFFECT_IDS.wrong,
            type: "wrong",
            effectType: "wrong",
            name: "Erro padrão",
            renderer: Object.freeze({
                kind: "text",
                text: "Quase!",
                durationMs: 520
            }),
            asset: null
        })
    ]);

    const shopCatalog = Object.freeze([
        Object.freeze({
            id: "effect-correct-brilho-capitao",
            category: "effect",
            type: "correct",
            effectType: "correct",
            name: "Brilho do Capitão",
            price: 300,
            renderer: Object.freeze({
                kind: "text",
                text: "Mandou bem, capitão! ✨",
                durationMs: 680
            }),
            asset: null
        }),
        Object.freeze({
            id: "effect-correct-tesouro-encontrado",
            category: "effect",
            type: "correct",
            effectType: "correct",
            name: "Tesouro Encontrado",
            price: 600,
            renderer: Object.freeze({
                kind: "text",
                text: "Tesouro encontrado! 💎",
                durationMs: 720
            }),
            asset: null
        }),
        Object.freeze({
            id: "effect-wrong-quase-la",
            category: "effect",
            type: "wrong",
            effectType: "wrong",
            name: "Quase Lá",
            price: 300,
            renderer: Object.freeze({
                kind: "text",
                text: "Quase lá! 🌟",
                durationMs: 520
            }),
            asset: null
        }),
        Object.freeze({
            id: "effect-wrong-nova-rota",
            category: "effect",
            type: "wrong",
            effectType: "wrong",
            name: "Nova Rota",
            price: 600,
            renderer: Object.freeze({
                kind: "text",
                text: "Tente outra rota! 🧭",
                durationMs: 560
            }),
            asset: null
        })
    ]);

    const catalog = Object.freeze([
        ...defaultCatalog,
        ...shopCatalog
    ]);

    function getEffect(effectId) {
        return catalog.find((effect) => effect.id === String(effectId)) || null;
    }

    function effectSupportsType(effect, type) {
        const supportedType = effect?.effectType || effect?.type;
        return Boolean(effect && (supportedType === type || supportedType === "both"));
    }

    function resolveEquippedEffect(state, type) {
        const normalizedType = type === "wrong" ? "wrong" : "correct";
        const equipped = state?.inventory?.equipped || {};
        const equippedId = normalizedType === "correct"
            ? equipped.correctEffectId
            : equipped.wrongEffectId;
        const equippedEffect = equippedId ? getEffect(equippedId) : null;

        if (effectSupportsType(equippedEffect, normalizedType)) return equippedEffect;
        return getEffect(DEFAULT_EFFECT_IDS[normalizedType]);
    }

    TQ.effects = Object.freeze({
        DEFAULT_EFFECT_IDS,
        catalog,
        shopCatalog,
        getEffect,
        resolveEquippedEffect
    });
})(globalThis);
