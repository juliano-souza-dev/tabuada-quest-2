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
        const scopeId = String(options.scopeId || "");
        const regionId = Number(options.regionId) || null;
        const screenId = String(options.screenId || "screen");
        const controller = options.controller;

        document.querySelector(".tq-depth-dev")?.remove();

        if (!screenRoot || !scopeId || !TQ.core?.depthScene) {
            return () => {};
        }

        let config = TQ.core.depthScene.readConfig(scopeId, regionId);
        const presets = TQ.core.depthScene.ROLE_PRESETS;
        let targets = controller?.listTargets?.() || TQ.core.depthScene.collectTargets(screenRoot, screenId);
        let selectedId = targets[0]?.id || "";

        const host = document.createElement("aside");
        host.className = "tq-depth-dev";
        host.innerHTML = `
            <button type="button" class="tq-depth-dev-toggle" aria-label="Editar profundidade da cena">CENA</button>
            <section class="tq-depth-dev-panel" hidden>
                <header>
                    <strong>CENA · Profundidade</strong>
                    <span data-depth-status>Salvo automaticamente</span>
                </header>

                <label class="tq-depth-switch">
                    <input type="checkbox" data-depth-enabled>
                    <span>Ativar profundidade nesta tela</span>
                </label>

                <div class="tq-depth-range">
                    <label>Força da profundidade <span data-depth-intensity-value></span></label>
                    <input type="range" min="0" max="100" step="1" data-depth-intensity>
                    <small>Discreta</small><small>Marcante</small>
                </div>

                <label class="tq-depth-switch">
                    <input type="checkbox" data-depth-pointer>
                    <span>Reagir ao movimento da tela</span>
                </label>

                <fieldset>
                    <legend>Elemento</legend>
                    <label>O que você quer separar?
                        <select data-depth-target></select>
                    </label>

                    <label class="tq-depth-switch">
                        <input type="checkbox" data-depth-layer-enabled>
                        <span>Usar profundidade neste elemento</span>
                    </label>

                    <label>Tipo
                        <select data-depth-role>
                            ${Object.entries(presets).map(([id, preset]) =>
                                '<option value="' + escapeHtml(id) + '">' + escapeHtml(preset.label) + '</option>'
                            ).join("")}
                        </select>
                    </label>

                    <div class="tq-depth-range">
                        <label>Profundidade <span data-depth-depth-value></span></label>
                        <input type="range" min="0" max="100" step="1" data-depth-depth>
                        <small>Ao fundo</small><small>Mais perto</small>
                    </div>

                    <div class="tq-depth-range">
                        <label>Flutuação <span data-depth-drift-value></span></label>
                        <input type="range" min="0" max="100" step="1" data-depth-drift>
                        <small>Quase parada</small><small>Mais viva</small>
                    </div>

                    <div class="tq-depth-range">
                        <label>Velocidade <span data-depth-speed-value></span></label>
                        <input type="range" min="0" max="100" step="1" data-depth-speed>
                        <small>Lenta</small><small>Rápida</small>
                    </div>

                    <div class="tq-depth-range">
                        <label>Visibilidade <span data-depth-opacity-value></span></label>
                        <input type="range" min="0" max="100" step="1" data-depth-opacity>
                        <small>Suave</small><small>Nítida</small>
                    </div>

                    <div class="tq-depth-range">
                        <label>Tamanho em movimento <span data-depth-scale-value></span></label>
                        <input type="range" min="100" max="125" step="1" data-depth-scale>
                        <small>Normal</small><small>Mais próximo</small>
                    </div>

                    <div class="tq-depth-range" data-depth-tilt-row hidden>
                        <label>Balanço do navio <span data-depth-tilt-value></span></label>
                        <input type="range" min="0" max="100" step="1" data-depth-tilt>
                        <small>Estável</small><small>Balança mais</small>
                    </div>
                </fieldset>

                <div class="tq-depth-actions">
                    <button type="button" data-depth-refresh>Atualizar elementos</button>
                    <button type="button" data-depth-remove>Remover deste elemento</button>
                </div>

                <button type="button" data-depth-reset>Restaurar cena publicada</button>

                <small class="tq-depth-note">
                    Posição e tamanho continuam sendo ajustados no UX. Aqui você controla só a sensação de profundidade e movimento.
                </small>
            </section>
        `;
        document.body.appendChild(host);

        const panel = host.querySelector(".tq-depth-dev-panel");
        const status = host.querySelector("[data-depth-status]");
        const enabled = host.querySelector("[data-depth-enabled]");
        const intensity = host.querySelector("[data-depth-intensity]");
        const pointer = host.querySelector("[data-depth-pointer]");
        const targetSelect = host.querySelector("[data-depth-target]");
        const layerEnabled = host.querySelector("[data-depth-layer-enabled]");
        const role = host.querySelector("[data-depth-role]");
        const depth = host.querySelector("[data-depth-depth]");
        const drift = host.querySelector("[data-depth-drift]");
        const speed = host.querySelector("[data-depth-speed]");
        const opacity = host.querySelector("[data-depth-opacity]");
        const scale = host.querySelector("[data-depth-scale]");
        const tilt = host.querySelector("[data-depth-tilt]");
        const tiltRow = host.querySelector("[data-depth-tilt-row]");

        const intensityValue = host.querySelector("[data-depth-intensity-value]");
        const depthValue = host.querySelector("[data-depth-depth-value]");
        const driftValue = host.querySelector("[data-depth-drift-value]");
        const speedValue = host.querySelector("[data-depth-speed-value]");
        const opacityValue = host.querySelector("[data-depth-opacity-value]");
        const scaleValue = host.querySelector("[data-depth-scale-value]");
        const tiltValue = host.querySelector("[data-depth-tilt-value]");

        panel.hidden = !panelOpen;

        function selectedTarget() {
            return targets.find((target) => target.id === selectedId) || null;
        }

        function allowedRolesForSelected() {
            const allowed = selectedTarget()?.depthRoles;
            return Array.isArray(allowed) && allowed.length
                ? allowed.filter((id) => presets[id])
                : Object.keys(presets);
        }

        function fillRoleOptions(preferredRole = null) {
            const allowed = allowedRolesForSelected();
            role.replaceChildren(...allowed.map((id) => {
                const option = document.createElement("option");
                option.value = id;
                option.textContent = presets[id]?.label || id;
                return option;
            }));
            if (preferredRole && allowed.includes(preferredRole)) {
                role.value = preferredRole;
            } else if (allowed.length) {
                role.value = allowed[0];
            }
        }

        function currentLayer() {
            if (config.layers[selectedId]) {
                return TQ.core.depthScene.normalizeLayer(config.layers[selectedId]);
            }
            const defaultRole = allowedRolesForSelected()[0] || "custom";
            return TQ.core.depthScene.normalizeLayer({ enabled: false, role: defaultRole });
        }

        function fillTargets(preferredId = selectedId) {
            targets = controller?.listTargets?.() || TQ.core.depthScene.collectTargets(screenRoot, screenId);
            targetSelect.replaceChildren(...targets.map((target) => {
                const option = document.createElement("option");
                option.value = target.id;
                option.textContent = target.label;
                return option;
            }));

            if (targets.some((target) => target.id === preferredId)) {
                selectedId = preferredId;
            } else {
                selectedId = targets[0]?.id || "";
            }
            targetSelect.value = selectedId;
        }

        function syncLabels() {
            intensityValue.textContent = intensity.value + "%";
            depthValue.textContent = depth.value + "%";
            driftValue.textContent = drift.value + "%";
            speedValue.textContent = speed.value + "%";
            opacityValue.textContent = opacity.value + "%";
            scaleValue.textContent = scale.value + "%";
            tiltValue.textContent = tilt.value + "%";
            tiltRow.hidden = role.value !== "ship";
        }

        function syncSceneControls() {
            enabled.checked = Boolean(config.enabled);
            intensity.value = String(config.intensity);
            pointer.checked = Boolean(config.followPointer);
            syncLabels();
        }

        function syncLayerControls() {
            const layer = currentLayer();
            layerEnabled.checked = Boolean(config.layers[selectedId]?.enabled);
            fillRoleOptions(layer.role);
            const effectiveRole = role.value || layer.role;
            const normalizedLayer = effectiveRole === layer.role
                ? layer
                : TQ.core.depthScene.applyRole(layer, effectiveRole);
            depth.value = String(normalizedLayer.depth);
            drift.value = String(normalizedLayer.drift);
            speed.value = String(normalizedLayer.speed);
            opacity.value = String(normalizedLayer.opacity);
            scale.value = String(normalizedLayer.scale);
            tilt.value = String(normalizedLayer.tilt || 0);
            const disabled = !selectedId;
            [layerEnabled, role, depth, drift, speed, opacity, scale, tilt].forEach((control) => {
                control.disabled = disabled;
            });
            syncLabels();
        }

        function readSceneControls() {
            return {
                ...config,
                enabled: enabled.checked,
                intensity: Number(intensity.value),
                followPointer: pointer.checked,
                regionId
            };
        }

        function readLayerControls() {
            return TQ.core.depthScene.normalizeLayer({
                enabled: layerEnabled.checked,
                role: role.value,
                depth: Number(depth.value),
                drift: Number(drift.value),
                speed: Number(speed.value),
                opacity: Number(opacity.value),
                scale: Number(scale.value),
                tilt: Number(tilt.value)
            });
        }

        function applyAndSave(message = "Salvo automaticamente") {
            config = TQ.core.depthScene.saveConfig(scopeId, readSceneControls(), regionId);
            controller?.update?.(config);
            status.textContent = message;
            root.dispatchEvent(new CustomEvent("tq:depth-config-changed", {
                detail: { scopeId, regionId, config }
            }));
        }

        function persistLayer(message = "Elemento atualizado") {
            if (!selectedId) return;
            const next = readSceneControls();
            next.layers = {
                ...config.layers,
                [selectedId]: readLayerControls()
            };
            config = TQ.core.depthScene.saveConfig(scopeId, next, regionId);
            controller?.update?.(config);
            status.textContent = message;
            root.dispatchEvent(new CustomEvent("tq:depth-config-changed", {
                detail: { scopeId, regionId, config }
            }));
        }

        function closeOtherPanels() {
            document.querySelectorAll(
                ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-region-builder-panel, .tq-ocean-dev-panel, .tq-depth-dev-panel"
            ).forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
        }

        function openPanel(nextOpen) {
            panelOpen = Boolean(nextOpen);
            panel.hidden = !panelOpen;
            if (panelOpen) {
                closeOtherPanels();
                fillTargets(selectedId);
                syncSceneControls();
                syncLayerControls();
                root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                    detail: { tool: "depth" }
                }));
            }
        }

        function onOtherTool(event) {
            if (event.detail?.tool !== "depth" && panelOpen) {
                panelOpen = false;
                panel.hidden = true;
            }
        }

        host.querySelector(".tq-depth-dev-toggle").addEventListener("click", () => openPanel(!panelOpen));
        root.addEventListener("tq:dev-tool-activate", onOtherTool);

        enabled.addEventListener("change", () => applyAndSave(enabled.checked ? "Profundidade ligada" : "Profundidade desligada"));
        pointer.addEventListener("change", () => applyAndSave());
        intensity.addEventListener("input", () => {
            syncLabels();
            const preview = TQ.core.depthScene.normalizeConfig(readSceneControls(), regionId);
            controller?.update?.(preview);
            status.textContent = "Ajustando...";
        });
        intensity.addEventListener("change", () => applyAndSave());

        targetSelect.addEventListener("change", () => {
            selectedId = targetSelect.value;
            syncLayerControls();
            const target = selectedTarget();
            status.textContent = target?.semanticType
                ? "Elemento selecionado · " + (TQ.content.screenComposition.SEMANTIC_TYPES[target.semanticType]?.label || target.semanticType)
                : "Elemento selecionado";
        });

        layerEnabled.addEventListener("change", () => persistLayer(
            layerEnabled.checked ? "Profundidade aplicada" : "Profundidade removida"
        ));

        role.addEventListener("change", () => {
            const previous = currentLayer();
            const next = TQ.core.depthScene.applyRole(previous, role.value);
            layerEnabled.checked = true;
            depth.value = String(next.depth);
            drift.value = String(next.drift);
            speed.value = String(next.speed);
            opacity.value = String(next.opacity);
            scale.value = String(next.scale);
            tilt.value = String(next.tilt || 0);
            syncLabels();
            persistLayer("Tipo aplicado");
        });

        [depth, drift, speed, opacity, scale, tilt].forEach((input) => {
            input.addEventListener("input", () => {
                syncLabels();
                if (!selectedId) return;
                const preview = readSceneControls();
                preview.layers = {
                    ...config.layers,
                    [selectedId]: readLayerControls()
                };
                controller?.update?.(TQ.core.depthScene.normalizeConfig(preview, regionId));
                status.textContent = "Ajustando...";
            });
            input.addEventListener("change", () => persistLayer());
        });

        host.querySelector("[data-depth-refresh]").addEventListener("click", () => {
            controller?.refresh?.();
            fillTargets(selectedId);
            syncLayerControls();
            status.textContent = "Elementos atualizados";
        });

        host.querySelector("[data-depth-remove]").addEventListener("click", () => {
            if (!selectedId) return;
            const layers = { ...config.layers };
            delete layers[selectedId];
            config = TQ.core.depthScene.saveConfig(scopeId, {
                ...readSceneControls(),
                layers
            }, regionId);
            controller?.update?.(config);
            syncLayerControls();
            status.textContent = "Profundidade removida";
        });

        host.querySelector("[data-depth-reset]").addEventListener("click", () => {
            TQ.core.depthScene.clearConfig(scopeId);
            config = TQ.core.depthScene.readConfig(scopeId, regionId);
            controller?.update?.(config);
            syncSceneControls();
            syncLayerControls();
            status.textContent = "Cena publicada restaurada";
        });

        fillTargets();
        syncSceneControls();
        syncLayerControls();

        activeCleanup = () => {
            root.removeEventListener("tq:dev-tool-activate", onOtherTool);
            host.remove();
        };

        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.depthEditor = Object.freeze({ mount });
})(globalThis);
