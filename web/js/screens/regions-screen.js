(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderRegionsScreen() {
        const screen = document.createElement("section");
        screen.className = "regions-screen";
        screen.setAttribute("aria-label", "Composição estática da tela de Regiões");
        screen.innerHTML = `
            <div class="regions-static-composition">
                <div class="regions-static-header" aria-hidden="true">
                    <img src="${TQ.content.assets.regionsHeaderStatic}" alt="">
                </div>
                <div class="regions-static-map" aria-hidden="true">
                    <img src="${TQ.content.assets.regionsMapStatic}" alt="">
                </div>
            </div>
        `;
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.regions = Object.freeze({ renderRegionsScreen });
})(globalThis);
