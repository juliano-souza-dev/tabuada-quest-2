(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderChestItems(kit, outcome) {
        const receivedIds = Array.isArray(outcome?.collectedIds) ? outcome.collectedIds : [];
        if (!outcome) return "<p>Baú guardado com sucesso.</p>";

        const received = receivedIds
            .map((id) => TQ.content.getCollectible(id))
            .filter(Boolean);
        const pendingCount = Number.isInteger(outcome.pendingCount) ? outcome.pendingCount : 0;

        return `
            <section aria-label="Colecionáveis do Baú">
                <h2>Colecionáveis encontrados</h2>
                ${received.length ? `
                    <ul class="result-rewards">
                        ${received.map((item) => `<li>🧭 ${item.label}</li>`).join("")}
                    </ul>
                ` : "<p>Nenhum Colecionável recebido.</p>"}
                ${outcome.isFinalChest
                    ? "<p>O Baú Final entregou todos os Colecionáveis restantes.</p>"
                    : (pendingCount > 0 ? `<p>${pendingCount} Colecionável(is) seguem escondidos nos próximos Baús.</p>` : "")}
            </section>
        `;
    }

    function renderChestScreen({ state, onNavigate, rewardReturnScreen }) {
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
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        } else {
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <small>Recompensa especial</small>
                    <h1>Baú conquistado! 🎁</h1>
                    <p>Você encontrou um Baú nesta jornada.</p>
                    ${renderChestItems(kit, result.reward?.collectibles)}
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="continue"]')) {
                onNavigate(rewardReturnScreen === "regions" ? "regions" : "islands");
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.chest = Object.freeze({ renderChestScreen, renderChestItems });
})(globalThis);
