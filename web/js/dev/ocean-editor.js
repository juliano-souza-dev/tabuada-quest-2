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
        const stage = screenRoot?.querySelector(".region-islands-canonical-stage");
        const scopeId = String(options.scopeId || "");
        const regionId = Number(options.regionId) || null;
        const controller = options.controller;

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
                    <span>Animar oceano nesta região</span>
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
                    <p>Desenhe sobre a parte do cenário que deve se mexer. As ilhas continuam independentes por cima.</p>
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
            shipWake.checked = Boolean(config.shipWake);
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
                shipWake: shipWake.checked,
                quality: quality.value,
                regionId
            };
        }

        function persist(message = "Salvo automaticamente") {
            config = TQ.core.oceanScene.saveConfig(scopeId, readControls(), regionId);
            controller?.update?.(config);
            status.textContent = message;
            syncControls();
            root.dispatchEvent(new CustomEvent("tq:ocean-config-changed", {
                detail: { scopeId, regionId, config }
            }));
        }

        function closeOtherPanels() {
            document.querySelectorAll(
                ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-parallax-dev-panel, .tq-region-builder-panel, .tq-ocean-dev-panel"
            ).forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
        }

        function openPanel(nextOpen) {
            panelOpen = Boolean(nextOpen);
            panel.hidden = !panelOpen;
            if (panelOpen) {
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
            openPanel(false);
            status.textContent = "Desenhe a área da água";

            const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            overlay.classList.add("tq-ocean-area-lasso");
            overlay.setAttribute("aria-hidden", "true");
            const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.classList.add("tq-ocean-area-lasso-shape");
            overlay.appendChild(polygon);
            document.body.appendChild(overlay);

            const stageRect = stage.getBoundingClientRect();
            let drawing = false;
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

            function redraw() {
                polygon.setAttribute("points", points.map((point) => point.x + "," + point.y).join(" "));
            }

            function cleanup() {
                root.removeEventListener("pointerdown", onDown, true);
                root.removeEventListener("pointermove", onMove, true);
                root.removeEventListener("pointerup", onUp, true);
                root.removeEventListener("pointercancel", onUp, true);
                root.removeEventListener("keydown", onKeyDown, true);
                overlay.remove();
            }

            function cancel() {
                cleanup();
                status.textContent = "Marcação cancelada";
                openPanel(true);
            }

            function onDown(event) {
                if (!insideStage(event)) return;
                drawing = true;
                points = [pointFromEvent(event)];
                redraw();
                event.preventDefault();
                event.stopPropagation();
            }

            function onMove(event) {
                if (!drawing) return;
                const point = pointFromEvent(event);
                const last = points[points.length - 1];
                if (Math.hypot(point.x - last.x, point.y - last.y) < 4) return;
                points.push(point);
                redraw();
                event.preventDefault();
                event.stopPropagation();
            }

            function onUp(event) {
                if (!drawing) return;
                drawing = false;
                event.preventDefault();
                event.stopPropagation();

                if (points.length < 3) {
                    cancel();
                    return;
                }

                config.area = points.map((point) => ({
                    x: Math.min(1, Math.max(0, (point.x - stageRect.left) / stageRect.width)),
                    y: Math.min(1, Math.max(0, (point.y - stageRect.top) / stageRect.height))
                }));

                cleanup();
                openPanel(true);
                persist("Área da água salva");
            }

            function onKeyDown(event) {
                if (event.key !== "Escape") return;
                event.preventDefault();
                cancel();
            }

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
                controller?.update?.(config);
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
            controller?.update?.(config);
            syncControls();
            status.textContent = "Versão publicada restaurada";
        });
        host.querySelector("[data-ocean-test]").addEventListener("click", () => {
            controller?.addRipple?.({ x: 0.5, y: 0.62 });
            status.textContent = "Ondinha enviada";
        });

        syncControls();

        activeCleanup = () => {
            root.removeEventListener("tq:dev-tool-activate", onOtherTool);
            host.remove();
        };
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.oceanEditor = Object.freeze({ mount });
})(globalThis);
