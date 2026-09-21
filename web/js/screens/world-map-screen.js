(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderWorldMapScreen({ previewRegionId, onPreviewRegionChange, onNavigate }) {
        const regions = TQ.content.worldRegions || [];
        const selectedId = Number(previewRegionId) || null;

        const screen = document.createElement("section");
        screen.className = "world-map-screen";
        screen.setAttribute("aria-label", "Mapa Mundo");

        screen.innerHTML = `
            <header class="world-map-header">
                <button type="button" data-action="back" aria-label="Voltar para a Região">←</button>
                <div>
                    <small>MAPA MUNDO</small>
                    <h1>Regiões</h1>
                </div>
                <span class="world-map-count">${regions.length}</span>
            </header>

            <main class="world-map-content">
                <p class="world-map-intro">
                    Modo de validação: escolha qualquer Região para visualizar.
                </p>

                <div class="world-map-region-list">
                    ${regions.map((region) => {
                        const textMaps = TQ.content.getRegionTextMaps(region.id);
                        const isSelected = region.id === selectedId;
                        return `
                            <button type="button"
                                    class="world-map-region-item${isSelected ? " is-selected" : ""}"
                                    data-region-id="${region.id}"
                                    aria-label="Abrir Região ${region.id}, ${region.label}">
                                <span class="world-map-region-number">${String(region.id).padStart(2, "0")}</span>
                                <span class="world-map-region-copy">
                                    <strong>${region.label}</strong>
                                    <small>5 Ilhas${textMaps.length ? " • " + textMaps.length + " mapas cadastrados" : ""}</small>
                                </span>
                                <span class="world-map-region-arrow" aria-hidden="true">›</span>
                            </button>
                        `;
                    }).join("")}
                </div>
            </main>
        `;

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("islands");
                return;
            }

            const regionButton = event.target.closest("[data-region-id]");
            if (!regionButton) return;

            const regionId = Number(regionButton.dataset.regionId);
            if (!Number.isInteger(regionId) || regionId < 1 || regionId > 22) return;

            if (typeof onPreviewRegionChange === "function") {
                onPreviewRegionChange(regionId);
            }
            onNavigate("islands");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.worldMap = Object.freeze({
        renderWorldMapScreen
    });
})(globalThis);
