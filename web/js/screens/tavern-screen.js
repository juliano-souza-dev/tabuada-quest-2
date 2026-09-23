(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderTavernScreen({ onNavigate }) {
        const screen = document.createElement("section");
        screen.className = "tavern-screen";
        screen.setAttribute("aria-label", "Taberna");
        screen.innerHTML = `
            <img class="tavern-background" src="${TQ.content.assets.tavern.background}" alt="" aria-hidden="true">
            <button class="global-home-button" type="button" data-action="home" aria-label="Voltar para Home">Home</button>
        `;
        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="home"]')) onNavigate("home");
        });
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.tavern = Object.freeze({ renderTavernScreen });
})(globalThis);
