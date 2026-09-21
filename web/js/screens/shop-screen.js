(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function formatGold(value) {
        return Number(value || 0).toLocaleString("pt-BR");
    }

    function renderStoreItem(item, state) {
        const purchased = state.shop.purchasedItemIds.includes(item.id);
        const hasPrice = Number.isInteger(item.price) && item.price >= 0;
        const canBuy = hasPrice && state.wallet.coins >= item.price;

        return `
            <article class="shop-item-card" data-shop-item-id="${item.id}">
                <div class="shop-item-copy">
                    <h2>${item.label}</h2>
                    <p class="shop-price">
                        ${hasPrice ? `🪙 ${formatGold(item.price)} Ouro` : "Preço a definir"}
                    </p>
                </div>
                ${purchased
                    ? '<strong class="shop-purchased">Comprado</strong>'
                    : (hasPrice
                        ? `<button type="button"
                                class="shop-buy-button"
                                data-buy-item-id="${item.id}"
                                ${canBuy ? "" : "disabled"}>
                            ${canBuy ? "Comprar" : "Ouro insuficiente"}
                        </button>`
                        : '<strong class="shop-price-pending">Em breve</strong>')}
            </article>
        `;
    }

    function emptyCategory(message) {
        return `
            <section class="shop-empty">
                <h2>Em preparação</h2>
                <p>${message}</p>
            </section>
        `;
    }

    function renderShopScreen({ state, onStateChange, onNavigate }) {
        const catalog = TQ.content.shopCatalog;
        const screen = document.createElement("section");
        screen.className = "shop-screen";
        screen.setAttribute("aria-label", "Loja");

        screen.innerHTML = `
            <header class="shop-header">
                <button type="button" data-action="back" aria-label="Voltar">←</button>
                <div>
                    <small>LOJA</small>
                    <h1>Loja</h1>
                </div>
                <strong>🪙 ${formatGold(state.wallet.coins)}</strong>
            </header>

            <nav class="shop-tabs" aria-label="Categorias da Loja">
                ${catalog.tabs.map((tab) => `
                    <button type="button"
                            data-shop-tab="${tab.id}"
                            class="${tab.id === "shipyard" ? "is-active" : ""}">
                        ${tab.label}
                    </button>
                `).join("")}
            </nav>

            <main class="shop-content">
                <section data-shop-panel="frames" hidden>
                    <p class="shop-intro">As artes entram na etapa visual. Por enquanto, o catálogo mostra apenas os nomes.</p>
                    <div class="shop-item-list">
                        ${catalog.frames.map((item) => renderStoreItem(item, state)).join("")}
                    </div>
                </section>
                <section data-shop-panel="backgrounds" hidden>
                    <p class="shop-intro">As artes entram na etapa visual. Por enquanto, o catálogo mostra nome e preço.</p>
                    <div class="shop-item-list">
                        ${catalog.backgrounds.map((item) => renderStoreItem(item, state)).join("")}
                    </div>
                </section>
                <section data-shop-panel="shipyard">
                    <p class="shop-intro">A Loja apenas vende. O local de equipar navios será definido separadamente.</p>
                    <div class="shop-item-list">
                        ${catalog.ships.map((item) => renderStoreItem(item, state)).join("")}
                    </div>
                </section>
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }

            const tab = event.target.closest("[data-shop-tab]");
            if (tab) {
                const tabId = tab.dataset.shopTab;
                screen.querySelectorAll("[data-shop-tab]").forEach((button) => {
                    button.classList.toggle("is-active", button.dataset.shopTab === tabId);
                });
                screen.querySelectorAll("[data-shop-panel]").forEach((panel) => {
                    panel.hidden = panel.dataset.shopPanel !== tabId;
                });
                return;
            }

            const buy = event.target.closest("[data-buy-item-id]");
            if (!buy) return;

            const item = TQ.content.getShopItem(buy.dataset.buyItemId);
            if (!item) return;
            onStateChange(TQ.domain.playerState.purchaseShopItem(state, item));
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.shop = Object.freeze({
        renderShopScreen,
        formatGold
    });
})(globalThis);
