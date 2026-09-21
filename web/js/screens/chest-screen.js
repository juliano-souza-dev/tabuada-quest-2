(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderChestItems(kit) {
        const items = Array.isArray(kit?.items) ? kit.items : [];
        if (!items.length) return "<p>Baú guardado com sucesso.</p>";

        return `
            <ul class="result-rewards" aria-label="Itens do Baú">
                ${items.map((item) => {
                    const label = typeof item?.label === "string"
                        ? item.label
                        : (typeof item?.id === "string" ? item.id : "Item especial");
                    const quantity = Number.isInteger(item?.quantity) && item.quantity > 1
                        ? ` ×${item.quantity}`
                        : "";
                    return `<li>${label}${quantity}</li>`;
                }).join("")}
            </ul>
        `;
    }

    function renderChestScreen({ state, onNavigate }) {
        const result = state.learning.lastResult;
        const chestReward = result?.reward?.structural?.find((reward) => reward.type === "chest") || null;
        const kit = chestReward ? TQ.content.getChestKit(chestReward.chestId) : null;
        const screen = document.createElement("section");
        screen.className = "slice-screen result-text-screen";
        screen.setAttribute("aria-label", "Baú conquistado");

        if (!chestReward) {
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <h1>Nenhum Baú pendente</h1>
                    <button type="button" data-action="result">Ver resultado</button>
                </main>
            `;
        } else {
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <small>Recompensa especial</small>
                    <h1>Baú conquistado! 🎁</h1>
                    <p>Você encontrou um Baú nesta jornada.</p>
                    ${renderChestItems(kit)}
                    <button type="button" data-action="result">Continuar</button>
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="result"]')) onNavigate("result");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.chest = Object.freeze({ renderChestScreen, renderChestItems });
})(globalThis);
