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
                    <legend>Área do efeito</legend>
                    <p>Escolha a forma de seleção. Ponto a ponto é ideal para contornar ilhas, costas e pier.</p>
                    <label>Forma de seleção
                        <select data-ocean-area-mode>
                            <option value="freehand">Livre · desenhar</option>
                            <option value="polygon">Ponto a ponto · polígono</option>
                            <option value="rectangle">Retângulo</option>
                            <option value="ellipse">Elipse</option>
                        </select>
                    </label>
                    <div class="tq-ocean-actions">
                        <button type="button" data-ocean-mark-area>Marcar área do efeito</button>
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
        const areaMode = host.querySelector("[data-ocean-area-mode]");
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
            const mode = String(areaMode?.value || "freehand");
            openPanel(false);

            const modeLabel = {
                freehand: "Livre",
                polygon: "Ponto a ponto",
                rectangle: "Retângulo",
                ellipse: "Elipse"
            }[mode] || "Livre";

            status.textContent = mode === "polygon"
                ? "Toque ponto a ponto ao redor da área"
                : "Marque a área · " + modeLabel;

            const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            overlay.classList.add("tq-ocean-area-lasso");
            overlay.setAttribute("aria-hidden", "true");

            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.classList.add("tq-ocean-area-lasso-shape");
            overlay.appendChild(polygon);

            const pointsLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            pointsLayer.classList.add("tq-ocean-area-points");
            overlay.appendChild(pointsLayer);

            const controls = document.createElement("div");
            controls.className = "tq-ocean-area-controls";
            controls.innerHTML = `
                <strong>${modeLabel}</strong>
                <button type="button" data-ocean-area-undo>Desfazer ponto</button>
                <button type="button" data-ocean-area-finish>Concluir</button>
                <button type="button" data-ocean-area-cancel>Cancelar</button>
            `;

            document.body.append(overlay, controls);

            const undoButton = controls.querySelector("[data-ocean-area-undo]");
            const finishButton = controls.querySelector("[data-ocean-area-finish]");
            const cancelButton = controls.querySelector("[data-ocean-area-cancel]");

            undoButton.hidden = mode !== "polygon";
            finishButton.hidden = mode !== "polygon";

            const stageRect = oceanHost.getBoundingClientRect();
            let drawing = false;
            let startPoint = null;
            let points = [];

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

            function pointsForRectangle(a, b) {
                const left = Math.min(a.x, b.x);
                const right = Math.max(a.x, b.x);
                const top = Math.min(a.y, b.y);
                const bottom = Math.max(a.y, b.y);
                return [
                    { x: left, y: top },
                    { x: right, y: top },
                    { x: right, y: bottom },
                    { x: left, y: bottom }
                ];
            }

            function pointsForEllipse(a, b, count = 40) {
                const left = Math.min(a.x, b.x);
                const right = Math.max(a.x, b.x);
                const top = Math.min(a.y, b.y);
                const bottom = Math.max(a.y, b.y);
                const cx = (left + right) / 2;
                const cy = (top + bottom) / 2;
                const rx = Math.max(1, (right - left) / 2);
                const ry = Math.max(1, (bottom - top) / 2);
                return Array.from({ length: count }, (_, index) => {
                    const angle = (Math.PI * 2 * index) / count;
                    return {
                        x: cx + Math.cos(angle) * rx,
                        y: cy + Math.sin(angle) * ry
                    };
                });
            }

            function redraw() {
                polygon.setAttribute(
                    "points",
                    points.map((point) => point.x + "," + point.y).join(" ")
                );

                pointsLayer.replaceChildren();
                if (mode !== "polygon") return;

                points.forEach((point, index) => {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.classList.add("tq-ocean-area-point");
                    circle.setAttribute("cx", String(point.x));
                    circle.setAttribute("cy", String(point.y));
                    circle.setAttribute("r", index === 0 ? "7" : "5");
                    pointsLayer.appendChild(circle);
                });

                finishButton.disabled = points.length < 3;
                undoButton.disabled = points.length === 0;
            }

            function cleanup() {
                root.removeEventListener("pointerdown", onDown, true);
                root.removeEventListener("pointermove", onMove, true);
                root.removeEventListener("pointerup", onUp, true);
                root.removeEventListener("pointercancel", onUp, true);
                root.removeEventListener("keydown", onKeyDown, true);
                overlay.remove();
                controls.remove();
            }

            function cancel() {
                cleanup();
                status.textContent = "Marcação cancelada";
                openPanel(true);
            }

            function saveArea(message = "Área do efeito salva") {
                if (points.length < 3) {
                    status.textContent = "Marque pelo menos 3 pontos";
                    return false;
                }

                config.area = points.map((point) => ({
                    x: Math.min(1, Math.max(0, (point.x - stageRect.left) / stageRect.width)),
                    y: Math.min(1, Math.max(0, (point.y - stageRect.top) / stageRect.height))
                }));

                cleanup();
                openPanel(true);
                persist(message);
                return true;
            }

            function onDown(event) {
                if (event.target?.closest?.(".tq-ocean-area-controls")) return;
                if (!insideStage(event)) return;

                event.preventDefault();
                event.stopPropagation();

                const point = pointFromEvent(event);

                if (mode === "polygon") {
                    if (
                        points.length >= 3
                        && Math.hypot(point.x - points[0].x, point.y - points[0].y) <= 18
                    ) {
                        saveArea("Área ponto a ponto salva");
                        return;
                    }
                    points.push(point);
                    redraw();
                    status.textContent = points.length < 3
                        ? "Adicione mais " + (3 - points.length) + " ponto(s)"
                        : "Continue contornando ou toque Concluir";
                    return;
                }

                drawing = true;
                startPoint = point;
                points = mode === "freehand" ? [point] : pointsForRectangle(point, point);
                redraw();
            }

            function onMove(event) {
                if (!drawing || mode === "polygon") return;

                event.preventDefault();
                event.stopPropagation();

                const point = pointFromEvent(event);

                if (mode === "freehand") {
                    const last = points[points.length - 1];
                    if (Math.hypot(point.x - last.x, point.y - last.y) < 4) return;
                    points.push(point);
                } else if (mode === "rectangle") {
                    points = pointsForRectangle(startPoint, point);
                } else if (mode === "ellipse") {
                    points = pointsForEllipse(startPoint, point);
                }

                redraw();
            }

            function onUp(event) {
                if (!drawing || mode === "polygon") return;

                drawing = false;
                event.preventDefault();
                event.stopPropagation();

                if (mode === "freehand" && points.length < 3) {
                    cancel();
                    return;
                }

                saveArea(
                    mode === "ellipse" ? "Área elíptica salva"
                    : mode === "rectangle" ? "Área retangular salva"
                    : "Área livre salva"
                );
            }

            function onKeyDown(event) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    cancel();
                    return;
                }

                if (mode === "polygon" && event.key === "Enter") {
                    event.preventDefault();
                    saveArea("Área ponto a ponto salva");
                    return;
                }

                if (mode === "polygon" && (event.key === "Backspace" || event.key === "Delete")) {
                    event.preventDefault();
                    points.pop();
                    redraw();
                }
            }

            undoButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                points.pop();
                redraw();
            });

            finishButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                saveArea("Área ponto a ponto salva");
            });

            cancelButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                cancel();
            });

            redraw();

            root.addEventListener("pointerdown", onDown, true);
            root.addEventListener("pointermove", onMove, true);
            root.addEventListener("pointerup", onUp, true);
            root.addEventListener("pointercancel", onUp, true);
            root.addEventListener("keydown", onKeyDown, true);
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
            root.removeEventListener("tq:dev-tool-activate", onOtherTool);
            controller?.destroy?.();
            host.remove();
        };
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.oceanEditor = Object.freeze({ mount });
})(globalThis);
