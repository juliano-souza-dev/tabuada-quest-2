(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const BONUS_LABELS = Object.freeze({ xp: "XP", coins: "Ouro", gems: "Gemas" });

    function renderCrewScreen({ state, onStateChange, onNavigate }) {
        const crew = TQ.content.crewMembers || [];
        const hired = new Set(state.crew?.hiredIds || []);
        const bonuses = TQ.domain.playerState.getCrewBonusSummary(state, crew);

        const slots = crew.map((member) => {
            const isHired = hired.has(member.id);
            const canAfford = state.wallet.coins >= member.cost;
            const status = isHired ? "Membro da tripulação" : "Contratar";
            const ariaLabel = isHired
                ? member.label + " já faz parte da tripulação"
                : "Contratar " + member.label + " por " + member.cost + " ouro";

            return `
                <article class="crew-slot ${isHired ? "is-hired" : ""}" data-role="${member.id}">
                    <div class="crew-slot-portrait">
                        <img src="${member.asset}" alt="${member.label}">
                    </div>
                    <div class="crew-slot-footer">
                        <span class="crew-slot-price" aria-label="${member.cost} ouro">${member.cost.toLocaleString("pt-BR")}</span>
                        <button type="button" data-crew-id="${member.id}"
                            ${isHired || !canAfford ? "disabled" : ""}
                            aria-label="${ariaLabel}">${status}</button>
                    </div>
                </article>
            `;
        }).join("");

        const screen = document.createElement("section");
        screen.className = "crew-screen";
        screen.setAttribute("aria-label", "Taberna da Tripulação");
        screen.innerHTML = `
            <img class="crew-tavern-bg" src="${TQ.content.assets.tavern.background}" alt="" aria-hidden="true">
            <button class="crew-art-back" type="button" data-action="back" aria-label="Voltar"></button>
            <div class="crew-bonus-overlay" aria-label="Bônus ativos">
                <span>XP +${bonuses.xp}%</span>
                <span>Ouro +${bonuses.coins}%</span>
                <span>Gemas +${bonuses.gems}%</span>
            </div>
            <main class="crew-slots">${slots}</main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }
            const button = event.target.closest("[data-crew-id]");
            if (!button || button.disabled) return;
            const member = crew.find((item) => item.id === button.dataset.crewId);
            if (member) onStateChange(TQ.domain.playerState.hireCrewMember(state, member));
        });
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.crew = Object.freeze({ renderCrewScreen });
})(globalThis);
