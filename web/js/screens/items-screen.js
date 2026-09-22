(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function getOwnedEffects(state) {
        const owned = new Set(state.inventory?.items || []);
        return (TQ.content.shopCatalog.effects || []).filter((effect) => owned.has(effect.id));
    }

    function renderEffectCard(effect, equippedId, slotLabel) {
        const isEquipped = effect.id === equippedId;
        return `
            <article class="items-effect-card${isEquipped ? " is-equipped" : ""}">
                <div class="items-effect-copy">
                    <small>${slotLabel}</small>
                    <strong>${effect.name}</strong>
                    <span>${effect.renderer?.text || "Efeito textual"}</span>
                </div>
                <button type="button"
                    data-effect-id="${effect.id}"
                    data-effect-type="${effect.effectType}"
                    ${isEquipped ? 'data-action="unequip-effect"' : 'data-action="equip-effect"'}>
                    ${isEquipped ? "Equipado · remover" : "Equipar"}
                </button>
            </article>
        `;
    }

    function renderItemsScreen({ state, onStateChange, onNavigate }) {
        const screen = document.createElement("section");
        screen.className = "slice-screen items-screen";
        screen.setAttribute("aria-label", "Baú de Itens");

        const ownedEffects = getOwnedEffects(state);
        const correctEffects = ownedEffects.filter((item) => item.effectType === "correct");
        const wrongEffects = ownedEffects.filter((item) => item.effectType === "wrong");
        const equipped = state.inventory?.equipped || {};
        const correctAllowed = TQ.content.shopCatalog.effects
            .filter((item) => item.effectType === "correct")
            .map((item) => item.id);
        const wrongAllowed = TQ.content.shopCatalog.effects
            .filter((item) => item.effectType === "wrong")
            .map((item) => item.id);

        screen.innerHTML = `
            <header class="slice-header">
                <button type="button" data-action="back-home">← Home</button>
                <div>
                    <small>Inventário</small>
                    <h1>Baú de Itens</h1>
                </div>
            </header>

            <main class="slice-content items-content">
                <p class="items-intro">
                    Escolha os Efeitos usados quando você acerta ou erra uma questão.
                </p>

                <section class="items-group" aria-labelledby="items-correct-title">
                    <div class="items-group-heading">
                        <div>
                            <small>ACERTO</small>
                            <h2 id="items-correct-title">Efeito de acerto</h2>
                        </div>
                        <span>${equipped.correctEffectId ? "Personalizado" : "Padrão"}</span>
                    </div>
                    ${correctEffects.length
                        ? correctEffects.map((effect) =>
                            renderEffectCard(effect, equipped.correctEffectId, "Acerto")
                        ).join("")
                        : '<p class="items-empty">Nenhum Efeito de acerto comprado ainda.</p>'}
                </section>

                <section class="items-group" aria-labelledby="items-wrong-title">
                    <div class="items-group-heading">
                        <div>
                            <small>ERRO</small>
                            <h2 id="items-wrong-title">Efeito de erro</h2>
                        </div>
                        <span>${equipped.wrongEffectId ? "Personalizado" : "Padrão"}</span>
                    </div>
                    ${wrongEffects.length
                        ? wrongEffects.map((effect) =>
                            renderEffectCard(effect, equipped.wrongEffectId, "Erro")
                        ).join("")
                        : '<p class="items-empty">Nenhum Efeito de erro comprado ainda.</p>'}
                </section>

                <button class="items-shop-link" type="button" data-action="open-shop">
                    Ir para a Loja
                </button>
            </main>
        `;

        screen.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-action]");
            if (!actionButton) return;

            const action = actionButton.dataset.action;

            if (action === "back-home") {
                onNavigate("home");
                return;
            }

            if (action === "open-shop") {
                onNavigate("shop");
                return;
            }

            if (action === "equip-effect" || action === "unequip-effect") {
                const effectType = actionButton.dataset.effectType === "wrong" ? "wrong" : "correct";
                const effectId = action === "unequip-effect"
                    ? null
                    : actionButton.dataset.effectId;
                const allowed = effectType === "wrong" ? wrongAllowed : correctAllowed;

                onStateChange(
                    TQ.domain.playerState.withEquippedEffect(
                        state,
                        effectType,
                        effectId,
                        allowed
                    )
                );
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.items = Object.freeze({
        getOwnedEffects,
        renderItemsScreen
    });
})(globalThis);
