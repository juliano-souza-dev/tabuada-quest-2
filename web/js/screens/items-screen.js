(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const TAB_IDS = Object.freeze(["fashion", "backgrounds", "frames", "effects"]);
    let activeTabId = "frames";

    function getOwnedEffects(state) {
        const owned = new Set(state.inventory?.items || []);
        return (TQ.content.shopCatalog.effects || []).filter((effect) => owned.has(effect.id));
    }

    function getOwnedFrames(state) {
        const purchased = new Set(state.shop?.purchasedItemIds || []);
        return (TQ.content.frames || []).filter((frame) => frame.isDefault || purchased.has(frame.id));
    }

    function normalizeBackground(item) {
        if (!item) return null;
        return Object.freeze({
            ...item,
            src: item.src || item.asset || null
        });
    }

    function getOwnedBackgrounds(state) {
        const purchased = new Set(state.shop?.purchasedItemIds || []);
        const baseBackgrounds = (TQ.content.homeBackgrounds || []).map(normalizeBackground);
        const commercialBackgrounds = (TQ.content.shopCatalog.backgrounds || [])
            .filter((background) => purchased.has(background.id))
            .map(normalizeBackground);

        return [...baseBackgrounds, ...commercialBackgrounds].filter(Boolean);
    }

    function renderFrameCard(frame, equippedId) {
        const isEquipped = frame.id === equippedId;
        const preview = frame.asset;

        return `
            <article class="items-entry items-entry-with-preview${isEquipped ? " is-equipped" : ""}">
                <div class="items-entry-preview items-nameplate-preview">
                    <img src="${preview}" alt="" draggable="false">
                </div>
                <div class="items-entry-copy">
                    <strong>${frame.label}</strong>
                    <span>${isEquipped ? "Em uso na Home" : "Disponível"}</span>
                </div>
                <button
                    class="items-equip-button"
                    type="button"
                    data-frame-id="${frame.id}"
                    ${isEquipped ? "disabled" : ""}>
                    ${isEquipped ? "Equipada" : "Equipar"}
                </button>
            </article>
        `;
    }

    function renderBackgroundCard(background, equippedId) {
        const isEquipped = background.id === equippedId;
        const preview = background.src || background.asset;

        return `
            <article class="items-entry items-entry-with-preview${isEquipped ? " is-equipped" : ""}">
                <div class="items-entry-preview items-background-preview ${preview ? "" : "is-pending"}">
                    ${preview
                        ? `<img src="${preview}" alt="" draggable="false">`
                        : "<span>Arte em breve</span>"}
                </div>
                <div class="items-entry-copy">
                    <strong>${background.label}</strong>
                    <span>${isEquipped ? "Em uso na Home" : "Disponível"}</span>
                </div>
                <button
                    class="items-equip-button"
                    type="button"
                    data-background-id="${background.id}"
                    ${isEquipped ? "disabled" : ""}>
                    ${isEquipped ? "Equipado" : "Equipar"}
                </button>
            </article>
        `;
    }

    function renderEffectCard(effect, equippedId, slotLabel) {
        const isEquipped = effect.id === equippedId;
        return `
            <article class="items-entry items-effect-card${isEquipped ? " is-equipped" : ""}">
                <div class="items-entry-copy">
                    <small>${slotLabel}</small>
                    <strong>${effect.name}</strong>
                    <span>${effect.renderer?.text || "Efeito visual"}</span>
                </div>
                <button
                    class="items-equip-button"
                    type="button"
                    data-effect-id="${effect.id}"
                    data-effect-type="${effect.effectType}"
                    ${isEquipped ? 'data-action="unequip-effect"' : 'data-action="equip-effect"'}>
                    ${isEquipped ? "Remover" : "Equipar"}
                </button>
            </article>
        `;
    }

    function renderEmpty(message) {
        return `<p class="items-empty">${message}</p>`;
    }

    function renderPanelContent({
        tabId,
        state,
        ownedBackgrounds,
        ownedFrames,
        correctEffects,
        wrongEffects,
        equipped
    }) {
        if (tabId === "fashion") {
            return `
                <section class="items-panel-section" aria-label="Moda">
                    ${renderEmpty("Nenhum item de Moda disponível no Baú ainda.")}
                </section>
            `;
        }

        if (tabId === "backgrounds") {
            return `
                <section class="items-panel-section" aria-label="Fundos">
                    ${ownedBackgrounds.length
                        ? ownedBackgrounds.map((item) =>
                            renderBackgroundCard(item, state.ui?.homeBackgroundId)
                        ).join("")
                        : renderEmpty("Nenhum Fundo disponível ainda.")}
                </section>
            `;
        }

        if (tabId === "effects") {
            return `
                <section class="items-panel-section items-effects-section" aria-label="Efeitos">
                    <div class="items-effect-slot">
                        <div class="items-effect-slot-heading">
                            <strong>Acerto</strong>
                            <span>${equipped.correctEffectId ? "Personalizado" : "Padrão"}</span>
                        </div>
                        ${correctEffects.length
                            ? correctEffects.map((effect) =>
                                renderEffectCard(effect, equipped.correctEffectId, "Efeito de acerto")
                            ).join("")
                            : renderEmpty("Nenhum Efeito de acerto comprado ainda.")}
                    </div>

                    <div class="items-effect-slot">
                        <div class="items-effect-slot-heading">
                            <strong>Erro</strong>
                            <span>${equipped.wrongEffectId ? "Personalizado" : "Padrão"}</span>
                        </div>
                        ${wrongEffects.length
                            ? wrongEffects.map((effect) =>
                                renderEffectCard(effect, equipped.wrongEffectId, "Efeito de erro")
                            ).join("")
                            : renderEmpty("Nenhum Efeito de erro comprado ainda.")}
                    </div>
                </section>
            `;
        }

        return `
            <section class="items-panel-section" aria-label="Molduras">
                ${ownedFrames.length
                    ? ownedFrames.map((frame) =>
                        renderFrameCard(frame, state.player.frameId)
                    ).join("")
                    : renderEmpty("Nenhuma Moldura disponível ainda.")}
            </section>
        `;
    }

    function renderItemsScreen({ state, onStateChange, onNavigate }) {
        const screen = document.createElement("section");
        screen.className = "items-screen";
        screen.setAttribute("aria-label", "Baú de Itens");

        const ownedFrames = getOwnedFrames(state);
        const ownedBackgrounds = getOwnedBackgrounds(state);
        const ownedEffects = getOwnedEffects(state);
        const correctEffects = ownedEffects.filter((item) => item.effectType === "correct");
        const wrongEffects = ownedEffects.filter((item) => item.effectType === "wrong");
        const equipped = state.inventory?.equipped || {};

        const frameAllowed = ownedFrames.map((item) => item.id);
        const backgroundAllowed = ownedBackgrounds.map((item) => item.id);
        const correctAllowed = TQ.content.shopCatalog.effects
            .filter((item) => item.effectType === "correct")
            .map((item) => item.id);
        const wrongAllowed = TQ.content.shopCatalog.effects
            .filter((item) => item.effectType === "wrong")
            .map((item) => item.id);

        if (!TAB_IDS.includes(activeTabId)) activeTabId = "frames";

        screen.innerHTML = `
            <div class="items-artboard">
                <img
                    class="items-background-art"
                    src="./assets/ui/inventory/bau_de_itens.webp"
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                >

                <button
                    type="button"
                    class="items-hotspot items-home-hotspot"
                    data-action="back-home"
                    aria-label="Voltar para a tela inicial"
                ></button>

                <nav class="items-tab-hotspots" aria-label="Categorias do Baú de Itens">
                    <button type="button" class="items-tab-hotspot" data-items-tab="fashion" aria-label="Moda"></button>
                    <button type="button" class="items-tab-hotspot" data-items-tab="backgrounds" aria-label="Fundo"></button>
                    <button type="button" class="items-tab-hotspot" data-items-tab="frames" aria-label="Molduras"></button>
                    <button type="button" class="items-tab-hotspot" data-items-tab="effects" aria-label="Efeitos"></button>
                </nav>

                <div class="items-dynamic-panel" role="region" aria-live="polite"></div>
            </div>
        `;

        const panel = screen.querySelector(".items-dynamic-panel");
        const tabButtons = Array.from(screen.querySelectorAll("[data-items-tab]"));

        function renderActiveTab({ resetScroll = false } = {}) {
            tabButtons.forEach((button) => {
                const selected = button.dataset.itemsTab === activeTabId;
                button.classList.toggle("is-active", selected);
                button.setAttribute("aria-pressed", selected ? "true" : "false");
            });

            panel.innerHTML = renderPanelContent({
                tabId: activeTabId,
                state,
                ownedBackgrounds,
                ownedFrames,
                correctEffects,
                wrongEffects,
                equipped
            });

            if (resetScroll) panel.scrollTop = 0;
        }

        screen.addEventListener("click", (event) => {
            const tabButton = event.target.closest("[data-items-tab]");
            if (tabButton) {
                const nextTab = tabButton.dataset.itemsTab;
                if (TAB_IDS.includes(nextTab)) {
                    activeTabId = nextTab;
                    renderActiveTab({ resetScroll: true });
                }
                return;
            }

            const frameButton = event.target.closest("[data-frame-id]");
            if (frameButton) {
                onStateChange(
                    TQ.domain.playerState.withFrame(
                        state,
                        frameButton.dataset.frameId,
                        frameAllowed
                    )
                );
                return;
            }

            const backgroundButton = event.target.closest("[data-background-id]");
            if (backgroundButton) {
                onStateChange(
                    TQ.domain.playerState.withHomeBackground(
                        state,
                        backgroundButton.dataset.backgroundId,
                        backgroundAllowed
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

        renderActiveTab();
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.items = Object.freeze({
        getOwnedEffects,
        getOwnedFrames,
        getOwnedBackgrounds,
        renderItemsScreen
    });
})(globalThis);
