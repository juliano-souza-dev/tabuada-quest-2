(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.scene-layout.v1";
    let activeCleanup = null;

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object"
                ? { version: 1, screens: parsed.screens && typeof parsed.screens === "object" ? parsed.screens : {} }
                : { version: 1, screens: {} };
        } catch (_) {
            return { version: 1, screens: {} };
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    function number(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function readGeometry(element) {
        return {
            x: number(element.style.getPropertyValue("--tq-dev-x"), 0),
            y: number(element.style.getPropertyValue("--tq-dev-y"), 0),
            sx: number(element.style.getPropertyValue("--tq-dev-sx"), 1),
            sy: number(element.style.getPropertyValue("--tq-dev-sy"), 1)
        };
    }

    function applyGeometry(element, geometry) {
        const x = number(geometry?.x, 0);
        const y = number(geometry?.y, 0);
        const sx = Math.max(.05, number(geometry?.sx, 1));
        const sy = Math.max(.05, number(geometry?.sy, 1));
        element.style.setProperty("--tq-dev-x", String(x));
        element.style.setProperty("--tq-dev-y", String(y));
        element.style.setProperty("--tq-dev-sx", String(sx));
        element.style.setProperty("--tq-dev-sy", String(sy));
    }

    function clearGeometry(element) {
        element.style.removeProperty("--tq-dev-x");
        element.style.removeProperty("--tq-dev-y");
        element.style.removeProperty("--tq-dev-sx");
        element.style.removeProperty("--tq-dev-sy");
    }

    function collectNodes(appRoot) {
        const seen = new Set();
        return [...appRoot.querySelectorAll("[data-tq-dev-id]")]
            .filter((element) => {
                const id = element.dataset.tqDevId;
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .map((element) => ({
                id: element.dataset.tqDevId,
                kind: element.dataset.tqDevKind || "asset",
                label: element.dataset.tqDevLabel || element.dataset.tqAssetLabel || element.dataset.tqDevId,
                role: element.dataset.tqDevRole || element.dataset.tqAssetRole || "",
                action: element.dataset.tqDevAction || element.dataset.action || "",
                element
            }));
    }

    function stageScale(element) {
        const stage = element.closest(".tq-canonical-stage");
        if (!stage) return { x: 1, y: 1 };
        const rect = stage.getBoundingClientRect();
        return {
            x: stage.offsetWidth ? rect.width / stage.offsetWidth : 1,
            y: stage.offsetHeight ? rect.height / stage.offsetHeight : 1
        };
    }

    function kindLabel(kind) {
        return ({
            asset: "Asset",
            function: "Função",
            dynamicText: "Texto dinâmico",
            overlay: "Overlay",
            background: "Fundo"
        })[kind] || kind;
    }

    function mount(appRoot, options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const screenId = String(options.screenId || "screen");
        const nodes = collectNodes(appRoot);
        if (!nodes.length) return;

        let store = readStore();
        const saved = store.screens[screenId] || {};
        nodes.forEach((node) => {
            if (saved[node.id]) applyGeometry(node.element, saved[node.id]);
        });

        const nodeById = new Map(nodes.map((node) => [node.id, node]));
        const host = document.createElement("aside");
        host.className = "tq-scene-dev";
        host.innerHTML = `
            <button type="button" class="tq-scene-dev-toggle">DEV</button>
            <section class="tq-scene-dev-panel" hidden>
                <header>
                    <strong>Editor visual</strong>
                    <span data-dev-status>Pronto</span>
                </header>
                <label>Mostrar
                    <select data-dev-filter>
                        <option value="all">Tudo</option>
                        <option value="asset">Assets</option>
                        <option value="function">Funções</option>
                        <option value="dynamicText">Textos</option>
                        <option value="background">Fundos</option>
                    </select>
                </label>
                <label>Elemento
                    <select data-dev-node></select>
                </label>
                <div class="tq-scene-dev-meta">
                    <strong data-dev-name>Nenhum selecionado</strong>
                    <small data-dev-type></small>
                    <small data-dev-action></small>
                </div>
                <div class="tq-scene-dev-grid">
                    <label>Mover X <input data-dev-x type="number" step="1"></label>
                    <label>Mover Y <input data-dev-y type="number" step="1"></label>
                    <label>Largura % <input data-dev-sx type="number" min="5" step="1"></label>
                    <label>Altura % <input data-dev-sy type="number" min="5" step="1"></label>
                </div>
                <label class="tq-scene-dev-check"><input data-dev-lock type="checkbox" checked> Manter proporção</label>
                <div class="tq-scene-dev-actions">
                    <button type="button" data-dev-undo>↶ Desfazer</button>
                    <button type="button" data-dev-reset>Resetar item</button>
                </div>
                <div class="tq-scene-dev-actions">
                    <button type="button" data-dev-copy>Copiar layout</button>
                    <button type="button" data-dev-reset-screen>Resetar tela</button>
                </div>
                <small>Arraste qualquer item mapeado. Use as alças para redimensionar. Setas movem 1 px; Shift + setas movem 10 px.</small>
            </section>
        `;
        document.body.appendChild(host);

        const overlay = document.createElement("div");
        overlay.className = "tq-scene-dev-selection";
        overlay.hidden = true;
        overlay.innerHTML = `
            <span class="tq-scene-dev-selection-label"></span>
            <i data-dev-handle="nw"></i><i data-dev-handle="n"></i><i data-dev-handle="ne"></i>
            <i data-dev-handle="e"></i><i data-dev-handle="se"></i><i data-dev-handle="s"></i>
            <i data-dev-handle="sw"></i><i data-dev-handle="w"></i>
        `;
        document.body.appendChild(overlay);

        const panel = host.querySelector(".tq-scene-dev-panel");
        const filterSelect = host.querySelector("[data-dev-filter]");
        const nodeSelect = host.querySelector("[data-dev-node]");
        const status = host.querySelector("[data-dev-status]");
        const name = host.querySelector("[data-dev-name]");
        const type = host.querySelector("[data-dev-type]");
        const action = host.querySelector("[data-dev-action]");
        const inputX = host.querySelector("[data-dev-x]");
        const inputY = host.querySelector("[data-dev-y]");
        const inputSx = host.querySelector("[data-dev-sx]");
        const inputSy = host.querySelector("[data-dev-sy]");
        const lockRatio = host.querySelector("[data-dev-lock]");
        let opened = false;
        let selected = null;
        let interaction = null;
        let history = [];
        let raf = 0;

        function snapshot() {
            return Object.fromEntries(nodes.map((node) => [node.id, readGeometry(node.element)]));
        }

        function pushHistory() {
            history.push(snapshot());
            if (history.length > 30) history.shift();
        }

        function persist(message = "Salvo") {
            store = readStore();
            store.screens[screenId] = snapshot();
            writeStore(store);
            status.textContent = message;
        }

        function applySnapshot(snapshotValue) {
            nodes.forEach((node) => {
                const geometry = snapshotValue?.[node.id];
                if (geometry) applyGeometry(node.element, geometry);
                else clearGeometry(node.element);
            });
            persist();
            refreshInspector();
            scheduleOverlay();
        }

        function filteredNodes() {
            const filter = filterSelect.value;
            return filter === "all" ? nodes : nodes.filter((node) => node.kind === filter);
        }

        function refreshList() {
            const available = filteredNodes();
            nodeSelect.innerHTML = available.map((node) => `<option value="${node.id}">${node.label} · ${kindLabel(node.kind)}</option>`).join("");
            if (selected && available.some((node) => node.id === selected.id)) {
                nodeSelect.value = selected.id;
            } else if (available.length) {
                selectNode(available[0]);
            } else {
                selectNode(null);
            }
        }

        function refreshInspector() {
            if (!selected) {
                name.textContent = "Nenhum selecionado";
                type.textContent = "";
                action.textContent = "";
                [inputX, inputY, inputSx, inputSy].forEach((input) => input.value = "");
                return;
            }
            const geometry = readGeometry(selected.element);
            name.textContent = selected.label;
            type.textContent = kindLabel(selected.kind) + (selected.role ? " · " + selected.role : "");
            action.textContent = selected.action ? "Ação: " + selected.action : "";
            inputX.value = Math.round(geometry.x * 100) / 100;
            inputY.value = Math.round(geometry.y * 100) / 100;
            inputSx.value = Math.round(geometry.sx * 10000) / 100;
            inputSy.value = Math.round(geometry.sy * 10000) / 100;
        }

        function updateOverlay() {
            raf = 0;
            if (!opened || !selected || !selected.element.isConnected) {
                overlay.hidden = true;
                return;
            }
            const rect = selected.element.getBoundingClientRect();
            overlay.hidden = false;
            overlay.style.left = rect.left + "px";
            overlay.style.top = rect.top + "px";
            overlay.style.width = rect.width + "px";
            overlay.style.height = rect.height + "px";
            overlay.querySelector(".tq-scene-dev-selection-label").textContent = selected.label;
        }

        function scheduleOverlay() {
            if (raf) return;
            raf = root.requestAnimationFrame(updateOverlay);
        }

        function selectNode(node) {
            if (selected) selected.element.removeAttribute("data-tq-dev-selected");
            selected = node || null;
            if (selected) {
                selected.element.setAttribute("data-tq-dev-selected", "true");
                if ([...nodeSelect.options].some((option) => option.value === selected.id)) {
                    nodeSelect.value = selected.id;
                }
            }
            refreshInspector();
            scheduleOverlay();
        }

        function startInteraction(event, node, mode, handle = "") {
            if (!opened || !node) return;
            selectNode(node);
            event.preventDefault();
            event.stopPropagation();
            const rect = node.element.getBoundingClientRect();
            interaction = {
                mode,
                handle,
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                rect,
                geometry: readGeometry(node.element),
                changed: false
            };
        }

        function onPointerDown(event) {
            if (!opened) return;
            const element = event.target.closest?.("[data-tq-dev-id]");
            if (!element || !appRoot.contains(element)) return;
            const node = nodeById.get(element.dataset.tqDevId);
            if (!node) return;
            startInteraction(event, node, "move");
        }

        function onHandleDown(event) {
            const handle = event.target.closest("[data-dev-handle]")?.dataset.devHandle;
            if (!handle || !selected) return;
            startInteraction(event, selected, "resize", handle);
        }

        function onPointerMove(event) {
            if (!interaction || !selected || event.pointerId !== interaction.pointerId) return;
            const dx = event.clientX - interaction.startX;
            const dy = event.clientY - interaction.startY;
            const scale = stageScale(selected.element);
            if (!interaction.changed && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
                pushHistory();
                interaction.changed = true;
            }
            if (!interaction.changed) return;

            if (interaction.mode === "move") {
                applyGeometry(selected.element, {
                    ...interaction.geometry,
                    x: interaction.geometry.x + dx / scale.x,
                    y: interaction.geometry.y + dy / scale.y
                });
            } else {
                const handle = interaction.handle;
                let width = interaction.rect.width;
                let height = interaction.rect.height;
                if (handle.includes("e")) width += dx;
                if (handle.includes("w")) width -= dx;
                if (handle.includes("s")) height += dy;
                if (handle.includes("n")) height -= dy;
                width = Math.max(20, width);
                height = Math.max(20, height);

                if (lockRatio.checked && handle.length === 2) {
                    const ratio = interaction.rect.width / Math.max(1, interaction.rect.height);
                    const widthDelta = Math.abs(width - interaction.rect.width) / Math.max(1, interaction.rect.width);
                    const heightDelta = Math.abs(height - interaction.rect.height) / Math.max(1, interaction.rect.height);
                    if (widthDelta >= heightDelta) height = width / ratio;
                    else width = height * ratio;
                }

                const sx = Math.max(.05, interaction.geometry.sx * (width / interaction.rect.width));
                const sy = Math.max(.05, interaction.geometry.sy * (height / interaction.rect.height));
                const moveX = handle.includes("w") ? (interaction.rect.width - width) / scale.x : 0;
                const moveY = handle.includes("n") ? (interaction.rect.height - height) / scale.y : 0;
                applyGeometry(selected.element, {
                    x: interaction.geometry.x + moveX,
                    y: interaction.geometry.y + moveY,
                    sx,
                    sy
                });
            }
            refreshInspector();
            scheduleOverlay();
        }

        function onPointerUp(event) {
            if (!interaction || event.pointerId !== interaction.pointerId) return;
            const changed = interaction.changed;
            interaction = null;
            if (changed) persist();
        }

        function setFromInspector() {
            if (!selected) return;
            pushHistory();
            const sx = Math.max(.05, number(inputSx.value, 100) / 100);
            const sy = lockRatio.checked ? sx : Math.max(.05, number(inputSy.value, 100) / 100);
            applyGeometry(selected.element, {
                x: number(inputX.value, 0),
                y: number(inputY.value, 0),
                sx,
                sy
            });
            persist();
            refreshInspector();
            scheduleOverlay();
        }

        function interceptClick(event) {
            if (!opened || !appRoot.contains(event.target)) return;
            const element = event.target.closest?.("[data-tq-dev-id]");
            if (element) {
                const node = nodeById.get(element.dataset.tqDevId);
                if (node) selectNode(node);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        function onKeyDown(event) {
            if (!opened || !selected) return;
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
            event.preventDefault();
            pushHistory();
            const step = event.shiftKey ? 10 : 1;
            const geometry = readGeometry(selected.element);
            if (event.key === "ArrowLeft") geometry.x -= step;
            if (event.key === "ArrowRight") geometry.x += step;
            if (event.key === "ArrowUp") geometry.y -= step;
            if (event.key === "ArrowDown") geometry.y += step;
            applyGeometry(selected.element, geometry);
            persist();
            refreshInspector();
            scheduleOverlay();
        }

        function setOpened(nextOpened) {
            opened = nextOpened;
            panel.hidden = !opened;
            appRoot.classList.toggle("tq-dev-scene-editing", opened);
            document.body.classList.toggle("tq-dev-scene-editing-active", opened);
            if (!opened) overlay.hidden = true;
            else {
                if (!selected && nodes.length) selectNode(nodes[0]);
                scheduleOverlay();
            }
        }

        host.querySelector(".tq-scene-dev-toggle").addEventListener("click", () => setOpened(!opened));
        filterSelect.addEventListener("change", refreshList);
        nodeSelect.addEventListener("change", () => selectNode(nodeById.get(nodeSelect.value) || null));
        [inputX, inputY, inputSx, inputSy].forEach((input) => input.addEventListener("change", setFromInspector));
        host.querySelector("[data-dev-undo]").addEventListener("click", () => {
            const previous = history.pop();
            if (previous) applySnapshot(previous);
        });
        host.querySelector("[data-dev-reset]").addEventListener("click", () => {
            if (!selected) return;
            pushHistory();
            clearGeometry(selected.element);
            persist();
            refreshInspector();
            scheduleOverlay();
        });
        host.querySelector("[data-dev-reset-screen]").addEventListener("click", () => {
            pushHistory();
            nodes.forEach((node) => clearGeometry(node.element));
            store = readStore();
            delete store.screens[screenId];
            writeStore(store);
            status.textContent = "Tela resetada";
            refreshInspector();
            scheduleOverlay();
        });
        host.querySelector("[data-dev-copy]").addEventListener("click", async () => {
            const payload = JSON.stringify({ screen: screenId, nodes: snapshot() }, null, 2);
            try {
                await navigator.clipboard.writeText(payload);
                status.textContent = "Layout copiado";
            } catch (_) {
                const area = document.createElement("textarea");
                area.value = payload;
                document.body.appendChild(area);
                area.select();
                document.execCommand("copy");
                area.remove();
                status.textContent = "Layout copiado";
            }
        });

        appRoot.addEventListener("pointerdown", onPointerDown, true);
        appRoot.addEventListener("click", interceptClick, true);
        overlay.addEventListener("pointerdown", onHandleDown);
        root.addEventListener("pointermove", onPointerMove, true);
        root.addEventListener("pointerup", onPointerUp, true);
        root.addEventListener("pointercancel", onPointerUp, true);
        root.addEventListener("resize", scheduleOverlay);
        root.addEventListener("scroll", scheduleOverlay, true);
        document.addEventListener("keydown", onKeyDown);

        refreshList();

        activeCleanup = () => {
            if (raf) root.cancelAnimationFrame(raf);
            appRoot.classList.remove("tq-dev-scene-editing");
            document.body.classList.remove("tq-dev-scene-editing-active");
            appRoot.removeEventListener("pointerdown", onPointerDown, true);
            appRoot.removeEventListener("click", interceptClick, true);
            root.removeEventListener("pointermove", onPointerMove, true);
            root.removeEventListener("pointerup", onPointerUp, true);
            root.removeEventListener("pointercancel", onPointerUp, true);
            root.removeEventListener("resize", scheduleOverlay);
            root.removeEventListener("scroll", scheduleOverlay, true);
            document.removeEventListener("keydown", onKeyDown);
            host.remove();
            overlay.remove();
        };
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.sceneEditor = Object.freeze({ mount });
})(globalThis);
