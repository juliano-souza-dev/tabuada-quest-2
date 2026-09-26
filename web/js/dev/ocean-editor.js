(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    let activeCleanup = null;
    let panelOpen = false;

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const stage = screenRoot?.querySelector(".tq-engine-canvas")
            || screenRoot?.querySelector(".tq-canonical-stage")
            || screenRoot?.querySelector(".tq-safe-visual-area")
            || screenRoot;
        const oceanHost = screenRoot?.querySelector('[data-tq-semantic-type="ocean"]')
            || stage;
        const scopeId = String(options.scopeId || "");
        const regionId = Number(options.regionId) || null;
        let controller = options.controller;
        function hasShipAsset() {
            return Boolean(
                screenRoot?.querySelector(
                    '[data-tq-semantic-type="ship"]:not([data-tq-slot-empty="true"])'
                )
            );
        }

        document.querySelector(".tq-ocean-dev")?.remove();

        if (!screenRoot || !stage || !scopeId || !TQ.core?.oceanScene) {
            return () => {};
        }

        let config = TQ.core.oceanScene.readConfig(scopeId, regionId);
        const presets = TQ.core.oceanScene.PRESETS;
        let areaSelectionCleanup = null;

        const host = document.createElement("aside");
        host.className = "tq-ocean-dev";
        host.innerHTML = `
            <button type="button" class="tq-ocean-dev-toggle" aria-label="Editar oceano">MAR</button>
            <section class="tq-ocean-dev-panel" hidden>
                <header>
                    <strong>MAR · Oceano</strong>
                    <span data-ocean-status>Salvo automaticamente</span>
                </header>

                <label class="tq-ocean-switch">
                    <input type="checkbox" data-ocean-enabled>
                    <span>Animar oceano nesta cena</span>
                </label>

                <label>Estilo
                    <select data-ocean-preset>
                        ${Object.entries(presets).map(([id, preset]) =>
                            '<option value="' + escapeHtml(id) + '">' + escapeHtml(preset.label) + '</option>'
                        ).join("")}
                    </select>
                </label>

                <div class="tq-ocean-range">
                    <label>Movimento
                        <span data-ocean-movement-value></span>
                    </label>
                    <input type="range" min="0" max="100" step="1" data-ocean-movement>
                    <small>Suave</small><small>Forte</small>
                </div>

                <div class="tq-ocean-range">
                    <label>Velocidade
                        <span data-ocean-speed-value></span>
                    </label>
                    <input type="range" min="0" max="100" step="1" data-ocean-speed>
                    <small>Lenta</small><small>Rápida</small>
                </div>

                <div class="tq-ocean-range">
                    <label>Brilho na água
                        <span data-ocean-shine-value></span>
                    </label>
                    <input type="range" min="0" max="100" step="1" data-ocean-shine>
                    <small>Discreto</small><small>Intenso</small>
                </div>

                <div class="tq-ocean-range">
                    <label>Espuma
                        <span data-ocean-foam-value></span>
                    </label>
                    <input type="range" min="0" max="100" step="1" data-ocean-foam>
                    <small>Quase nada</small><small>Muita</small>
                </div>

                <div class="tq-ocean-checks">
                    <label><input type="checkbox" data-ocean-ripples> Reagir ao toque</label>
                    <label><input type="checkbox" data-ocean-ship-wake> Rastro do navio</label>
                </div>

                <label>Desempenho
                    <select data-ocean-quality>
                        <option value="economy">Economia</option>
                        <option value="balanced">Equilibrado</option>
                        <option value="high">Máximo visual</option>
                    </select>
                </label>

                <fieldset>
                    <legend>Área da água</legend>
                    <p>Toque na imagem para criar os pontos que contornam a água. A área dentro deles será animada.</p>
                    <div class="tq-ocean-actions">
                        <button type="button" data-ocean-mark-area>Marcar área da água</button>
                        <button type="button" data-ocean-default-area>Usar área padrão</button>
                    </div>
                </fieldset>

                <div class="tq-ocean-actions">
                    <button type="button" data-ocean-reset>Restaurar publicado</button>
                    <button type="button" data-ocean-test>Ondinha de teste</button>
                </div>
            </section>
        `;
        document.body.appendChild(host);

        const panel = host.querySelector(".tq-ocean-dev-panel");
        const status = host.querySelector("[data-ocean-status]");
        const enabled = host.querySelector("[data-ocean-enabled]");
        const preset = host.querySelector("[data-ocean-preset]");
        const movement = host.querySelector("[data-ocean-movement]");
        const speed = host.querySelector("[data-ocean-speed]");
        const shine = host.querySelector("[data-ocean-shine]");
        const foam = host.querySelector("[data-ocean-foam]");
        const ripples = host.querySelector("[data-ocean-ripples]");
        const shipWake = host.querySelector("[data-ocean-ship-wake]");
        const shipWakeLabel = shipWake?.closest("label");
        const quality = host.querySelector("[data-ocean-quality]");
        const movementValue = host.querySelector("[data-ocean-movement-value]");
        const speedValue = host.querySelector("[data-ocean-speed-value]");
        const shineValue = host.querySelector("[data-ocean-shine-value]");
        const foamValue = host.querySelector("[data-ocean-foam-value]");
        panel.hidden = !panelOpen;

        function syncLabels() {
            movementValue.textContent = movement.value + "%";
            speedValue.textContent = speed.value + "%";
            shineValue.textContent = shine.value + "%";
            foamValue.textContent = foam.value + "%";
        }

        function syncControls() {
            enabled.checked = Boolean(config.enabled);
            preset.value = config.preset;
            movement.value = String(config.movement);
            speed.value = String(config.speed);
            shine.value = String(config.shine);
            foam.value = String(config.foam);
            ripples.checked = Boolean(config.ripples);
            const shipAvailable = hasShipAsset();
            if (shipWakeLabel) shipWakeLabel.hidden = !shipAvailable;
            shipWake.checked = shipAvailable && Boolean(config.shipWake);
            quality.value = config.quality;
            syncLabels();
        }

        function readControls() {
            return {
                ...config,
                enabled: enabled.checked,
                preset: preset.value,
                movement: Number(movement.value),
                speed: Number(speed.value),
                shine: Number(shine.value),
                foam: Number(foam.value),
                ripples: ripples.checked,
                shipWake: hasShipAsset() ? shipWake.checked : false,
                quality: quality.value,
                regionId
            };
        }

        function ensureController() {
            const liveCanvas = screenRoot?.querySelector(
                '[data-tq-semantic-type="ocean"] [data-tq-ocean-scene]'
            );
            if (controller?.webgl && liveCanvas?.isConnected) return controller;

            const hasOcean = Boolean(
                screenRoot?.querySelector('[data-tq-semantic-type="ocean"] img')
            );
            if (!hasOcean) return controller;

            controller?.destroy?.();
            controller = TQ.core.oceanScene.mount({
                screenRoot,
                scopeId,
                regionId,
                config
            });
            return controller;
        }

        function persist(message = "Salvo automaticamente") {
            config = TQ.core.oceanScene.saveConfig(scopeId, readControls(), regionId);
            ensureController()?.update?.(config);
            status.textContent = message;
            syncControls();
            root.dispatchEvent(new CustomEvent("tq:ocean-config-changed", {
                detail: { scopeId, regionId, config }
            }));
        }

        function closeOtherPanels() {
            document.querySelectorAll(
                ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-region-builder-panel, .tq-ocean-dev-panel"
            ).forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
        }

        function openPanel(nextOpen) {
            panelOpen = Boolean(nextOpen);
            panel.hidden = !panelOpen;
            if (panelOpen) {
                ensureController();
                closeOtherPanels();
                root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                    detail: { tool: "ocean" }
                }));
            }
        }

        function onOtherTool(event) {
            if (event.detail?.tool !== "ocean" && panelOpen) {
                panelOpen = false;
                panel.hidden = true;
            }
        }

        function setPreset() {
            config = TQ.core.oceanScene.applyPreset(readControls(), preset.value);
            syncControls();
            persist("Estilo aplicado");
        }

        function defaultArea() {
            const published = TQ.core.oceanScene.PUBLISHED_CONFIGS?.[scopeId];
            config.area = published?.area
                ? JSON.parse(JSON.stringify(published.area))
                : [
                    { x: 0, y: 0.2 },
                    { x: 1, y: 0.2 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 }
                ];
            persist("Área padrão aplicada");
        }

        function startAreaSelection() {
            areaSelectionCleanup?.();
            areaSelectionCleanup = null;

            const stageRect = oceanHost?.getBoundingClientRect?.();
            if (
                !stageRect
                || !Number.isFinite(stageRect.width)
                || !Number.isFinite(stageRect.height)
                || stageRect.width <= 1
                || stageRect.height <= 1
            ) {
                status.textContent = "Não encontrei a área visual do oceano";
                return;
            }

            openPanel(false);
            status.textContent = "Toque na água para adicionar pontos";

            const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            overlay.classList.add("tq-ocean-area-lasso");
            overlay.setAttribute("aria-label", "Marcar pontos da área da água");
            overlay.setAttribute("role", "application");

            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.classList.add("tq-ocean-area-lasso-shape");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            path.classList.add("tq-ocean-area-lasso-path");

            const pointLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            pointLayer.classList.add("tq-ocean-area-lasso-points");

            overlay.append(polygon, path, pointLayer);

            const menu = document.createElement("div");
            menu.className = "tq-ocean-area-point-menu";
            menu.innerHTML = `
                <div class="tq-ocean-area-point-menu-status">
                    <strong>Área da água</strong>
                    <span data-ocean-point-count>0 pontos</span>
                </div>
                <div class="tq-ocean-area-point-menu-actions">
                    <button type="button" data-ocean-point-undo disabled>↶ Desfazer</button>
                    <button type="button" data-ocean-point-clear disabled>Limpar</button>
                    <button type="button" data-ocean-point-cancel>Cancelar</button>
                    <button type="button" class="is-primary" data-ocean-point-finish disabled>✓ Concluir</button>
                </div>
            `;

            const countLabel = menu.querySelector("[data-ocean-point-count]");
            const undoButton = menu.querySelector("[data-ocean-point-undo]");
            const clearButton = menu.querySelector("[data-ocean-point-clear]");
            const cancelButton = menu.querySelector("[data-ocean-point-cancel]");
            const finishButton = menu.querySelector("[data-ocean-point-finish]");

            document.body.append(overlay, menu);

            let points = [];
            let cleaned = false;

            function pointFromEvent(event) {
                return {
                    x: Math.min(stageRect.right, Math.max(stageRect.left, event.clientX)),
                    y: Math.min(stageRect.bottom, Math.max(stageRect.top, event.clientY))
                };
            }

            function insideStage(event) {
                return event.clientX >= stageRect.left
                    && event.clientX <= stageRect.right
                    && event.clientY >= stageRect.top
                    && event.clientY <= stageRect.bottom;
            }

            function redraw() {
                const serialized = points
                    .map((point) => point.x + "," + point.y)
                    .join(" ");

                polygon.setAttribute("points", points.length >= 3 ? serialized : "");
                path.setAttribute("points", serialized);

                pointLayer.replaceChildren(...points.map((point, index) => {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.classList.add("tq-ocean-area-lasso-point");
                    circle.setAttribute("cx", String(point.x));
                    circle.setAttribute("cy", String(point.y));
                    circle.setAttribute("r", index === 0 ? "7" : "6");
                    circle.dataset.pointIndex = String(index);
                    return circle;
                }));

                overlay.classList.toggle("is-area-ready", points.length >= 3);
                countLabel.textContent = points.length + (points.length === 1 ? " ponto" : " pontos");
                undoButton.disabled = points.length === 0;
                clearButton.disabled = points.length === 0;
                finishButton.disabled = points.length < 3;
            }

            function cleanup() {
                if (cleaned) return;
                cleaned = true;
                overlay.removeEventListener("pointerdown", onPoint);
                root.removeEventListener("keydown", onKeyDown, true);
                undoButton.removeEventListener("click", undoPoint);
                clearButton.removeEventListener("click", clearPoints);
                cancelButton.removeEventListener("click", cancel);
                finishButton.removeEventListener("click", finish);
                overlay.remove();
                menu.remove();
                areaSelectionCleanup = null;
            }

            function cancel() {
                cleanup();
                status.textContent = "Marcação cancelada";
                openPanel(true);
            }

            function undoPoint() {
                if (!points.length) return;
                points.pop();
                redraw();
            }

            function clearPoints() {
                points = [];
                redraw();
            }

            function finish() {
                if (points.length < 3) {
                    status.textContent = "Adicione pelo menos 3 pontos";
                    return;
                }

                config.area = points.map((point) => ({
                    x: Math.min(1, Math.max(0, (point.x - stageRect.left) / stageRect.width)),
                    y: Math.min(1, Math.max(0, (point.y - stageRect.top) / stageRect.height))
                }));

                cleanup();
                openPanel(true);
                persist("Área da água salva · " + points.length + " pontos");
            }

            function onPoint(event) {
                if (!event.isPrimary) return;
                if (event.pointerType === "mouse" && event.button !== 0) return;

                event.preventDefault();
                event.stopPropagation();

                if (!insideStage(event)) return;

                points.push(pointFromEvent(event));
                redraw();
            }

            function onKeyDown(event) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    cancel();
                    return;
                }

                if (
                    (event.key === "Backspace" || event.key === "Delete")
                    && !event.target?.matches?.("input, textarea, select")
                ) {
                    event.preventDefault();
                    undoPoint();
                }
            }

            overlay.addEventListener("pointerdown", onPoint, { passive: false });
            root.addEventListener("keydown", onKeyDown, true);
            undoButton.addEventListener("click", undoPoint);
            clearButton.addEventListener("click", clearPoints);
            cancelButton.addEventListener("click", cancel);
            finishButton.addEventListener("click", finish);

            redraw();
            areaSelectionCleanup = cleanup;
        }

        host.querySelector(".tq-ocean-dev-toggle").addEventListener("click", () => openPanel(!panelOpen));
        root.addEventListener("tq:dev-tool-activate", onOtherTool);

        enabled.addEventListener("change", () => persist(enabled.checked ? "Oceano ligado" : "Oceano desligado"));
        preset.addEventListener("change", setPreset);
        [movement, speed, shine, foam].forEach((input) => {
            input.addEventListener("input", () => {
                syncLabels();
                config = TQ.core.oceanScene.normalizeConfig(readControls(), regionId);
                ensureController()?.update?.(config);
                status.textContent = "Ajustando...";
            });
            input.addEventListener("change", () => persist());
        });
        [ripples, shipWake, quality].forEach((input) => {
            input.addEventListener("change", () => persist());
        });

        host.querySelector("[data-ocean-mark-area]").addEventListener("click", startAreaSelection);
        host.querySelector("[data-ocean-default-area]").addEventListener("click", defaultArea);
        host.querySelector("[data-ocean-reset]").addEventListener("click", () => {
            TQ.core.oceanScene.clearConfig(scopeId);
            config = TQ.core.oceanScene.readConfig(scopeId, regionId);
            ensureController()?.update?.(config);
            syncControls();
            status.textContent = "Versão publicada restaurada";
        });
        host.querySelector("[data-ocean-test]").addEventListener("click", () => {
            ensureController()?.addRipple?.({ x: 0.5, y: 0.62 });
            status.textContent = "Ondinha enviada";
        });

        syncControls();

        activeCleanup = () => {
            areaSelectionCleanup?.();
            areaSelectionCleanup = null;
            root.removeEventListener("tq:dev-tool-activate", onOtherTool);
            controller?.destroy?.();
            host.remove();
        };
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.oceanEditor = Object.freeze({ mount });
})(globalThis);
