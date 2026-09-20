(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const REGIONS_LAYOUT = Object.freeze({
        viewport: Object.freeze({ width: 941, height: 1672 }),
        back: Object.freeze({ x: 8, y: 8, width: 112, height: 112 }),
        regions: Object.freeze({
            1: Object.freeze({
                number: Object.freeze({ x: 135, y: 310, width: 48, height: 50 }),
                title: Object.freeze({ x: 84, y: 372, width: 148, height: 33 }),
                status: Object.freeze({ x: 82, y: 420, width: 154, height: 35 }),
                hitbox: Object.freeze({ x: 48, y: 245, width: 220, height: 222 })
            }),
            2: Object.freeze({
                number: Object.freeze({ x: 446, y: 310, width: 48, height: 50 }),
                title: Object.freeze({ x: 396, y: 372, width: 148, height: 33 }),
                status: Object.freeze({ x: 392, y: 420, width: 156, height: 35 }),
                hitbox: Object.freeze({ x: 356, y: 245, width: 230, height: 222 })
            }),
            3: Object.freeze({
                number: Object.freeze({ x: 754, y: 310, width: 48, height: 50 }),
                title: Object.freeze({ x: 706, y: 372, width: 147, height: 33 }),
                status: Object.freeze({ x: 700, y: 420, width: 157, height: 35 }),
                hitbox: Object.freeze({ x: 670, y: 245, width: 220, height: 222 })
            }),
            4: Object.freeze({
                number: Object.freeze({ x: 136, y: 598, width: 48, height: 50 }),
                title: Object.freeze({ x: 87, y: 663, width: 145, height: 33 }),
                status: Object.freeze({ x: 82, y: 712, width: 155, height: 35 }),
                hitbox: Object.freeze({ x: 48, y: 535, width: 220, height: 225 })
            }),
            5: Object.freeze({
                number: Object.freeze({ x: 448, y: 600, width: 48, height: 50 }),
                title: Object.freeze({ x: 398, y: 663, width: 145, height: 33 }),
                status: Object.freeze({ x: 392, y: 712, width: 155, height: 35 }),
                hitbox: Object.freeze({ x: 356, y: 535, width: 230, height: 225 })
            }),
            6: Object.freeze({
                number: Object.freeze({ x: 754, y: 598, width: 48, height: 50 }),
                title: Object.freeze({ x: 706, y: 663, width: 145, height: 33 }),
                status: Object.freeze({ x: 700, y: 712, width: 155, height: 35 }),
                hitbox: Object.freeze({ x: 670, y: 535, width: 220, height: 225 })
            }),
            7: Object.freeze({
                number: Object.freeze({ x: 137, y: 879, width: 48, height: 50 }),
                title: Object.freeze({ x: 87, y: 941, width: 145, height: 30 }),
                status: Object.freeze({ x: 82, y: 987, width: 155, height: 34 }),
                hitbox: Object.freeze({ x: 48, y: 815, width: 220, height: 220 })
            }),
            8: Object.freeze({
                number: Object.freeze({ x: 439, y: 877, width: 48, height: 50 }),
                title: Object.freeze({ x: 397, y: 941, width: 146, height: 30 }),
                status: Object.freeze({ x: 392, y: 987, width: 154, height: 34 }),
                hitbox: Object.freeze({ x: 356, y: 815, width: 230, height: 220 })
            }),
            9: Object.freeze({
                number: Object.freeze({ x: 754, y: 879, width: 48, height: 50 }),
                title: Object.freeze({ x: 706, y: 941, width: 144, height: 30 }),
                status: Object.freeze({ x: 700, y: 987, width: 155, height: 34 }),
                hitbox: Object.freeze({ x: 670, y: 815, width: 220, height: 220 })
            }),
            10: Object.freeze({
                number: Object.freeze({ x: 165, y: 1156, width: 48, height: 50 }),
                title: Object.freeze({ x: 111, y: 1221, width: 150, height: 34 }),
                status: Object.freeze({ x: 105, y: 1271, width: 160, height: 35 }),
                hitbox: Object.freeze({ x: 70, y: 1080, width: 235, height: 245 })
            }),
            11: Object.freeze({
                number: Object.freeze({ x: 661, y: 1144, width: 48, height: 50 }),
                title: Object.freeze({ x: 565, y: 1208, width: 260, height: 35 }),
                fragments: Object.freeze({ x: 702, y: 1264, width: 86, height: 22 }),
                island10Label: Object.freeze({ x: 820, y: 1263, width: 78, height: 24 }),
                mapState: Object.freeze({ x: 616, y: 1307, width: 175, height: 34 }),
                island10State: Object.freeze({ x: 818, y: 1307, width: 82, height: 34 }),
                finalChest: Object.freeze({ x: 558, y: 1487, width: 268, height: 35 }),
                hitbox: Object.freeze({ x: 525, y: 1080, width: 390, height: 300 })
            })
        })
    });

    function rectStyle(rect) {
        return `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px`;
    }

    function computeStageGeometry(viewportWidth, viewportHeight) {
        const width = Number(viewportWidth) || 0;
        const height = Number(viewportHeight) || 0;
        const scale = Math.max(
            width / REGIONS_LAYOUT.viewport.width,
            height / REGIONS_LAYOUT.viewport.height
        );
        const renderWidth = REGIONS_LAYOUT.viewport.width * scale;
        const renderHeight = REGIONS_LAYOUT.viewport.height * scale;
        return Object.freeze({
            scale,
            renderWidth,
            renderHeight,
            offsetX: (width - renderWidth) / 2,
            offsetY: (height - renderHeight) / 2
        });
    }

    function formatRegionStatus(status, islandsCompleted, islandsTotal) {
        const completed = Number.isInteger(islandsCompleted) ? islandsCompleted : 0;
        const total = Number.isInteger(islandsTotal) ? islandsTotal : 10;
        if (status === "locked") return "BLOQUEADA 🔒";
        if (status === "completed") return `${total}/${total} • CONCLUÍDA ✓`;
        if (status === "in_progress") return `${completed}/${total} • CONTINUAR`;
        return `${completed}/${total} • EXPLORAR`;
    }

    function formatIsland10State(journey) {
        if (journey.island10Completed) return "CONCLUÍDA ✓";
        if (journey.island10Unlocked) return "DISPONÍVEL";
        return "BLOQUEADA 🔒";
    }

    function formatFinalChestState(journey) {
        if (journey.finalGrandChestClaimed) return "RESGATADO ✓";
        if (journey.finalGrandChestUnlocked) return "ABRIR BAÚ";
        return "BLOQUEADO 🔒";
    }

    function renderRegion(state, region) {
        const layout = REGIONS_LAYOUT.regions[region.id];
        const progress = state.campaign.regionProgress[String(region.id)];
        const status = TQ.domain.playerState.getRegionStatus(state, region.id);
        const isCurrent = state.campaign.currentRegionId === region.id;

        return `
            <div class="region-dynamic is-${status}${isCurrent ? " is-current" : ""}" data-region-ui="${region.id}">
                <span class="regions-slot region-number" style="${rectStyle(layout.number)}">${region.id}</span>
                <span class="regions-slot region-title" style="${rectStyle(layout.title)}">${region.label.toUpperCase()}</span>
                <span class="regions-slot region-status" style="${rectStyle(layout.status)}">${formatRegionStatus(status, progress.islandsCompleted, progress.islandsTotal)}</span>
                <button class="region-hitbox" type="button"
                    style="${rectStyle(layout.hitbox)}"
                    data-region-id="${region.id}"
                    ${status === "locked" ? 'aria-disabled="true"' : ""}
                    aria-label="${region.label}, ${progress.islandsCompleted} de ${progress.islandsTotal}, ${formatRegionStatus(status, progress.islandsCompleted, progress.islandsTotal)}">
                </button>
            </div>
        `;
    }

    function renderFinalRegion(state) {
        const layout = REGIONS_LAYOUT.regions[11];
        const progress = state.campaign.regionProgress["11"];
        const status = TQ.domain.playerState.getRegionStatus(state, 11);
        const journey = state.campaign.finalJourney;
        const isCurrent = state.campaign.currentRegionId === 11;

        return `
            <div class="region-dynamic final-region-dynamic is-${status}${isCurrent ? " is-current" : ""}" data-region-ui="11">
                <span class="regions-slot region-number" style="${rectStyle(layout.number)}">11</span>
                <span class="regions-slot final-region-title" style="${rectStyle(layout.title)}">REGIÃO 11</span>
                <span class="regions-slot final-fragments" style="${rectStyle(layout.fragments)}">${journey.finalMapFragments}/9</span>
                <span class="regions-slot final-island-label" style="${rectStyle(layout.island10Label)}">ILHA 10</span>
                <span class="regions-slot final-map-state" style="${rectStyle(layout.mapState)}">${journey.finalMapCompleted ? "MAPA COMPLETO ✓" : "MAPA INCOMPLETO"}</span>
                <span class="regions-slot final-island-state" style="${rectStyle(layout.island10State)}">${formatIsland10State(journey)}</span>
                <span class="regions-slot final-chest-state" style="${rectStyle(layout.finalChest)}">${formatFinalChestState(journey)}</span>
                <button class="region-hitbox" type="button"
                    style="${rectStyle(layout.hitbox)}"
                    data-region-id="11"
                    ${status === "locked" ? 'aria-disabled="true"' : ""}
                    aria-label="Região 11, ${progress.islandsCompleted} de ${progress.islandsTotal}, ${formatRegionStatus(status, progress.islandsCompleted, progress.islandsTotal)}">
                </button>
            </div>
        `;
    }

    function renderRegionsScreen({ state, onStateChange, onNavigate }) {
        const screen = document.createElement("section");
        screen.className = "regions-screen";
        screen.setAttribute("aria-label", "Mapa de Regiões");
        screen.innerHTML = `
            <div class="regions-canonical-stage">
                <img class="regions-map-image" src="${TQ.content.assets.regionsMapStatic}" alt="" aria-hidden="true">
                <button class="regions-back-hitbox" type="button"
                    style="${rectStyle(REGIONS_LAYOUT.back)}"
                    data-action="back"
                    aria-label="Voltar para a tela inicial">
                </button>
                ${TQ.content.regions.filter((region) => region.id <= 10).map((region) => renderRegion(state, region)).join("")}
                ${renderFinalRegion(state)}
            </div>
        `;

        const stage = screen.querySelector(".regions-canonical-stage");

        function applyStageGeometry() {
            if (!screen.isConnected && screen.parentNode === null) return;
            const geometry = computeStageGeometry(screen.clientWidth, screen.clientHeight);
            stage.style.left = `${geometry.offsetX}px`;
            stage.style.top = `${geometry.offsetY}px`;
            stage.style.transform = `scale(${geometry.scale})`;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }

            const regionButton = event.target.closest("[data-region-id]");
            if (!regionButton) return;

            const regionId = Number(regionButton.dataset.regionId);
            const status = TQ.domain.playerState.getRegionStatus(state, regionId);
            if (status === "locked") return;

            const selected = TQ.domain.playerState.selectRegion(state, regionId);
            onStateChange(TQ.domain.playerState.withLastScreen(selected, "islands"));
        });

        if (typeof root.ResizeObserver === "function") {
            const observer = new root.ResizeObserver(() => {
                if (!screen.isConnected) {
                    observer.disconnect();
                    return;
                }
                applyStageGeometry();
            });
            observer.observe(screen);
        } else {
            root.addEventListener("resize", applyStageGeometry, { passive: true, once: true });
        }

        root.requestAnimationFrame
            ? root.requestAnimationFrame(applyStageGeometry)
            : setTimeout(applyStageGeometry, 0);

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.regions = Object.freeze({
        renderRegionsScreen,
        REGIONS_LAYOUT,
        computeStageGeometry,
        formatRegionStatus,
        formatIsland10State,
        formatFinalChestState
    });
})(globalThis);
