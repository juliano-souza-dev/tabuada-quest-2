(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_EFFECT_IDS = Object.freeze({
        correct: "effect-correct-default",
        wrong: "effect-wrong-default"
    });

    const catalog = Object.freeze([
        Object.freeze({
            id: DEFAULT_EFFECT_IDS.correct,
            type: "correct",
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
            name: "Erro padrão",
            renderer: Object.freeze({
                kind: "text",
                text: "Quase!",
                durationMs: 520
            }),
            asset: null
        })
    ]);

    function getEffect(effectId) {
        return catalog.find((effect) => effect.id === String(effectId)) || null;
    }

    function effectSupportsType(effect, type) {
        return Boolean(effect && (effect.type === type || effect.type === "both"));
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
        getEffect,
        resolveEquippedEffect
    });
})(globalThis);
