(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function getOwnedEffects(state) {
        const owned = new Set(state.inventory?.items || []);
        return (TQ.content.shopCatalog.effects || []).filter((effect) => owned.has(effect.id));
    }

    function getOwnedFrames(state) {
        const purchased = new Set(state.shop?.purchasedItemIds || []);
        const baseFrames = TQ.content.profileFrames || [];
        const commercialFrames = (TQ.content.shopCatalog.frames || [])
            .filter((frame) => purchased.has(frame.id));

        return [...baseFrames, ...commercialFrames];
    }

    function getOwnedNameplates(state) {
        const purchased = new Set(state.shop?.purchasedItemIds || []);
        return (TQ.content.nameplates || []).filter((item) => item.isDefault || purchased.has(item.id));
    }

    function renderNameplateCard(item, equippedId) {
        const isEquipped = item.id === equippedId;
        return `
            <article class="items-effect-card items-frame-card${isEquipped ? " is-equipped" : ""}">
                <div class="items-frame-preview">
                    <img src="${item.asset}" alt="">
                </div>
                <div class="items-effect-copy">
                    <small>Plaquinha</small>
                    <strong>${item.label}</strong>
                    <span>${isEquipped ? "Em uso na Home" : "Disponível"}</span>
                </div>
                <button type="button" data-nameplate-id="${item.id}" ${isEquipped ? "disabled" : ""}>
                    ${isEquipped ? "Equipada" : "Equipar"}
                </button>
            </article>
        `;
    }

    function renderFrameCard(frame, equippedId) {
        const isEquipped = frame.id === equippedId;
        const preview = frame.src || frame.asset;

        return `
            <article class="items-effect-card items-frame-card${isEquipped ? " is-equipped" : ""}">
                <div class="items-frame-preview ${preview ? "" : "is-pending"}">
                    ${preview
                        ? `<img src="${preview}" alt="">`
                        : `<span>${frame.id === TQ.content.defaultProfileFrameId ? "○" : "Arte em breve"}</span>`}
                </div>
                <div class="items-effect-copy">
                    <small>Moldura</small>
                    <strong>${frame.label}</strong>
                    <span>${isEquipped ? "Em uso no perfil" : "Disponível"}</span>
                </div>
                <button type="button"
                    data-frame-id="${frame.id}"
                    ${isEquipped ? "disabled" : ""}>
                    ${isEquipped ? "Equipada" : "Equipar"}
                </button>
            </article>
        `;
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

        const ownedFrames = getOwnedFrames(state);
        const ownedNameplates = getOwnedNameplates(state);
        const nameplateAllowed = ownedNameplates.map((item) => item.id);
        const ownedEffects = getOwnedEffects(state);
        const correctEffects = ownedEffects.filter((item) => item.effectType === "correct");
        const wrongEffects = ownedEffects.filter((item) => item.effectType === "wrong");
        const equipped = state.inventory?.equipped || {};
        const frameAllowed = ownedFrames.map((item) => item.id);
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
                    Equipe aqui Plaquinhas, Molduras e Efeitos que você já possui.
                </p>

                <section class="items-group" aria-labelledby="items-nameplates-title">
                    <div class="items-group-heading">
                        <div><small>HOME</small><h2 id="items-nameplates-title">Plaquinhas</h2></div>
                        <span>Nome do jogador</span>
                    </div>
                    ${ownedNameplates.map((item) => renderNameplateCard(item, state.player.nameplateId)).join("")}
                </section>

                <section class="items-group" aria-labelledby="items-frames-title">
                    <div class="items-group-heading">
                        <div>
                            <small>PERFIL</small>
                            <h2 id="items-frames-title">Molduras</h2>
                        </div>
                        <span>Equipar no perfil</span>
                    </div>
                    ${ownedFrames.length
                        ? ownedFrames.map((frame) =>
                            renderFrameCard(frame, state.player.profileFrameId)
                        ).join("")
                        : '<p class="items-empty">Nenhuma Moldura disponível ainda.</p>'}
                </section>

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
            const nameplateButton = event.target.closest("[data-nameplate-id]");
            if (nameplateButton) {
                onStateChange(TQ.domain.playerState.withNameplate(state, nameplateButton.dataset.nameplateId, nameplateAllowed));
                return;
            }

            const frameButton = event.target.closest("[data-frame-id]");
            if (frameButton) {
                onStateChange(
                    TQ.domain.playerState.withProfileFrame(
                        state,
                        frameButton.dataset.frameId,
                        frameAllowed
                    )
                );
                return;
            }

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
        getOwnedFrames,
        getOwnedNameplates,
        renderItemsScreen
    });
})(globalThis);
