(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const BONUS_LABELS = Object.freeze({
        xp: "XP",
        coins: "OURO",
        gems: "GEMAS"
    });

    function renderCrewScreen({ state, onStateChange, onNavigate }) {
        const crew = TQ.content.crewMembers || [];
        const hired = new Set(state.crew?.hiredIds || []);
        const bonuses = TQ.domain.playerState.getCrewBonusSummary(state, crew);

        const cards = crew.map((member) => {
            const isHired = hired.has(member.id);
            const canAfford = state.wallet.coins >= member.cost;
            const bonusLabel = BONUS_LABELS[member.bonusType] || member.bonusType;
            const buttonLabel = isHired ? "CONTRATADO ✓" : (canAfford ? "CONTRATAR" : "OURO INSUFICIENTE");
            const ariaLabel = isHired
                ? member.label + " já contratado"
                : "Contratar " + member.label + " por " + member.cost + " ouro";

            return `
                <article class="crew-card ${isHired ? "is-hired" : ""}">
                    <div class="crew-portrait">
                        <img src="${member.asset}" alt="${member.label}">
                    </div>
                    <div class="crew-info">
                        <h2>${member.label}</h2>
                        <p class="crew-bonus">+${member.bonusPercent}% ${bonusLabel}</p>
                        <p class="crew-price">🪙 ${member.cost} ouro</p>
                    </div>
                    <button type="button"
                            data-crew-id="${member.id}"
                            ${isHired || !canAfford ? "disabled" : ""}
                            aria-label="${ariaLabel}">
                        ${buttonLabel}
                    </button>
                </article>
            `;
        }).join("");

        const screen = document.createElement("section");
        screen.className = "crew-screen";
        screen.setAttribute("aria-label", "Taberna da Tripulação");

        screen.innerHTML = `
            <div class="crew-tavern-bg" aria-hidden="true"></div>
            <header class="crew-header">
                <button type="button" data-action="back" aria-label="Voltar">←</button>
                <div>
                    <small>TRIPULAÇÃO</small>
                    <h1>Taberna</h1>
                </div>
                <div class="crew-gold" aria-label="${state.wallet.coins} de ouro">🪙 ${state.wallet.coins}</div>
            </header>

            <section class="crew-summary" aria-label="Bônus ativos">
                <strong>Bônus ativos</strong>
                <span>XP +${bonuses.xp}%</span>
                <span>Ouro +${bonuses.coins}%</span>
                <span>Gemas +${bonuses.gems}%</span>
            </section>

            <main class="crew-list">${cards}</main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }

            const hireButton = event.target.closest("[data-crew-id]");
            if (!hireButton || hireButton.disabled) return;

            const member = crew.find((item) => item.id === hireButton.dataset.crewId);
            if (!member) return;

            onStateChange(TQ.domain.playerState.hireCrewMember(state, member));
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.crew = Object.freeze({ renderCrewScreen });
})(globalThis);
