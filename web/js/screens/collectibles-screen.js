(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const BONUS_LABELS = Object.freeze({
        xp: "XP",
        coins: "Ouro",
        gems: "Rubi"
    });

    function renderBonusTypes(item) {
        const types = Array.isArray(item?.bonusTypes) ? item.bonusTypes : [];
        return types.map((type) => BONUS_LABELS[type] || type).join(" • ");
    }

    function renderCollectiblesScreen({ state, onNavigate }) {
        const catalog = TQ.content.collectibles || [];
        const collected = new Set(state.campaign?.collectibles?.collectedIds || []);
        const total = catalog.length;
        const collectedCount = catalog.filter((item) => collected.has(item.id)).length;

        const screen = document.createElement("section");
        screen.className = "collectibles-screen";
        screen.setAttribute("aria-label", "Colecionáveis");

        screen.innerHTML = `
            <header class="collectibles-header">
                <button type="button" data-action="back" aria-label="Voltar">←</button>
                <div>
                    <small>COLEÇÃO</small>
                    <h1>Colecionáveis</h1>
                </div>
                <strong aria-label="${collectedCount} de ${total} colecionáveis">${collectedCount}/${total}</strong>
            </header>

            <section class="collectibles-summary">
                <p>Itens encontrados nos Baús da aventura.</p>
                <span>Bônus: XP • Ouro • Rubi</span>
            </section>

            <main class="collectibles-list">
                ${catalog.map((item) => {
                    const isCollected = collected.has(item.id);
                    return `
                        <article class="collectible-card ${isCollected ? "is-collected" : "is-missing"}"
                                 data-collectible-id="${item.id}">
                            <h2>${item.label}</h2>
                            <p class="collectible-status">
                                <strong>Status:</strong> ${isCollected ? "Coletado ✓" : "Não coletado"}
                            </p>
                            <p class="collectible-bonus">
                                <strong>Bônus:</strong> ${renderBonusTypes(item)}
                            </p>
                        </article>
                    `;
                }).join("")}
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) onNavigate("home");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.collectibles = Object.freeze({
        renderCollectiblesScreen,
        renderBonusTypes
    });
})(globalThis);
