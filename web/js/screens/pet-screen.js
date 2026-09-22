(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function resolvePetAsset(petReward, pet) {
        return petReward?.asset
            || pet?.asset
            || TQ.content?.assets?.pet
            || "";
    }

    function resolvePetBonusText(petReward, pet) {
        return petReward?.bonusText
            || petReward?.bonusLabel
            || pet?.bonusText
            || pet?.bonusLabel
            || pet?.bonus?.label
            || "";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderPetScreen({ state, onNavigate, rewardReturnScreen }) {
        const result = state.learning.lastResult;
        const petReward = result?.reward?.structural?.find((reward) => reward.type === "pet") || null;
        const pet = petReward ? TQ.content.getPet?.(petReward.petId) : null;

        const screen = document.createElement("section");
        screen.setAttribute("aria-label", "Pet resgatado");

        if (!petReward) {
            screen.className = "slice-screen result-text-screen pet-reward-screen";
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <h1>Nenhum PET pendente</h1>
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        } else {
            const background = TQ.content.assets.global.petRescueScreen;
            const petAsset = resolvePetAsset(petReward, pet);
            const bonusText = resolvePetBonusText(petReward, pet);
            const petLabel = pet?.label || "Pet resgatado";

            screen.className = "pet-rescue-art-screen";
            screen.innerHTML = `
                <main class="pet-rescue-stage">
                    <img
                        class="pet-rescue-background"
                        src="${background}"
                        alt=""
                        aria-hidden="true"
                        draggable="false">

                    <div class="pet-rescue-dynamic-layer">
                        ${petAsset ? `
                            <img
                                class="pet-rescue-pet"
                                src="${petAsset}"
                                alt="${escapeHtml(petLabel)}"
                                draggable="false">
                        ` : ""}

                        <div
                            class="pet-rescue-bonus"
                            ${bonusText ? "" : 'aria-hidden="true"'}
                        >
                            <span class="pet-rescue-bonus-intro">Como recompensa, você agora recebe bônus de:</span>
                            <strong class="pet-rescue-bonus-value">${escapeHtml(bonusText)}</strong>
                        </div>

                        <button
                            class="pet-rescue-continue"
                            type="button"
                            data-action="continue"
                            aria-label="Zarpar">
                            <span class="visually-hidden">Zarpar</span>
                        </button>
                    </div>
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
    TQ.screens.pet = Object.freeze({
        renderPetScreen,
        resolvePetAsset,
        resolvePetBonusText
    });
})(globalThis);
