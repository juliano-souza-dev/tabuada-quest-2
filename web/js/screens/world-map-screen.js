(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const WORLD_MAP_REGION_HITBOXES = Object.freeze({
        1: Object.freeze({ x: 3.2, y: 2.4, width: 46.5, height: 27.5 }),
        2: Object.freeze({ x: 50.2, y: 14.2, width: 46.2, height: 27.8 })
    });

    function hotspotStyle(rect) {
        return [
            `left:${rect.x}%`,
            `top:${rect.y}%`,
            `width:${rect.width}%`,
            `height:${rect.height}%`
        ].join(";");
    }

    function renderWorldMapScreen({ state, onStateChange, onNavigate, worldMapReturnScreen }) {
        const screen = document.createElement("section");
        screen.className = "world-map-screen";
        screen.setAttribute("aria-label", "Mapa Mundo");

        const visibleRegionIds = [1, 2];

        screen.innerHTML = `
            <button type="button"
                class="global-home-button"
                data-action="home"
                aria-label="Voltar para Home">Home</button>

            <main class="world-map-stage">
                <img class="world-map-art"
                    src="${TQ.content.assets.global.worldMapVisual}"
                    alt=""
                    aria-hidden="true">

                <button type="button"
                    class="world-map-back"
                    data-action="back"
                    aria-label="Voltar">←</button>

                ${visibleRegionIds.map((regionId) => {
                    const region = TQ.content.getWorldRegion?.(regionId)
                        || TQ.content.regions.find((item) => item.id === regionId);
                    const status = TQ.domain.playerState.getRegionStatus(state, regionId);
                    const locked = status === "locked";
                    const rect = WORLD_MAP_REGION_HITBOXES[regionId];

                    return `
                        <button type="button"
                            class="world-map-region-hotspot${locked ? " is-locked" : ""}"
                            style="${hotspotStyle(rect)}"
                            data-region-id="${regionId}"
                            ${locked ? "disabled" : ""}
                            aria-label="${region?.label || `Região ${regionId}`}${locked ? ", bloqueada" : ", abrir Região"}">
                            ${locked ? '<span class="world-map-region-lock" aria-hidden="true">🔒</span>' : ""}
                        </button>
                    `;
                }).join("")}
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="home"]')) {
                onNavigate("home");
                return;
            }

            if (event.target.closest('[data-action="back"]')) {
                onNavigate(worldMapReturnScreen || "home");
                return;
            }

            const regionButton = event.target.closest("[data-region-id]");
            if (!regionButton || regionButton.disabled) return;

            const regionId = Number(regionButton.dataset.regionId);
            if (![1, 2].includes(regionId)) return;

            const status = TQ.domain.playerState.getRegionStatus(state, regionId);
            if (status === "locked") return;

            const selected = TQ.domain.playerState.selectRegion(state, regionId);
            onStateChange(TQ.domain.playerState.withLastScreen(selected, "islands"));
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.worldMap = Object.freeze({
        WORLD_MAP_REGION_HITBOXES,
        renderWorldMapScreen
    });
})(globalThis);
