(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.scene-layout.v2";
    let activeCleanup = null;

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return parsed && typeof parsed === "object"
                ? { version: 2, screens: parsed.screens && typeof parsed.screens === "object" ? parsed.screens : {} }
                : { version: 2, screens: {} };
        } catch (_) {
            return { version: 2, screens: {} };
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...store,
            version: 3
        }));
    }

    function number(value, fallback) {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string" && value.trim() === "") return fallback;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function positiveScale(value, fallback = 1) {
        const parsed = number(value, fallback);
        return parsed > 0 ? parsed : fallback;
    }

    function computedGeometry(element) {
        const style = root.getComputedStyle(element);
        const translate = String(style.translate || "").trim();
        const scale = String(style.scale || "").trim();

        let x = 0;
        let y = 0;
        if (translate && translate !== "none") {
            const parts = translate.split(/\s+/);
            const parsedX = Number.parseFloat(parts[0]);
            const parsedY = Number.parseFloat(parts[1] || "0");
            if (Number.isFinite(parsedX)) x = parsedX;
            if (Number.isFinite(parsedY)) y = parsedY;
        }

        let sx = 1;
        let sy = 1;
        if (scale && scale !== "none") {
            const parts = scale.split(/\s+/);
            sx = positiveScale(parts[0], 1);
            sy = positiveScale(parts[1], sx);
        }

        return { x, y, sx, sy };
    }

    function readGeometry(element) {
        if (!element.hasAttribute("data-tq-dev-adjusted")) {
            return computedGeometry(element);
        }

        const x = Number.parseFloat(element.style.getPropertyValue("--tq-dev-x"));
        const y = Number.parseFloat(element.style.getPropertyValue("--tq-dev-y"));
        return {
            x: Number.isFinite(x) ? x : 0,
            y: Number.isFinite(y) ? y : 0,
            sx: positiveScale(element.style.getPropertyValue("--tq-dev-sx"), 1),
            sy: positiveScale(element.style.getPropertyValue("--tq-dev-sy"), 1)
        };
    }

    function applyGeometry(element, geometry) {
        const x = number(geometry?.x, 0);
        const y = number(geometry?.y, 0);
        const sx = Math.max(.05, positiveScale(geometry?.sx, 1));
        const sy = Math.max(.05, positiveScale(geometry?.sy, 1));
        element.style.setProperty("--tq-dev-x", x + "px");
        element.style.setProperty("--tq-dev-y", y + "px");
        element.style.setProperty("--tq-dev-sx", String(sx));
        element.style.setProperty("--tq-dev-sy", String(sy));
        element.setAttribute("data-tq-dev-adjusted", "true");
    }

    function clearGeometry(element) {
        element.style.removeProperty("--tq-dev-x");
        element.style.removeProperty("--tq-dev-y");
        element.style.removeProperty("--tq-dev-sx");
        element.style.removeProperty("--tq-dev-sy");
        element.removeAttribute("data-tq-dev-adjusted");
    }

    function isDeleted(element) {
        return element?.getAttribute("data-tq-dev-deleted") === "true";
    }

    function isLocked(element) {
        return element?.getAttribute("data-tq-dev-locked") === "true";
    }

    function setLocked(element, locked) {
        if (!(element instanceof Element)) return;
        if (locked) element.setAttribute("data-tq-dev-locked", "true");
        else element.removeAttribute("data-tq-dev-locked");
    }

    function setDeleted(element, deleted) {
        if (!(element instanceof Element)) return;
        if (deleted) element.setAttribute("data-tq-dev-deleted", "true");
        else element.removeAttribute("data-tq-dev-deleted");
    }

    function isDeleteProtected(node) {
        return !node || node.kind === "function";
    }

    function isDeletableVisual(node) {
        return Boolean(node) && ["asset", "overlay", "background"].includes(node.kind);
    }

    function isLayerableVisual(node) {
        return Boolean(node) && ["asset", "overlay", "background"].includes(node.kind);
    }

    function hasLayerOverride(element) {
        return element?.getAttribute("data-tq-dev-layered") === "true";
    }

    function readLayer(element) {
        if (!(element instanceof Element)) return 0;

        if (hasLayerOverride(element)) {
            const explicit = Number.parseInt(
                element.style.getPropertyValue("--tq-dev-z"),
                10
            );
            if (Number.isFinite(explicit)) return explicit;
        }

        const computed = Number.parseInt(root.getComputedStyle(element).zIndex, 10);
        return Number.isFinite(computed) ? computed : 0;
    }

    function applyLayer(element, value) {
        if (!(element instanceof Element)) return;
        const z = Math.round(clamp(number(value, 0), 0, 9999));
        element.style.setProperty("--tq-dev-z", String(z));
        element.setAttribute("data-tq-dev-layered", "true");
    }

    function clearLayer(element) {
        if (!(element instanceof Element)) return;
        element.style.removeProperty("--tq-dev-z");
        element.removeAttribute("data-tq-dev-layered");
    }

    function normalizedToken(value, fallback = "item") {
        const token = String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return token || fallback;
    }

    function inferKind(element) {
        const explicit = element.dataset.tqDevKind;
        if (explicit) return explicit;

        const className = typeof element.className === "string" ? element.className.toLowerCase() : "";
        if (className.includes("background") || className.includes("backdrop")) return "background";
        if (className.includes("overlay")) return "overlay";
        if (
            element.matches("button, a, input, select, textarea, [role='button'], [data-action]")
        ) return "function";
        if (element.matches("h1, h2, h3, h4, h5, h6, p, span, strong, b, small, label")) {
            return "dynamicText";
        }
        if (element.matches("img, picture, svg, canvas, video")) return "asset";
        return "container";
    }

    function inferLabel(element) {
        const explicit = element.dataset.tqDevLabel || element.dataset.tqAssetLabel;
        if (explicit) return explicit;

        const action = element.dataset.action || element.getAttribute("aria-label");
        if (action) return String(action).trim().slice(0, 72);

        const alt = element.getAttribute("alt");
        if (alt) return alt.trim().slice(0, 72);

        if (element.id) return "#" + element.id;

        const text = (element.textContent || "").replace(/\s+/g, " ").trim();
        if (text && text.length <= 72) return text;

        const usefulClass = [...element.classList].find((name) =>
            !name.startsWith("tq-dev-")
            && name !== "tq-screen-preparing"
            && !name.startsWith("is-")
        );
        if (usefulClass) return "." + usefulClass;

        return element.tagName.toLowerCase();
    }

    function pathSegment(element) {
        const tag = element.tagName.toLowerCase();
        const action = element.dataset.action;
        if (action) return tag + "[action-" + normalizedToken(action) + "]";

        if (element.id) return tag + "#" + normalizedToken(element.id);

        const usefulClasses = [...element.classList]
            .filter((name) => !name.startsWith("tq-dev-") && name !== "tq-screen-preparing")
            .slice(0, 2)
            .map((name) => normalizedToken(name));

        const siblings = element.parentElement
            ? [...element.parentElement.children].filter((candidate) => candidate.tagName === element.tagName)
            : [];
        const position = Math.max(1, siblings.indexOf(element) + 1);
        return tag + (usefulClasses.length ? "." + usefulClasses.join(".") : "") + ":" + position;
    }

    function generatedId(element, screenRoot, screenId) {
        const parts = [];
        let cursor = element;
        while (cursor && cursor !== screenRoot && parts.length < 8) {
            parts.push(pathSegment(cursor));
            cursor = cursor.parentElement;
        }
        parts.reverse();
        return normalizedToken(screenId, "screen") + ".auto." + parts.join(">");
    }

    function isStructuralNode(element, screenRoot) {
        if (!(element instanceof Element)) return true;
        if (element === screenRoot) return true;
        if (element.hasAttribute("data-tq-dev-structural")) return true;
        return element.matches(".tq-safe-visual-area, .tq-canonical-stage");
    }

    function shouldAutoMap(element, screenRoot) {
        if (!(element instanceof Element)) return false;
        if (isStructuralNode(element, screenRoot)) return false;
        if (element.hasAttribute("data-tq-dev-ignore")) return false;
        if (element.matches("script, style, template, source")) return false;
        if (element.closest(".tq-scene-dev, .tq-scene-dev-selection, .tq-parallax-dev")) return false;
        if (element.hasAttribute("data-tq-dev-id")) return true;
        if (element === screenRoot) return true;

        if (element.matches(
            "img, picture, svg, canvas, video, button, a, input, select, textarea, label, " +
            "h1, h2, h3, h4, h5, h6, p, span, strong, b, small, [role='button'], [data-action]"
        )) return true;

        const className = typeof element.className === "string" ? element.className.toLowerCase() : "";
        if (/(screen|stage|panel|card|slot|bar|overlay|background|hero|map|board|modal|sheet|dialog|hud|nav|menu|art|frame|reward|pet|chest|island|region)/.test(className)) {
            return true;
        }

        return element.parentElement === screenRoot;
    }

    function collectNodes(screenRoot, screenId) {
        const seen = new Set();
        const candidates = [screenRoot, ...screenRoot.querySelectorAll("*")]
            .filter((element) => shouldAutoMap(element, screenRoot));

        return candidates
            .map((element) => {
                const explicitId = element.dataset.tqDevId;
                const id = explicitId || generatedId(element, screenRoot, screenId);
                if (!id || seen.has(id)) return null;
                seen.add(id);

                if (!explicitId) {
                    element.dataset.tqDevId = id;
                    element.dataset.tqDevGenerated = "true";
                    element.dataset.tqDevKind = inferKind(element);
                    element.dataset.tqDevLabel = inferLabel(element);
                }

                return {
                    id,
                    kind: inferKind(element),
                    label: inferLabel(element),
                    role: element.dataset.tqDevRole || element.dataset.tqAssetRole || element.tagName.toLowerCase(),
                    action: element.dataset.tqDevAction || element.dataset.action || "",
                    generated: !explicitId,
                    element
                };
            })
            .filter(Boolean);
    }

    function stageScale(element) {
        const stage = element.closest(".tq-canonical-stage, .tq-safe-visual-area, [class*='-stage']")
            || element.closest("section")
            || element.parentElement;
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
            background: "Fundo",
            container: "Container"
        })[kind] || kind;
    }

    function mount(appRoot, options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const screenId = String(options.screenId || "screen");
        const screenRoot = options.screenRoot instanceof Element
            ? options.screenRoot
            : appRoot.firstElementChild || appRoot;
        const nodes = collectNodes(screenRoot, screenId);
        if (!nodes.length) return;

        let store = readStore();
        const saved = store.screens[screenId] || {};

        // The screen shell, safe visual area and canonical stage define the
        // coordinate system. They are rulers, not editable artwork.
        // Clear any stale DEV geometry left by older editor versions and
        // ignore legacy saved entries for those structural nodes.
        [screenRoot, ...screenRoot.querySelectorAll(".tq-safe-visual-area, .tq-canonical-stage, [data-tq-dev-ignore]")]
            .forEach((element) => {
                clearGeometry(element);
                clearLayer(element);
                element.removeAttribute("data-tq-dev-id");
                element.removeAttribute("data-tq-dev-generated");
                element.removeAttribute("data-tq-dev-kind");
                element.removeAttribute("data-tq-dev-label");
            });

        const legacyStructuralIds = Object.keys(saved).filter((id) => {
            if (id === normalizedToken(screenId, "screen") + ".auto.") return true;
            if (id === "home.background.bleed") return true;

            // Generated descendant ids contain their entire ancestry. Looking for
            // "tq-safe-visual-area" anywhere in the id therefore deletes every
            // child asset as well. Only the LAST path segment may be structural.
            const tail = String(id).split(">").pop() || "";
            return tail.includes("tq-safe-visual-area")
                || tail.includes("tq-canonical-stage")
                || tail.includes("home-world");
        });
        if (legacyStructuralIds.length) {
            legacyStructuralIds.forEach((id) => delete saved[id]);
            store.screens[screenId] = saved;
            writeStore(store);
        }

        nodes.forEach((node) => {
            if (!saved[node.id]) return;
            applyGeometry(node.element, saved[node.id]);
            setDeleted(node.element, Boolean(saved[node.id].deleted));
            setLocked(node.element, Boolean(saved[node.id].locked));
            if (Number.isFinite(Number(saved[node.id].z))) {
                applyLayer(node.element, saved[node.id].z);
            } else {
                clearLayer(node.element);
            }
        });

        const nodeById = new Map(nodes.map((node) => [node.id, node]));
        const host = document.createElement("aside");
        host.className = "tq-scene-dev";
        host.innerHTML = `
            <button type="button" class="tq-scene-dev-toggle">UX</button>
            <section class="tq-scene-dev-panel" hidden>
                <header>
                    <strong>UX · Editor visual</strong>
                    <div class="tq-scene-dev-header-actions">
                        <span data-dev-status>Pronto</span>
                        <button type="button" class="tq-scene-dev-collapse" data-dev-collapse aria-label="Recolher editor">Recolher</button>
                    </div>
                </header>
                <label>Mostrar
                    <select data-dev-filter>
                        <option value="all">Tudo</option>
                        <option value="asset">Assets</option>
                        <option value="function">Funções</option>
                        <option value="dynamicText">Textos</option>
                        <option value="overlay">Overlays</option>
                        <option value="background">Fundos</option>
                        <option value="container">Containers</option>
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
                <div class="tq-scene-dev-layer-tools">
                    <div class="tq-scene-dev-layer-heading">
                        <strong>Camada visual</strong>
                        <span data-dev-layer-value></span>
                    </div>
                    <div class="tq-scene-dev-actions">
                        <button type="button" data-dev-layer-back>↧ Fundo</button>
                        <button type="button" data-dev-layer-down>↓ Recuar</button>
                    </div>
                    <div class="tq-scene-dev-actions">
                        <button type="button" data-dev-layer-up>↑ Avançar</button>
                        <button type="button" data-dev-layer-front>↥ Frente</button>
                    </div>
                </div>
                <div class="tq-scene-dev-actions">
                    <button type="button" data-dev-undo>↶ Desfazer</button>
                    <button type="button" data-dev-reset>Resetar item</button>
                    <button type="button" class="tq-scene-dev-lock" data-dev-lock-item aria-pressed="false">🔒 Bloquear</button>
                    <button type="button" class="tq-scene-dev-delete" data-dev-delete aria-label="Excluir elemento visual selecionado">🗑 Excluir visual</button>
                </div>
                <div class="tq-scene-dev-actions">
                    <button type="button" data-dev-copy>Copiar layout</button>
                    <button type="button" data-dev-reset-screen>Resetar tela</button>
                </div>
                <div class="tq-scene-dev-actions">
                    <button type="button" data-dev-clear-functions>Limpar funções</button>
                </div>
                <small>Arraste qualquer item mapeado. Use as alças para redimensionar. Setas movem 1 px; Shift + setas movem 10 px. DEL remove assets visuais. Page Up/Page Down muda a camada; com Shift envia direto para frente/fundo. Funções são protegidas.</small>
            </section>
            <div class="tq-scene-dev-compact" data-dev-compact hidden>
                <button type="button" class="tq-scene-dev-compact-current" data-dev-compact-adjust aria-label="Abrir ajustes do elemento selecionado">
                    <span data-dev-compact-name>Nenhum selecionado</span>
                    <small>Ajustar</small>
                </button>
                <button type="button" data-dev-compact-save aria-label="Salvar item e selecionar outro" title="Salvar e próximo">✓</button>
                <button type="button" data-dev-compact-undo aria-label="Desfazer última alteração" title="Desfazer">↶</button>
                <button type="button" class="tq-scene-dev-compact-lock" data-dev-compact-lock aria-label="Bloquear elemento selecionado" title="Bloquear">🔒</button>
                <button type="button" class="tq-scene-dev-compact-delete" data-dev-compact-delete aria-label="Excluir elemento visual selecionado" title="Excluir visual">🗑</button>
                <button type="button" data-dev-compact-close aria-label="Sair do editor visual" title="Fechar editor">×</button>
            </div>
        `;
        document.body.appendChild(host);

        const overlay = document.createElement("div");
        overlay.className = "tq-scene-dev-selection";
        overlay.hidden = true;
        overlay.innerHTML = `
            <span class="tq-scene-dev-selection-move-surface" data-dev-move-surface aria-hidden="true"></span>
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
        const compactBar = host.querySelector("[data-dev-compact]");
        const compactName = host.querySelector("[data-dev-compact-name]");
        const compactAdjustButton = host.querySelector("[data-dev-compact-adjust]");
        const compactSaveButton = host.querySelector("[data-dev-compact-save]");
        const compactUndoButton = host.querySelector("[data-dev-compact-undo]");
        const compactLockButton = host.querySelector("[data-dev-compact-lock]");
        const compactDeleteButton = host.querySelector("[data-dev-compact-delete]");
        const compactCloseButton = host.querySelector("[data-dev-compact-close]");
        const lockItemButton = host.querySelector("[data-dev-lock-item]");
        const deleteButton = host.querySelector("[data-dev-delete]");
        const collapseButton = host.querySelector("[data-dev-collapse]");
        const clearFunctionsButton = host.querySelector("[data-dev-clear-functions]");
        const name = host.querySelector("[data-dev-name]");
        const type = host.querySelector("[data-dev-type]");
        const action = host.querySelector("[data-dev-action]");
        const inputX = host.querySelector("[data-dev-x]");
        const inputY = host.querySelector("[data-dev-y]");
        const inputSx = host.querySelector("[data-dev-sx]");
        const inputSy = host.querySelector("[data-dev-sy]");
        const lockRatio = host.querySelector("[data-dev-lock]");
        const layerValue = host.querySelector("[data-dev-layer-value]");
        const layerBackButton = host.querySelector("[data-dev-layer-back]");
        const layerDownButton = host.querySelector("[data-dev-layer-down]");
        const layerUpButton = host.querySelector("[data-dev-layer-up]");
        const layerFrontButton = host.querySelector("[data-dev-layer-front]");
        const layerButtons = [
            layerBackButton,
            layerDownButton,
            layerUpButton,
            layerFrontButton
        ];
        const mobileEditorQuery = root.matchMedia("(max-width: 620px)");
        let opened = false;
        let collapsed = false;
        let functionsHidden = false;
        let selected = null;
        let interaction = null;
        let history = [];
        let raf = 0;

        function snapshot(targetNodes = nodes) {
            return Object.fromEntries(targetNodes
                .filter((node) => node?.id && node?.element instanceof Element)
                .map((node) => [
                    node.id,
                    {
                        ...readGeometry(node.element),
                        ...(isDeleted(node.element) ? { deleted: true } : {}),
                        ...(isLocked(node.element) ? { locked: true } : {}),
                        ...(hasLayerOverride(node.element) ? { z: readLayer(node.element) } : {})
                    }
                ]));
        }

        function pushHistory(targetNodes = null) {
            const capturedNodes = Array.isArray(targetNodes)
                ? targetNodes
                : (selected ? [selected] : nodes);

            history.push({
                version: 1,
                nodes: snapshot(capturedNodes)
            });
            if (history.length > 30) history.shift();
            syncEditorChrome();
        }

        function persist(message = "Salvo") {
            store = readStore();

            // Merge the currently mounted scene into the saved layout instead of
            // replacing the whole screen record. Conditional/dynamic elements may
            // disappear during a game-state render and must keep their geometry
            // for when they return.
            const previous = store.screens[screenId] && typeof store.screens[screenId] === "object"
                ? store.screens[screenId]
                : {};
            store.screens[screenId] = {
                ...previous,
                ...snapshot()
            };

            writeStore(store);
            status.textContent = message;
        }

        function applySnapshot(snapshotValue) {
            // New history entries are patches: only captured nodes are restored.
            // Plain objects are still accepted for compatibility with older history.
            const patch = snapshotValue?.nodes && typeof snapshotValue.nodes === "object"
                ? snapshotValue.nodes
                : snapshotValue;

            if (!patch || typeof patch !== "object") return;

            Object.entries(patch).forEach(([id, geometry]) => {
                const node = nodeById.get(id);
                if (!node || !geometry) return;

                applyGeometry(node.element, geometry);
                setDeleted(node.element, Boolean(geometry.deleted));
                setLocked(node.element, Boolean(geometry.locked));

                if (Number.isFinite(Number(geometry.z))) {
                    applyLayer(node.element, geometry.z);
                } else {
                    clearLayer(node.element);
                }
            });

            persist("Alteração desfeita");
            refreshList();
            refreshInspector();
            scheduleOverlay();
            syncEditorChrome();
        }

        function filteredNodes() {
            const visibleNodes = nodes.filter((node) =>
                !isDeleted(node.element)
                && !(functionsHidden && node.kind === "function")
            );
            const filter = filterSelect.value;
            return filter === "all"
                ? visibleNodes
                : visibleNodes.filter((node) => node.kind === filter);
        }

        function refreshList() {
            const available = filteredNodes();
            const options = available.map((node) => {
                const option = document.createElement("option");
                option.value = node.id;
                option.textContent = (isLocked(node.element) ? "🔒 " : "") + node.label + " · " + kindLabel(node.kind);
                return option;
            });
            nodeSelect.replaceChildren(...options);
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
                [inputX, inputY, inputSx, inputSy].forEach((input) => {
                    input.value = "";
                    input.disabled = true;
                });
                layerButtons.forEach((button) => button.disabled = true);
                layerValue.textContent = "";
                syncEditorChrome();
                return;
            }
            const geometry = readGeometry(selected.element);
            const locked = isLocked(selected.element);
            name.textContent = (locked ? "🔒 " : "") + selected.label;
            type.textContent = kindLabel(selected.kind) + (selected.role ? " · " + selected.role : "") + (locked ? " · BLOQUEADO" : "");
            action.textContent = selected.action ? "Ação: " + selected.action : "";
            inputX.value = Math.round(geometry.x * 100) / 100;
            inputY.value = Math.round(geometry.y * 100) / 100;
            inputSx.value = Math.round(geometry.sx * 10000) / 100;
            inputSy.value = Math.round(geometry.sy * 10000) / 100;
            [inputX, inputY, inputSx, inputSy].forEach((input) => input.disabled = locked);
            const layerable = isLayerableVisual(selected);
            layerButtons.forEach((button) => button.disabled = !layerable);
            layerValue.textContent = layerable ? "z " + readLayer(selected.element) : "protegido";
            syncEditorChrome();
        }

        function updateOverlay() {
            raf = 0;
            if (!opened || !selected || !selected.element.isConnected || isDeleted(selected.element)) {
                overlay.hidden = true;
                return;
            }
            const rect = selected.element.getBoundingClientRect();
            overlay.hidden = false;
            const locked = isLocked(selected.element);
            overlay.classList.toggle("tq-scene-dev-selection--compact", rect.width < 72 || rect.height < 72);
            overlay.classList.toggle("tq-scene-dev-selection--locked", locked);
            overlay.style.left = rect.left + "px";
            overlay.style.top = rect.top + "px";
            overlay.style.width = rect.width + "px";
            overlay.style.height = rect.height + "px";
            overlay.querySelector(".tq-scene-dev-selection-label").textContent =
                (isLocked(selected.element) ? "🔒 " : "") + selected.label;
        }

        function scheduleOverlay() {
            if (raf) return;
            raf = root.requestAnimationFrame(updateOverlay);
        }

        function isMobileEditor() {
            return mobileEditorQuery.matches;
        }

        function syncEditorChrome() {
            const compactVisible = opened && collapsed && isMobileEditor();
            appRoot.classList.toggle("tq-dev-functions-hidden", opened && functionsHidden);
            clearFunctionsButton.textContent = functionsHidden ? "Mostrar funções" : "Limpar funções";
            clearFunctionsButton.setAttribute("aria-pressed", functionsHidden ? "true" : "false");
            panel.hidden = !opened || compactVisible;
            compactBar.hidden = !compactVisible;
            const selectedLocked = Boolean(selected && isLocked(selected.element));
            compactName.textContent = selected
                ? (selectedLocked ? "🔒 " : "") + selected.label
                : "Toque no próximo elemento";
            compactSaveButton.disabled = !selected;
            compactUndoButton.disabled = history.length === 0;
            compactLockButton.disabled = !selected;
            compactLockButton.textContent = selectedLocked ? "🔒" : "🔓";
            compactLockButton.title = selectedLocked ? "Bloqueado · toque para desbloquear" : "Livre · toque para bloquear";
            compactLockButton.setAttribute("aria-label", selectedLocked ? "Elemento bloqueado. Toque para desbloquear" : "Elemento livre. Toque para bloquear");
            compactLockButton.setAttribute("aria-pressed", selectedLocked ? "true" : "false");
            lockItemButton.disabled = !selected;
            lockItemButton.textContent = selectedLocked ? "🔒 BLOQUEADO" : "🔓 LIVRE";
            lockItemButton.title = selectedLocked ? "Toque para desbloquear" : "Toque para bloquear";
            lockItemButton.setAttribute("aria-pressed", selectedLocked ? "true" : "false");
            const canDelete = Boolean(selected && isDeletableVisual(selected) && !isDeleteProtected(selected));
            compactDeleteButton.disabled = !canDelete;
            deleteButton.disabled = !canDelete;
            host.classList.toggle("tq-scene-dev--collapsed", compactVisible);
        }

        function setCollapsed(nextCollapsed) {
            collapsed = Boolean(nextCollapsed && opened && isMobileEditor());
            syncEditorChrome();
            scheduleOverlay();
        }

        function setFunctionsHidden(nextHidden) {
            functionsHidden = Boolean(nextHidden);

            if (functionsHidden && selected?.kind === "function") {
                selected.element.removeAttribute("data-tq-dev-selected");
                selected = null;
                overlay.hidden = true;
            }

            if (functionsHidden && filterSelect.value === "function") {
                filterSelect.value = "all";
            }

            refreshList();
            refreshInspector();
            syncEditorChrome();
            scheduleOverlay();
            status.textContent = functionsHidden
                ? "Funções removidas da área de edição"
                : "Funções visíveis na área de edição";
        }

        function toggleSelectedLock() {
            if (!selected) return;

            const nextLocked = !isLocked(selected.element);
            pushHistory();
            setLocked(selected.element, nextLocked);

            if (nextLocked && interaction?.node === selected) {
                interaction = null;
            }

            persist(nextLocked ? "Elemento bloqueado" : "Elemento desbloqueado");
            refreshList();
            if (selected) nodeSelect.value = selected.id;
            refreshInspector();
            scheduleOverlay();
            syncEditorChrome();
        }

        function saveAndSelectNext() {
            if (!selected) return;

            persist("Salvo · selecione outro elemento");
            selected.element.removeAttribute("data-tq-dev-selected");
            selected = null;
            overlay.hidden = true;

            if (isMobileEditor()) {
                collapsed = true;
            }

            refreshInspector();
            syncEditorChrome();
        }

        function undoLastChange() {
            const previous = history.pop();
            if (previous) applySnapshot(previous);
            else syncEditorChrome();
        }

        function deleteSelectedVisual() {
            if (!selected) return;

            if (isDeleteProtected(selected)) {
                status.textContent = "Funções são protegidas e não podem ser excluídas";
                syncEditorChrome();
                return;
            }

            if (!isDeletableVisual(selected)) {
                status.textContent = "Excluir é permitido somente para assets visuais";
                syncEditorChrome();
                return;
            }

            pushHistory();
            const deletedLabel = selected.label;
            setDeleted(selected.element, true);
            persist("Asset excluído · Desfazer restaura");
            refreshList();

            if (!selected || isDeleted(selected.element)) {
                const next = filteredNodes()[0] || null;
                selectNode(next);
            }

            status.textContent = deletedLabel + " excluído · Desfazer restaura";
            scheduleOverlay();
            syncEditorChrome();
        }

        function onMobileEditorChange() {
            if (!isMobileEditor()) collapsed = false;
            syncEditorChrome();
            scheduleOverlay();
        }

        function selectNode(node) {
            if (selected) selected.element.removeAttribute("data-tq-dev-selected");
            selected = node || null;
            if (selected) {
                selected.element.setAttribute("data-tq-dev-selected", "true");
                if (isLocked(selected.element)) {
                    status.textContent = "🔒 " + selected.label + " está bloqueado";
                }
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

            if (isLocked(node.element)) {
                status.textContent = "Elemento bloqueado · toque em Desbloquear para editar";
                scheduleOverlay();
                return;
            }

            const rect = node.element.getBoundingClientRect();
            const stage = node.element.closest(".tq-canonical-stage, .tq-safe-visual-area, [class*='-stage']")
                || screenRoot;
            const pointerTarget = event.target instanceof Element
                && typeof event.target.setPointerCapture === "function"
                    ? event.target
                    : null;

            try {
                pointerTarget?.setPointerCapture(event.pointerId);
            } catch (_) {}

            interaction = {
                node,
                mode,
                handle,
                pointerId: event.pointerId,
                pointerTarget,
                startX: event.clientX,
                startY: event.clientY,
                rect,
                stageRect: stage?.getBoundingClientRect() || null,
                scale: stageScale(node.element),
                geometry: readGeometry(node.element),
                changed: false
            };
        }

        function onPointerDown(event) {
            if (!opened) return;
            const element = event.target.closest?.("[data-tq-dev-id]");
            if (!element || !appRoot.contains(element)) return;
            const node = nodeById.get(element.dataset.tqDevId);
            if (!node || (functionsHidden && node.kind === "function")) return;
            startInteraction(event, node, "move");
        }

        function onSelectionOverlayDown(event) {
            if (!opened || !selected) return;

            const handle = event.target.closest("[data-dev-handle]")?.dataset.devHandle;
            if (handle) {
                startInteraction(event, selected, "resize", handle);
                return;
            }

            if (event.target.closest("[data-dev-move-surface], .tq-scene-dev-selection-label")) {
                startInteraction(event, selected, "move");
            }
        }

        function onPointerMove(event) {
            if (!interaction || event.pointerId !== interaction.pointerId) return;

            const node = interaction.node;
            if (!node?.element?.isConnected) {
                interaction = null;
                return;
            }
            if (selected !== node) selectNode(node);

            const rawDx = event.clientX - interaction.startX;
            const rawDy = event.clientY - interaction.startY;
            let dx = rawDx;
            let dy = rawDy;

            if (interaction.mode === "move" && interaction.stageRect) {
                const bounds = interaction.stageRect;
                const visibleX = Math.min(24, Math.max(8, interaction.rect.width * .2));
                const visibleY = Math.min(24, Math.max(8, interaction.rect.height * .2));

                dx = clamp(
                    rawDx,
                    bounds.left + visibleX - interaction.rect.right,
                    bounds.right - visibleX - interaction.rect.left
                );
                dy = clamp(
                    rawDy,
                    bounds.top + visibleY - interaction.rect.bottom,
                    bounds.bottom - visibleY - interaction.rect.top
                );
            }

            if (!interaction.changed && (Math.abs(rawDx) > 2 || Math.abs(rawDy) > 2)) {
                pushHistory();
                interaction.changed = true;
            }
            if (!interaction.changed) return;

            const scale = interaction.scale || { x: 1, y: 1 };
            const scaleX = Math.abs(scale.x) > .0001 ? scale.x : 1;
            const scaleY = Math.abs(scale.y) > .0001 ? scale.y : 1;

            if (interaction.mode === "move") {
                applyGeometry(node.element, {
                    ...interaction.geometry,
                    x: interaction.geometry.x + dx / scaleX,
                    y: interaction.geometry.y + dy / scaleY
                });
            } else {
                const handle = interaction.handle;
                let width = interaction.rect.width;
                let height = interaction.rect.height;
                if (handle.includes("e")) width += rawDx;
                if (handle.includes("w")) width -= rawDx;
                if (handle.includes("s")) height += rawDy;
                if (handle.includes("n")) height -= rawDy;

                const minimumRenderedSize = node.kind === "dynamicText" ? 18 : 28;
                width = Math.max(minimumRenderedSize, width);
                height = Math.max(minimumRenderedSize, height);

                if (lockRatio.checked && handle.length === 2) {
                    const ratio = interaction.rect.width / Math.max(1, interaction.rect.height);
                    const widthDelta = Math.abs(width - interaction.rect.width) / Math.max(1, interaction.rect.width);
                    const heightDelta = Math.abs(height - interaction.rect.height) / Math.max(1, interaction.rect.height);
                    if (widthDelta >= heightDelta) height = width / ratio;
                    else width = height * ratio;
                }

                const sx = Math.max(.05, interaction.geometry.sx * (width / Math.max(1, interaction.rect.width)));
                const sy = Math.max(.05, interaction.geometry.sy * (height / Math.max(1, interaction.rect.height)));
                const moveX = handle.includes("w") ? (interaction.rect.width - width) / scaleX : 0;
                const moveY = handle.includes("n") ? (interaction.rect.height - height) / scaleY : 0;

                applyGeometry(node.element, {
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
            const pointerTarget = interaction.pointerTarget;
            interaction = null;

            try {
                if (pointerTarget?.hasPointerCapture?.(event.pointerId)) {
                    pointerTarget.releasePointerCapture(event.pointerId);
                }
            } catch (_) {}

            if (changed) persist();
        }

        function setFromInspector() {
            if (!selected) return;
            if (isLocked(selected.element)) {
                status.textContent = "Elemento bloqueado · desbloqueie para alterar";
                refreshInspector();
                return;
            }
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

        function layerPeers(node) {
            if (!node?.element?.parentElement) return [];

            const parent = node.element.parentElement;
            return nodes.filter((candidate) =>
                candidate !== node
                && isLayerableVisual(candidate)
                && !isDeleted(candidate.element)
                && candidate.element.parentElement === parent
            );
        }

        function changeSelectedLayer(actionName) {
            if (!selected) return;
            if (!isLayerableVisual(selected)) {
                status.textContent = "Funções e textos não mudam de camada";
                return;
            }

            const peers = layerPeers(selected);
            if (!peers.length) {
                status.textContent = "Não há outra camada visual nesse grupo";
                return;
            }

            const current = readLayer(selected.element);
            const byLayer = peers
                .map((node) => ({ node, z: readLayer(node.element) }))
                .sort((a, b) => a.z - b.z);

            let targetEntry = null;

            if (actionName === "back") {
                targetEntry = byLayer[0];
            } else if (actionName === "front") {
                targetEntry = byLayer[byLayer.length - 1];
            } else if (actionName === "down") {
                targetEntry = [...byLayer]
                    .reverse()
                    .find((entry) => entry.z < current) || byLayer[0];
            } else if (actionName === "up") {
                targetEntry = byLayer
                    .find((entry) => entry.z > current) || byLayer[byLayer.length - 1];
            }

            if (!targetEntry) return;

            const targetZ = targetEntry.z;
            if (targetZ === current) {
                const delta = actionName === "back" || actionName === "down" ? -1 : 1;
                pushHistory([selected]);
                applyLayer(selected.element, clamp(current + delta, 0, 9999));
            } else {
                pushHistory([selected, targetEntry.node]);
                applyLayer(selected.element, targetZ);
                applyLayer(targetEntry.node.element, current);
            }

            persist(
                actionName === "back" ? "Enviado para o fundo"
                : actionName === "front" ? "Trazido para a frente"
                : actionName === "down" ? "Recuou para a camada anterior"
                : "Avançou para a próxima camada"
            );
            refreshInspector();
            scheduleOverlay();
        }

        function interceptClick(event) {
            if (!opened || !screenRoot.contains(event.target)) return;
            const element = event.target.closest?.("[data-tq-dev-id]");
            if (element) {
                const node = nodeById.get(element.dataset.tqDevId);
                if (node && !(functionsHidden && node.kind === "function")) {
                    selectNode(node);
                }
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        function onKeyDown(event) {
            if (!opened || !selected) return;
            if (
                event.target instanceof HTMLInputElement
                || event.target instanceof HTMLSelectElement
                || event.target instanceof HTMLTextAreaElement
                || event.target?.isContentEditable
            ) return;

            if (event.key === "PageDown") {
                event.preventDefault();
                changeSelectedLayer(event.shiftKey ? "back" : "down");
                return;
            }

            if (event.key === "PageUp") {
                event.preventDefault();
                changeSelectedLayer(event.shiftKey ? "front" : "up");
                return;
            }

            if (event.key === "Delete") {
                event.preventDefault();
                deleteSelectedVisual();
                return;
            }

            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            if (isLocked(selected.element)) {
                status.textContent = "Elemento bloqueado · desbloqueie para mover";
                return;
            }
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

        function closeOtherToolPanels() {
            document.querySelectorAll(".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-parallax-dev-panel").forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
        }

        function announceToolOpen() {
            root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                detail: { tool: "ux" }
            }));
        }


        function setOpened(nextOpened) {
            opened = nextOpened;
            collapsed = false;
            if (opened) {
                closeOtherToolPanels();
                announceToolOpen();
            }
            appRoot.classList.toggle("tq-dev-scene-editing", opened);
            document.body.classList.toggle("tq-dev-scene-editing-active", opened);
            syncEditorChrome();
            if (!opened) overlay.hidden = true;
            else {
                if (!selected && nodes.length) selectNode(nodes[0]);
                scheduleOverlay();
            }
        }

        function onDevToolActivate(event) {
            if (event.detail?.tool !== "ux" && opened) setOpened(false);
        }

        root.addEventListener("tq:dev-tool-activate", onDevToolActivate);

        host.querySelector(".tq-scene-dev-toggle").addEventListener("click", () => setOpened(!opened));
        filterSelect.addEventListener("change", refreshList);
        nodeSelect.addEventListener("change", () => {
            selectNode(nodeById.get(nodeSelect.value) || null);
            if (selected && isMobileEditor()) setCollapsed(true);
        });
        collapseButton.addEventListener("click", () => setCollapsed(true));
        clearFunctionsButton.addEventListener("click", () => setFunctionsHidden(!functionsHidden));
        compactAdjustButton.addEventListener("click", () => setCollapsed(false));
        compactSaveButton.addEventListener("click", saveAndSelectNext);
        compactUndoButton.addEventListener("click", undoLastChange);
        compactLockButton.addEventListener("click", toggleSelectedLock);
        compactDeleteButton.addEventListener("click", deleteSelectedVisual);
        compactCloseButton.addEventListener("click", () => setOpened(false));
        [inputX, inputY, inputSx, inputSy].forEach((input) => input.addEventListener("change", setFromInspector));
        layerBackButton.addEventListener("click", () => changeSelectedLayer("back"));
        layerDownButton.addEventListener("click", () => changeSelectedLayer("down"));
        layerUpButton.addEventListener("click", () => changeSelectedLayer("up"));
        layerFrontButton.addEventListener("click", () => changeSelectedLayer("front"));

        host.querySelector("[data-dev-undo]").addEventListener("click", undoLastChange);
        lockItemButton.addEventListener("click", toggleSelectedLock);
        deleteButton.addEventListener("click", deleteSelectedVisual);
        host.querySelector("[data-dev-reset]").addEventListener("click", () => {
            if (!selected) return;
            pushHistory();
            clearGeometry(selected.element);
            clearLayer(selected.element);
            setDeleted(selected.element, false);
            setLocked(selected.element, false);
            persist();
            refreshInspector();
            scheduleOverlay();
        });
        host.querySelector("[data-dev-reset-screen]").addEventListener("click", async () => {
            pushHistory(nodes);
            status.textContent = "Limpando dados locais...";

            nodes.forEach((node) => {
                clearGeometry(node.element);
                clearLayer(node.element);
                setDeleted(node.element, false);
                setLocked(node.element, false);
            });

            store = readStore();
            delete store.screens[screenId];
            writeStore(store);

            try {
                await TQ.dev?.assetUploader?.clearLocalLayersForScreen?.(screenId, screenRoot);
            } catch (error) {
                console.warn("Falha ao limpar assets locais antes do reset:", error);
            }

            status.textContent = "Recarregando versão da web...";
            root.setTimeout(() => root.location.reload(), 80);
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

        screenRoot.addEventListener("pointerdown", onPointerDown, true);
        screenRoot.addEventListener("click", interceptClick, true);
        overlay.addEventListener("pointerdown", onSelectionOverlayDown);
        root.addEventListener("pointermove", onPointerMove, true);
        root.addEventListener("pointerup", onPointerUp, true);
        root.addEventListener("pointercancel", onPointerUp, true);
        root.addEventListener("resize", scheduleOverlay);
        root.addEventListener("scroll", scheduleOverlay, true);
        document.addEventListener("keydown", onKeyDown);
        if (typeof mobileEditorQuery.addEventListener === "function") {
            mobileEditorQuery.addEventListener("change", onMobileEditorChange);
        } else {
            mobileEditorQuery.addListener?.(onMobileEditorChange);
        }

        refreshList();

        const initialSelectedId = String(options.initialSelectedId || "");
        if (initialSelectedId && nodeById.has(initialSelectedId)) {
            filterSelect.value = "all";
            refreshList();
            selectNode(nodeById.get(initialSelectedId));
        }
        if (options.initialOpen) {
            setOpened(true);
        }

        activeCleanup = () => {
            if (raf) root.cancelAnimationFrame(raf);
            appRoot.classList.remove("tq-dev-scene-editing");
            appRoot.classList.remove("tq-dev-functions-hidden");
            document.body.classList.remove("tq-dev-scene-editing-active");
            screenRoot.removeEventListener("pointerdown", onPointerDown, true);
            screenRoot.removeEventListener("click", interceptClick, true);
            root.removeEventListener("pointermove", onPointerMove, true);
            root.removeEventListener("pointerup", onPointerUp, true);
            root.removeEventListener("pointercancel", onPointerUp, true);
            root.removeEventListener("resize", scheduleOverlay);
            root.removeEventListener("scroll", scheduleOverlay, true);
            root.removeEventListener("tq:dev-tool-activate", onDevToolActivate);
            document.removeEventListener("keydown", onKeyDown);
            if (typeof mobileEditorQuery.removeEventListener === "function") {
                mobileEditorQuery.removeEventListener("change", onMobileEditorChange);
            } else {
                mobileEditorQuery.removeListener?.(onMobileEditorChange);
            }
            host.remove();
            overlay.removeEventListener("pointerdown", onSelectionOverlayDown);
            overlay.remove();
        };
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.sceneEditor = Object.freeze({ mount });
})(globalThis);
