(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    let activeCleanup = null;

    function integer(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
    }

    function clampInteger(value, min, max) {
        return Math.min(max, Math.max(min, integer(value, min)));
    }

    function uniqueSorted(values) {
        return Array.from(new Set(values)).sort((a, b) => a - b);
    }

    function normalize(state) {
        return TQ.domain.playerState.normalizeState(state);
    }

    function withResources(state, values) {
        const s = normalize(state);
        return {
            ...s,
            progression: {
                ...s.progression,
                level: Math.max(1, integer(values.level, s.progression.level)),
                xpCurrent: 0
            },
            wallet: {
                ...s.wallet,
                coins: Math.max(0, integer(values.coins, s.wallet.coins)),
                gems: Math.max(0, integer(values.gems, s.wallet.gems))
            }
        };
    }

    function withUnlockedRegion(state, regionId) {
        const s = normalize(state);
        const id = clampInteger(regionId, 1, TQ.domain.playerState.TOTAL_REGIONS);
        return {
            ...s,
            campaign: {
                ...s.campaign,
                currentRegionId: id,
                unlockedRegionIds: uniqueSorted([...s.campaign.unlockedRegionIds, id])
            }
        };
    }

    function withUnlockedRegionsThrough(state, regionId) {
        const s = normalize(state);
        const id = clampInteger(regionId, 1, TQ.domain.playerState.TOTAL_REGIONS);
        const ids = Array.from({ length: id }, (_, index) => index + 1);
        return {
            ...s,
            campaign: {
                ...s.campaign,
                currentRegionId: id,
                unlockedRegionIds: uniqueSorted([...s.campaign.unlockedRegionIds, ...ids])
            }
        };
    }

    function withAllRegionsUnlocked(state) {
        return withUnlockedRegionsThrough(state, TQ.domain.playerState.TOTAL_REGIONS);
    }

    function withIslandPrepared(state, regionId, islandId) {
        let s = withUnlockedRegion(state, regionId);
        const normalizedRegionId = clampInteger(regionId, 1, TQ.domain.playerState.TOTAL_REGIONS);
        const normalizedIslandId = clampInteger(islandId, 1, TQ.domain.playerState.ISLANDS_PER_REGION);
        const completed = new Set(s.campaign.completedIslandIds);

        for (let id = 1; id < normalizedIslandId; id += 1) {
            completed.add(TQ.domain.playerState.islandTravelKey(normalizedRegionId, id));
        }

        const previousProgress = s.campaign.regionProgress[String(normalizedRegionId)];
        const regionProgress = {
            ...s.campaign.regionProgress,
            [String(normalizedRegionId)]: {
                ...previousProgress,
                islandsCompleted: Math.max(
                    Number(previousProgress?.islandsCompleted) || 0,
                    normalizedIslandId - 1
                ),
                islandsTotal: TQ.domain.playerState.ISLANDS_PER_REGION
            }
        };

        let finalJourney = { ...s.campaign.finalJourney };
        if (normalizedRegionId === TQ.domain.playerState.TOTAL_REGIONS
            && normalizedIslandId === TQ.domain.playerState.ISLANDS_PER_REGION) {
            finalJourney = {
                ...finalJourney,
                finalMapFragments: 9,
                finalMapCompleted: true,
                finalIslandUnlocked: true
            };
        }

        return normalize({
            ...s,
            campaign: {
                ...s.campaign,
                currentRegionId: normalizedRegionId,
                currentIslandId: normalizedIslandId,
                completedIslandIds: Array.from(completed),
                regionProgress,
                finalJourney
            },
            learning: {
                ...s.learning,
                activeSession: null
            }
        });
    }

    function withSpecialMapUnlocked(state, mapId) {
        const s = normalize(state);
        const id = String(clampInteger(mapId, 1, 5));
        const current = s.campaign.specialMaps[id] || {};
        return normalize({
            ...s,
            campaign: {
                ...s.campaign,
                specialMaps: {
                    ...s.campaign.specialMaps,
                    [id]: {
                        ...current,
                        fragments: 4,
                        missionStatus: "map_complete_mission_pending",
                        rewardClaimed: false,
                        mission: null,
                        lastMissionResult: null
                    }
                }
            }
        });
    }

    function withAllSpecialMapsUnlocked(state) {
        let next = normalize(state);
        for (let mapId = 1; mapId <= 5; mapId += 1) {
            next = withSpecialMapUnlocked(next, mapId);
        }
        return next;
    }

    function regionLabel(regionId) {
        const region = Array.isArray(TQ.content?.regions)
            ? TQ.content.regions.find((item) => item.id === regionId)
            : null;
        return region?.label || ("Região " + regionId);
    }

    function islandLabel(regionId, islandId) {
        return TQ.content?.getIslandIdentity?.(regionId, islandId)?.label || ("Ilha " + islandId);
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const getState = typeof options.getState === "function"
            ? options.getState
            : () => options.state;
        const onCommit = typeof options.onCommit === "function" ? options.onCommit : () => {};
        const onOpenIsland = typeof options.onOpenIsland === "function" ? options.onOpenIsland : () => {};
        const onOpenRegion = typeof options.onOpenRegion === "function" ? options.onOpenRegion : () => {};

        let currentState = normalize(getState());
        const totalRegions = TQ.domain.playerState.TOTAL_REGIONS;
        const islandsPerRegion = TQ.domain.playerState.ISLANDS_PER_REGION;

        const host = document.createElement("aside");
        host.className = "tq-settings-dev";
        host.innerHTML = `
            <button type="button" class="tq-settings-dev-toggle">SET</button>
            <section class="tq-settings-dev-panel" hidden>
                <header>
                    <strong>SET · Estado do jogo</strong>
                    <span data-set-status>Pronto</span>
                </header>

                <fieldset>
                    <legend>Recursos</legend>
                    <div class="tq-settings-dev-grid">
                        <label>Ouro<input data-set-coins type="number" min="0" step="100"></label>
                        <label>Rubis<input data-set-gems type="number" min="0" step="10"></label>
                        <label>Nível<input data-set-level type="number" min="1" step="1"></label>
                    </div>
                    <button type="button" data-set-resources>Aplicar recursos</button>
                </fieldset>

                <fieldset>
                    <legend>Regiões</legend>
                    <label>Região<select data-set-region></select></label>
                    <div class="tq-settings-dev-actions">
                        <button type="button" data-set-unlock-region>Liberar região</button>
                        <button type="button" data-set-open-region>Abrir região</button>
                    </div>
                    <div class="tq-settings-dev-actions">
                        <button type="button" data-set-unlock-through>Liberar até aqui</button>
                        <button type="button" data-set-unlock-all-regions>Liberar todas</button>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Ilhas</legend>
                    <div class="tq-settings-dev-grid">
                        <label>Região<select data-set-island-region></select></label>
                        <label>Ilha<select data-set-island></select></label>
                    </div>
                    <button type="button" data-set-prepare-island>Liberar ilha selecionada</button>
                    <button type="button" data-set-open-island>Abrir ilha no fluxo normal</button>
                    <small>Abrir ilha usa a mesma sessão do jogo: desafio, resultado e recompensas continuam normais.</small>
                </fieldset>

                <fieldset>
                    <legend>Mapas especiais</legend>
                    <label>Mapa<select data-set-map></select></label>
                    <div class="tq-settings-dev-actions">
                        <button type="button" data-set-unlock-map>Liberar mapa</button>
                        <button type="button" data-set-unlock-all-maps>Liberar todos</button>
                    </div>
                </fieldset>

                <button type="button" class="tq-settings-dev-reset" data-set-reset>Restaurar progresso inicial</button>
            </section>
        `;
        document.body.appendChild(host);

        const panel = host.querySelector(".tq-settings-dev-panel");
        const status = host.querySelector("[data-set-status]");
        const coins = host.querySelector("[data-set-coins]");
        const gems = host.querySelector("[data-set-gems]");
        const level = host.querySelector("[data-set-level]");
        const regionSelect = host.querySelector("[data-set-region]");
        const islandRegionSelect = host.querySelector("[data-set-island-region]");
        const islandSelect = host.querySelector("[data-set-island]");
        const mapSelect = host.querySelector("[data-set-map]");

        const regionOptions = Array.from({ length: totalRegions }, (_, index) => {
            const id = index + 1;
            return { id, label: String(id).padStart(2, "0") + " · " + regionLabel(id) };
        });

        function fillSelect(select, entries) {
            select.replaceChildren(...entries.map((entry) => {
                const option = document.createElement("option");
                option.value = String(entry.id);
                option.textContent = entry.label;
                return option;
            }));
        }

        fillSelect(regionSelect, regionOptions);
        fillSelect(islandRegionSelect, regionOptions);
        fillSelect(mapSelect, Array.from({ length: 5 }, (_, index) => ({
            id: index + 1,
            label: "Mapa especial " + (index + 1)
        })));

        function refreshIslandOptions() {
            const regionId = Number(islandRegionSelect.value) || 1;
            fillSelect(islandSelect, Array.from({ length: islandsPerRegion }, (_, index) => {
                const islandId = index + 1;
                return {
                    id: islandId,
                    label: islandId + " · " + islandLabel(regionId, islandId)
                };
            }));
        }

        function sync() {
            currentState = normalize(getState() || currentState);
            coins.value = String(currentState.wallet.coins);
            gems.value = String(currentState.wallet.gems);
            level.value = String(currentState.progression.level);
            regionSelect.value = String(currentState.campaign.currentRegionId);
            islandRegionSelect.value = String(currentState.campaign.currentRegionId);
            refreshIslandOptions();
            islandSelect.value = String(currentState.campaign.currentIslandId);
        }

        function commit(nextState, message) {
            currentState = normalize(nextState);
            status.textContent = message;
            onCommit(currentState);
        }

        host.querySelector(".tq-settings-dev-toggle").onclick = () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) sync();
        };

        islandRegionSelect.addEventListener("change", refreshIslandOptions);

        host.querySelector("[data-set-resources]").onclick = () => {
            commit(withResources(currentState, {
                coins: coins.value,
                gems: gems.value,
                level: level.value
            }), "Recursos aplicados");
        };

        host.querySelector("[data-set-unlock-region]").onclick = () => {
            commit(withUnlockedRegion(currentState, Number(regionSelect.value)), "Região liberada");
        };

        host.querySelector("[data-set-unlock-through]").onclick = () => {
            commit(withUnlockedRegionsThrough(currentState, Number(regionSelect.value)), "Regiões liberadas");
        };

        host.querySelector("[data-set-unlock-all-regions]").onclick = () => {
            commit(withAllRegionsUnlocked(currentState), "Todas liberadas");
        };

        host.querySelector("[data-set-open-region]").onclick = () => {
            const regionId = Number(regionSelect.value);
            const prepared = withUnlockedRegion(currentState, regionId);
            onOpenRegion(prepared, regionId);
        };

        host.querySelector("[data-set-prepare-island]").onclick = () => {
            const regionId = Number(islandRegionSelect.value);
            const islandId = Number(islandSelect.value);
            commit(withIslandPrepared(currentState, regionId, islandId), "Ilha liberada");
        };

        host.querySelector("[data-set-open-island]").onclick = () => {
            const regionId = Number(islandRegionSelect.value);
            const islandId = Number(islandSelect.value);
            const prepared = withIslandPrepared(currentState, regionId, islandId);
            onOpenIsland(prepared, regionId, islandId);
        };

        host.querySelector("[data-set-unlock-map]").onclick = () => {
            commit(withSpecialMapUnlocked(currentState, Number(mapSelect.value)), "Mapa liberado");
        };

        host.querySelector("[data-set-unlock-all-maps]").onclick = () => {
            commit(withAllSpecialMapsUnlocked(currentState), "Mapas liberados");
        };

        host.querySelector("[data-set-reset]").onclick = () => {
            const fresh = TQ.domain.playerState.createInitialState();
            const preservedProfile = {
                ...fresh,
                player: {
                    ...fresh.player,
                    ...currentState.player,
                    profileCreated: true
                },
                ui: {
                    ...fresh.ui,
                    lastScreen: "home",
                    homeBackgroundId: currentState.ui.homeBackgroundId
                }
            };
            commit(preservedProfile, "Progresso restaurado");
        };

        sync();

        activeCleanup = () => host.remove();
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.settingsPanel = Object.freeze({
        mount,
        withResources,
        withUnlockedRegion,
        withUnlockedRegionsThrough,
        withAllRegionsUnlocked,
        withIslandPrepared,
        withSpecialMapUnlocked,
        withAllSpecialMapsUnlocked
    });
})(globalThis);
