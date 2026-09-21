(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderPetScreen({ state, onNavigate, rewardReturnScreen }) {
        const result = state.learning.lastResult;
        const petReward = result?.reward?.structural?.find((reward) => reward.type === "pet") || null;
        const pet = petReward ? TQ.content.getPet?.(petReward.petId) : null;

        const screen = document.createElement("section");
        screen.className = "slice-screen result-text-screen pet-reward-screen";
        screen.setAttribute("aria-label", "PET resgatado");

        if (!petReward) {
            screen.innerHTML = `
                <main class="slice-content result-card">
                    <h1>Nenhum PET pendente</h1>
                    <button type="button" data-action="continue">Continuar</button>
                </main>
            `;
        } else {
            screen.innerHTML = `
                <main class="slice-content result-card pet-reward-card">
                    <small>Nova companhia</small>
                    <div class="pet-reward-icon" aria-hidden="true">🐾</div>
                    <h1>${pet?.label || "PET"} chegou para a tripulação!</h1>
                    <p>Você encontrou um novo companheiro nesta jornada.</p>
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
    TQ.screens.pet = Object.freeze({ renderPetScreen });
})(globalThis);
