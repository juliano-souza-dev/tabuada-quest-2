(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const WORLD_MAP_REGION_HITBOXES = Object.freeze({
        1: Object.freeze({ x: 3, y: 2, width: 47, height: 25 }),
        2: Object.freeze({ x: 49, y: 13, width: 48, height: 28 }),
        3: Object.freeze({ x: 2, y: 32, width: 49, height: 27 }),
        4: Object.freeze({ x: 9, y: 59, width: 82, height: 37 }),

        5: Object.freeze({ x: 12, y: 6, width: 55, height: 22 }),
        6: Object.freeze({ x: 34, y: 27, width: 62, height: 23 }),
        7: Object.freeze({ x: 8, y: 49, width: 62, height: 25 }),
        8: Object.freeze({ x: 15, y: 72, width: 75, height: 24 }),

        9: Object.freeze({ x: 2, y: 7, width: 51, height: 25 }),
        10: Object.freeze({ x: 49, y: 27, width: 49, height: 22 }),
        11: Object.freeze({ x: 2, y: 47, width: 52, height: 24 }),
        12: Object.freeze({ x: 48, y: 63, width: 50, height: 24 }),

        13: Object.freeze({ x: 2, y: 7, width: 51, height: 24 }),
        14: Object.freeze({ x: 49, y: 27, width: 49, height: 22 }),
        15: Object.freeze({ x: 2, y: 47, width: 52, height: 22 }),
        16: Object.freeze({ x: 48, y: 62, width: 50, height: 22 }),

        21: Object.freeze({ x: 9, y: 11, width: 83, height: 31 }),
        22: Object.freeze({ x: 8, y: 57, width: 84, height: 31 })
    });

    function hotspotStyle(rect) {
        return [
            `left:${rect.x}%`,
            `top:${rect.y}%`,
            `width:${rect.width}%`,
            `height:${rect.height}%`
        ].join(";");
    }

    function findInitialChartIndex(charts, regionId) {
        const exact = charts.findIndex((chart) => chart.regionIds.includes(regionId));
        if (exact >= 0) return exact;

        let fallbackIndex = 0;
        charts.forEach((chart, index) => {
            if ((chart.regionIds[0] || 1) < regionId) fallbackIndex = index;
        });
        return fallbackIndex;
    }

    function renderWorldMapScreen({ state, onStateChange, onNavigate, worldMapReturnScreen }) {
        const charts = Array.from(TQ.content.assets.global.worldMapCharts || []);
        const fallbackAsset = TQ.content.assets.global.worldMapVisual;
        const availableCharts = charts.length
            ? charts
            : [{ id: 1, regionIds: [1, 2], asset: fallbackAsset }];

        let chartIndex = findInitialChartIndex(
            availableCharts,
            Number(state?.campaign?.currentRegionId) || 1
        );

        const initialChart = availableCharts[chartIndex];

        const screen = document.createElement("section");
        screen.className = "world-map-screen is-map-loading";
        screen.setAttribute("aria-label", "Mapa Mundo");
        screen.style.setProperty("--world-map-bleed-image", `url("${initialChart.asset}")`);

        screen.innerHTML = `
            <button type="button"
                class="global-home-button"
                data-action="home"
                aria-label="Voltar para Home">Home</button>

            <div class="tq-safe-visual-area">
            <main class="world-map-stage tq-canonical-stage">
                <img class="world-map-art"
                    src="${initialChart.asset}"
                    alt=""
                    aria-hidden="true">

                <div class="world-map-regions"></div>

                <button type="button"
                    class="world-map-back"
                    data-action="back"
                    aria-label="Voltar">←</button>

                <button type="button"
                    class="world-map-page-nav world-map-page-prev"
                    data-action="previous-chart"
                    aria-label="Carta náutica anterior">‹</button>

                <button type="button"
                    class="world-map-page-nav world-map-page-next"
                    data-action="next-chart"
                    aria-label="Próxima carta náutica">›</button>

                <div class="world-map-page-count" aria-live="polite"></div>

                <div class="world-map-page-loader" role="status" aria-label="Carregando carta náutica">
                    <div class="tq-ocean-loader-host"></div>
                </div>
            </main>
            </div>
        `;

        const stage = screen.querySelector(".world-map-stage");
        const art = screen.querySelector(".world-map-art");
        const regionsLayer = screen.querySelector(".world-map-regions");
        const prevButton = screen.querySelector('[data-action="previous-chart"]');
        const nextButton = screen.querySelector('[data-action="next-chart"]');
        const pageCount = screen.querySelector(".world-map-page-count");
        TQ.core.oceanLoader?.mount(screen.querySelector(".world-map-page-loader .tq-ocean-loader-host"));

        function renderHotspots(chart) {
            regionsLayer.innerHTML = chart.regionIds.map((regionId) => {
                const region = TQ.content.getWorldRegion?.(regionId)
                    || TQ.content.regions.find((item) => item.id === regionId);
                const status = TQ.domain.playerState.getRegionStatus(state, regionId);
                const locked = status === "locked";
                const rect = WORLD_MAP_REGION_HITBOXES[regionId];

                if (!rect) return "";

                return `
                    <button type="button"
                        class="world-map-region-hotspot${locked ? " is-locked" : ""}"
                        style="${hotspotStyle(rect)}"
                        data-region-id="${regionId}"
                        ${locked ? "disabled" : ""}
                        aria-label="${region?.label || `Região ${regionId}`}${locked ? ", bloqueada" : ", abrir Região"}">
                        
                    </button>
                `;
            }).join("");
        }

        function updateNavigation() {
            prevButton.disabled = chartIndex <= 0;
            nextButton.disabled = chartIndex >= availableCharts.length - 1;
            pageCount.textContent = `${chartIndex + 1} / ${availableCharts.length}`;
        }

        function warmAdjacentCharts() {
            [chartIndex - 1, chartIndex + 1].forEach((index) => {
                if (index < 0 || index >= availableCharts.length) return;
                const image = new Image();
                image.src = availableCharts[index].asset;
            });
        }

        function revealLoadedChart() {
            screen.classList.remove("is-map-loading");
            warmAdjacentCharts();
        }

        function applyChart(nextIndex) {
            if (nextIndex < 0 || nextIndex >= availableCharts.length || nextIndex === chartIndex) return;

            const nextChart = availableCharts[nextIndex];
            screen.classList.add("is-map-loading");
            const loaderStartedAt = performance.now();
            const MIN_LOADER_MS = 900;

            const preload = new Image();
            preload.onload = () => {
                chartIndex = nextIndex;
                art.src = nextChart.asset;
                screen.style.setProperty("--world-map-bleed-image", `url("${nextChart.asset}")`);
                renderHotspots(nextChart);
                updateNavigation();

                const elapsed = performance.now() - loaderStartedAt;
                root.setTimeout(() => {
                    root.requestAnimationFrame(() => {
                        root.requestAnimationFrame(revealLoadedChart);
                    });
                }, Math.max(0, MIN_LOADER_MS - elapsed));
            };
            preload.onerror = revealLoadedChart;
            preload.src = nextChart.asset;

            if (preload.complete && preload.naturalWidth > 0) {
                preload.onload();
            }
        }

        renderHotspots(initialChart);
        updateNavigation();

        if (art.complete && art.naturalWidth > 0) {
            revealLoadedChart();
        } else {
            art.addEventListener("load", revealLoadedChart, { once: true });
            art.addEventListener("error", revealLoadedChart, { once: true });
        }

        TQ.core.safeViewport.bindCanonicalStage(
            screen.querySelector(".tq-safe-visual-area"),
            stage
        );

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="home"]')) {
                onNavigate("home");
                return;
            }

            if (event.target.closest('[data-action="back"]')) {
                onNavigate(worldMapReturnScreen || "home");
                return;
            }

            if (event.target.closest('[data-action="previous-chart"]')) {
                applyChart(chartIndex - 1);
                return;
            }

            if (event.target.closest('[data-action="next-chart"]')) {
                applyChart(chartIndex + 1);
                return;
            }

            const regionButton = event.target.closest("[data-region-id]");
            if (!regionButton || regionButton.disabled) return;

            const regionId = Number(regionButton.dataset.regionId);
            const currentChart = availableCharts[chartIndex];
            if (!currentChart.regionIds.includes(regionId)) return;

            const status = TQ.domain.playerState.getRegionStatus(state, regionId);
            if (status === "locked") return;

            const loader = document.createElement("div");
            loader.className = "region-transition-loader";
            loader.setAttribute("role", "status");
            loader.setAttribute("aria-label", "Carregando Região");
            loader.innerHTML = '<div class="tq-ocean-loader-host"></div>';
            screen.appendChild(loader);
            TQ.core.oceanLoader?.mount(loader.querySelector(".tq-ocean-loader-host"));

            const selected = TQ.domain.playerState.selectRegion(state, regionId);
            root.setTimeout(() => {
                root.requestAnimationFrame(() => {
                    onStateChange(TQ.domain.playerState.withLastScreen(selected, "islands"));
                });
            }, 900);
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.worldMap = Object.freeze({
        WORLD_MAP_REGION_HITBOXES,
        renderWorldMapScreen
    });
})(globalThis);
