(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function formatRubies(value) {
        return Number(value || 0).toLocaleString("pt-BR");
    }

    function makeLocalOrderId() {
        if (root.crypto?.randomUUID) return `local-${root.crypto.randomUUID()}`;
        return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function renderRubyShopScreen({ state, onStateChange, onNavigate }) {
        const catalog = TQ.content.rubyShopCatalog;
        const orders = Array.isArray(state.rubyShop?.orders) ? state.rubyShop.orders : [];
        const latest = orders[orders.length - 1] || null;
        const screen = document.createElement("section");
        screen.className = "ruby-shop-screen";
        screen.setAttribute("aria-label", "Loja Rubi");

        screen.innerHTML = `
            <header class="ruby-shop-header">
                <button type="button" data-action="back" aria-label="Voltar para a Região">←</button>
                <div>
                    <small>EMBARCAÇÃO MERCANTE</small>
                    <h1>Loja Rubi</h1>
                </div>
                <strong class="ruby-shop-wallet">💎 ${formatRubies(state.wallet.gems)}</strong>
            </header>

            <main class="ruby-shop-content">
                <section class="ruby-shop-notice">
                    <strong>Pedido de teste</strong>
                    <p>Nesta versão, a compra fica registrada no jogo e nenhuma entrega física é enviada.</p>
                </section>

                ${latest ? `
                    <section class="ruby-shop-success" aria-live="polite">
                        <strong>Pedido registrado ✓</strong>
                        <span>${latest.label} • 💎 ${formatRubies(latest.priceRubies)}</span>
                    </section>
                ` : ""}

                <div class="ruby-shop-list">
                    ${catalog.items.map((item) => {
                        const canBuy = item.available !== false && state.wallet.gems >= item.priceRubies;
                        return `
                            <article class="ruby-shop-card" data-ruby-item-id="${item.id}">
                                <div class="ruby-shop-card-icon" aria-hidden="true">🎁</div>
                                <div class="ruby-shop-card-copy">
                                    <small>RECOMPENSA FÍSICA</small>
                                    <h2>${item.label}</h2>
                                    <strong>💎 ${formatRubies(item.priceRubies)} Rubis</strong>
                                </div>
                                <button type="button"
                                    data-buy-ruby-item="${item.id}"
                                    ${canBuy ? "" : "disabled"}>
                                    ${canBuy ? "Comprar" : "Rubis insuficientes"}
                                </button>
                            </article>
                        `;
                    }).join("")}
                </div>

                <section class="ruby-shop-orders">
                    <h2>Pedidos neste dispositivo</h2>
                    ${orders.length
                        ? `<p>${orders.length} pedido${orders.length === 1 ? "" : "s"} registrado${orders.length === 1 ? "" : "s"}.</p>`
                        : "<p>Nenhum pedido registrado ainda.</p>"}
                </section>
            </main>

            <div class="ruby-shop-confirm" data-confirm hidden>
                <div class="ruby-shop-confirm-card" role="dialog" aria-modal="true" aria-labelledby="ruby-confirm-title">
                    <small>CONFIRMAR COMPRA</small>
                    <h2 id="ruby-confirm-title" data-confirm-title>Comprar item?</h2>
                    <p data-confirm-price></p>
                    <div>
                        <button type="button" data-action="cancel-purchase">Cancelar</button>
                        <button type="button" class="is-primary" data-action="confirm-purchase">Comprar</button>
                    </div>
                </div>
            </div>
        `;

        let pendingItemId = null;
        const confirm = screen.querySelector("[data-confirm]");
        const confirmTitle = screen.querySelector("[data-confirm-title]");
        const confirmPrice = screen.querySelector("[data-confirm-price]");

        function closeConfirmation() {
            pendingItemId = null;
            confirm.hidden = true;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("islands");
                return;
            }

            if (event.target.closest('[data-action="cancel-purchase"]')) {
                closeConfirmation();
                return;
            }

            const buy = event.target.closest("[data-buy-ruby-item]");
            if (buy) {
                const item = TQ.content.getRubyShopItem(buy.dataset.buyRubyItem);
                if (!item || state.wallet.gems < item.priceRubies || item.available === false) return;
                pendingItemId = item.id;
                confirmTitle.textContent = item.label;
                confirmPrice.textContent = `Usar ${formatRubies(item.priceRubies)} Rubis para registrar este pedido?`;
                confirm.hidden = false;
                return;
            }

            if (event.target.closest('[data-action="confirm-purchase"]')) {
                const item = TQ.content.getRubyShopItem(pendingItemId);
                if (!item) {
                    closeConfirmation();
                    return;
                }
                const nextState = TQ.domain.playerState.purchaseRubyShopItem(state, item, {
                    id: makeLocalOrderId(),
                    createdAt: new Date().toISOString()
                });
                closeConfirmation();
                onStateChange(nextState);
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.rubyShop = Object.freeze({ renderRubyShopScreen });
})(globalThis);
