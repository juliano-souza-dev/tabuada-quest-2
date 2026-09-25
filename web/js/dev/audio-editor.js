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

    function assetPath(folder, src) {
        const raw = String(src || "").trim();
        if (!raw) return "";
        if (/^(?:https?:|data:|blob:|\/)/i.test(raw) || raw.startsWith("./assets/")) {
            return raw;
        }
        return String(folder || "").replace(/\/?$/, "/") + raw.replace(/^\.\//, "");
    }

    async function loadCatalog(url) {
        if (!url) return [];
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) return [];
            const manifest = await response.json();
            const folder = String(manifest?.folder || "");
            const explicit = Array.isArray(manifest?.audio?.catalog)
                ? manifest.audio.catalog
                : null;
            if (explicit) {
                return explicit
                    .map((item, index) => ({
                        id: String(item?.id || "catalog-" + (index + 1)),
                        label: String(item?.label || item?.src || "Áudio " + (index + 1)),
                        src: assetPath(folder, item?.src),
                        role: String(item?.role || "ambient"),
                        loop: item?.loop !== false,
                        autoplay: Boolean(item?.autoplay),
                        volume: Number.isFinite(Number(item?.volume)) ? Number(item.volume) : 50
                    }))
                    .filter((item) => item.src);
            }

            const audioGroups = manifest?.audio && typeof manifest.audio === "object"
                ? manifest.audio
                : {};
            const files = Object.entries(audioGroups)
                .filter(([key, value]) => key !== "catalog" && Array.isArray(value))
                .flatMap(([role, value]) => value.map((src) => ({ role, src })));
            return files.map((item, index) => ({
                id: "catalog-" + (index + 1),
                label: String(item.src).split("/").pop() || "Áudio " + (index + 1),
                src: assetPath(folder, item.src),
                role: item.role === "music" || item.role === "effect" ? item.role : "ambient",
                loop: true,
                autoplay: false,
                volume: 50
            }));
        } catch (_) {
            return [];
        }
    }

    function normalizeCatalogItems(items) {
        return (Array.isArray(items) ? items : [])
            .map((item, index) => ({
                id: String(item?.id || "catalog-" + (index + 1)),
                label: String(item?.label || item?.src || "Áudio " + (index + 1)),
                src: String(item?.src || "").trim(),
                role: String(item?.role || "ambient"),
                loop: item?.loop !== false,
                autoplay: Boolean(item?.autoplay),
                volume: Number.isFinite(Number(item?.volume)) ? Number(item.volume) : 50
            }))
            .filter((item) => item.src);
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const scopeId = String(options.scopeId || "");
        const regionId = Number(options.regionId) || null;
        const controller = options.controller || null;
        const catalogUrl = String(options.catalogUrl || "");
        const suppliedCatalog = normalizeCatalogItems(options.catalog);

        document.querySelector(".tq-audio-dev")?.remove();

        if (!screenRoot || !scopeId || !TQ.core?.audioScene) {
            return () => {};
        }

        let config = TQ.core.audioScene.readConfig(scopeId, regionId);
        let catalog = suppliedCatalog;
        let preview = null;

        const host = document.createElement("aside");
        host.className = "tq-audio-dev";
        host.innerHTML = `
            <button type="button" class="tq-audio-dev-toggle" aria-label="Editar sons da tela">SOM</button>
            <section class="tq-audio-dev-panel" hidden>
                <header>
                    <strong>SOM · Tela</strong>
                    <span data-audio-status>Salvo automaticamente</span>
                </header>

                <label class="tq-audio-switch">
                    <input type="checkbox" data-audio-enabled>
                    <span>Usar áudio nesta tela</span>
                </label>

                <section class="tq-audio-library" data-audio-library>
                    <strong>Biblioteca desta composição</strong>
                    <div data-audio-catalog><small>Carregando sons disponíveis...</small></div>
                </section>

                <fieldset>
                    <legend>Adicionar outro áudio</legend>
                    <label>Nome
                        <input type="text" data-audio-new-label placeholder="Ex.: Vento do porto">
                    </label>
                    <label>Arquivo de áudio
                        <input type="text" data-audio-new-src placeholder="./assets/.../som.mp3">
                    </label>
                    <button type="button" data-audio-add>Adicionar à tela</button>
                </fieldset>

                <section class="tq-audio-tracks">
                    <strong>Áudios desta tela</strong>
                    <div data-audio-tracks></div>
                </section>

                <div class="tq-audio-actions">
                    <button type="button" data-audio-stop>Parar testes</button>
                    <button type="button" data-audio-clear>Remover todos</button>
                </div>
                <small class="tq-audio-note">O SOM é salvo por tela/cenário e segue junto no botão Copiar layout.</small>
            </section>
        `;
        document.body.appendChild(host);

        const panel = host.querySelector(".tq-audio-dev-panel");
        const status = host.querySelector("[data-audio-status]");
        const enabled = host.querySelector("[data-audio-enabled]");
        const catalogHost = host.querySelector("[data-audio-catalog]");
        const tracksHost = host.querySelector("[data-audio-tracks]");
        const newLabel = host.querySelector("[data-audio-new-label]");
        const newSrc = host.querySelector("[data-audio-new-src]");

        function stopPreview() {
            if (!preview) return;
            preview.pause?.();
            try { preview.currentTime = 0; } catch (_) {}
            preview = null;
        }

        function persist(message = "Salvo automaticamente") {
            config = TQ.core.audioScene.saveConfig(scopeId, config, regionId);
            controller?.update?.(config);
            status.textContent = message;
            renderTracks();
        }

        function trackCard(track) {
            const roles = Object.entries(TQ.core.audioScene.ROLE_LABELS)
                .map(([value, label]) =>
                    '<option value="' + escapeHtml(value) + '"' +
                    (value === track.role ? " selected" : "") + ">" +
                    escapeHtml(label) + "</option>"
                ).join("");
            return `
                <article class="tq-audio-track" data-audio-track="${escapeHtml(track.id)}">
                    <label class="tq-audio-switch">
                        <input type="checkbox" data-track-field="enabled" ${track.enabled ? "checked" : ""}>
                        <span>${escapeHtml(track.label)}</span>
                    </label>
                    <small title="${escapeHtml(track.src)}">${escapeHtml(track.src)}</small>
                    <label>Tipo
                        <select data-track-field="role">${roles}</select>
                    </label>
                    <label class="tq-audio-switch">
                        <input type="checkbox" data-track-field="autoplay" ${track.autoplay ? "checked" : ""}>
                        <span>Tocar ao abrir a tela</span>
                    </label>
                    <label class="tq-audio-switch">
                        <input type="checkbox" data-track-field="loop" ${track.loop ? "checked" : ""}>
                        <span>Repetir continuamente</span>
                    </label>
                    <label class="tq-audio-volume">Volume <span>${track.volume}%</span>
                        <input type="range" min="0" max="100" step="1" value="${track.volume}" data-track-field="volume">
                    </label>
                    <div class="tq-audio-track-actions">
                        <button type="button" data-track-preview>▶ Testar</button>
                        <button type="button" data-track-remove>Remover</button>
                    </div>
                </article>
            `;
        }

        function renderTracks() {
            enabled.checked = config.enabled !== false;
            if (!config.tracks.length) {
                tracksHost.innerHTML = "<small>Nenhum áudio colocado nesta tela.</small>";
                return;
            }
            tracksHost.innerHTML = config.tracks.map(trackCard).join("");
        }

        function renderCatalog() {
            if (!catalog.length) {
                catalogHost.innerHTML = "<small>Nenhum áudio catalogado para esta composição. Você ainda pode adicionar um arquivo abaixo.</small>";
                return;
            }
            const existing = new Set(config.tracks.map((track) => track.src));
            catalogHost.innerHTML =
                '<div class="tq-audio-catalog-actions"><button type="button" data-audio-add-all>Adicionar todos</button></div>' +
                catalog.map((item) => `
                    <button type="button" class="tq-audio-catalog-item" data-audio-catalog-id="${escapeHtml(item.id)}" ${existing.has(item.src) ? "disabled" : ""}>
                        <strong>${escapeHtml(item.label)}</strong>
                        <small>${existing.has(item.src) ? "Já está na tela" : "Adicionar"}</small>
                    </button>
                `).join("");
        }

        function addTrack(input, message = "Áudio adicionado") {
            const candidate = TQ.core.audioScene.normalizeTrack(input, config.tracks.length);
            if (!candidate.src) return;
            if (config.tracks.some((track) => track.src === candidate.src)) {
                status.textContent = "Este áudio já está na tela";
                return;
            }
            config.tracks = [...config.tracks, candidate]
                .slice(0, TQ.core.audioScene.MAX_TRACKS);
            persist(message);
            renderCatalog();
        }

        function closeOtherPanels() {
            document.querySelectorAll(
                ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, " +
                ".tq-region-builder-panel, .tq-ocean-dev-panel, .tq-depth-dev-panel, .tq-audio-dev-panel"
            ).forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
        }

        function openPanel(nextOpen) {
            panelOpen = Boolean(nextOpen);
            panel.hidden = !panelOpen;
            if (panelOpen) {
                closeOtherPanels();
                renderTracks();
                renderCatalog();
                root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                    detail: { tool: "audio" }
                }));
            }
        }

        function onOtherTool(event) {
            if (event.detail?.tool !== "audio" && panelOpen) {
                panelOpen = false;
                panel.hidden = true;
            }
        }

        host.querySelector(".tq-audio-dev-toggle").addEventListener("click", () => openPanel(!panelOpen));
        root.addEventListener("tq:dev-tool-activate", onOtherTool);

        enabled.addEventListener("change", () => {
            config.enabled = enabled.checked;
            persist(enabled.checked ? "Áudio ligado" : "Áudio desligado");
        });

        host.querySelector("[data-audio-add]").addEventListener("click", () => {
            const src = String(newSrc.value || "").trim();
            if (!src) {
                status.textContent = "Escolha um arquivo de áudio";
                return;
            }
            addTrack({
                label: String(newLabel.value || "").trim(),
                src,
                role: "ambient",
                enabled: true,
                autoplay: false,
                loop: true,
                volume: 50
            });
            newLabel.value = "";
            newSrc.value = "";
        });

        catalogHost.addEventListener("click", (event) => {
            const all = event.target.closest("[data-audio-add-all]");
            if (all) {
                const existing = new Set(config.tracks.map((track) => track.src));
                const additions = catalog
                    .filter((item) => !existing.has(item.src))
                    .map((item, index) => TQ.core.audioScene.normalizeTrack({
                        ...item,
                        enabled: true,
                        autoplay: false
                    }, config.tracks.length + index));
                config.tracks = [...config.tracks, ...additions]
                    .slice(0, TQ.core.audioScene.MAX_TRACKS);
                persist("Sons da composição adicionados");
                renderCatalog();
                return;
            }

            const button = event.target.closest("[data-audio-catalog-id]");
            if (!button) return;
            const item = catalog.find((candidate) => candidate.id === button.dataset.audioCatalogId);
            if (item) addTrack({ ...item, enabled: true, autoplay: false });
        });

        tracksHost.addEventListener("input", (event) => {
            const card = event.target.closest("[data-audio-track]");
            const field = event.target.dataset.trackField;
            if (!card || field !== "volume") return;
            const track = config.tracks.find((item) => item.id === card.dataset.audioTrack);
            if (!track) return;
            track.volume = Number(event.target.value);
            card.querySelector(".tq-audio-volume span").textContent = track.volume + "%";
            controller?.update?.(config);
            status.textContent = "Ajustando volume...";
        });

        tracksHost.addEventListener("change", (event) => {
            const card = event.target.closest("[data-audio-track]");
            const field = event.target.dataset.trackField;
            if (!card || !field) return;
            const track = config.tracks.find((item) => item.id === card.dataset.audioTrack);
            if (!track) return;
            if (field === "enabled" || field === "autoplay" || field === "loop") {
                track[field] = Boolean(event.target.checked);
            } else if (field === "volume") {
                track.volume = Number(event.target.value);
            } else if (field === "role") {
                track.role = event.target.value;
            }
            persist("Áudio atualizado");
        });

        tracksHost.addEventListener("click", async (event) => {
            const card = event.target.closest("[data-audio-track]");
            if (!card) return;
            const track = config.tracks.find((item) => item.id === card.dataset.audioTrack);
            if (!track) return;

            if (event.target.closest("[data-track-remove]")) {
                stopPreview();
                controller?.stopTrack?.(track.id);
                config.tracks = config.tracks.filter((item) => item.id !== track.id);
                persist("Áudio removido");
                renderCatalog();
                return;
            }

            if (event.target.closest("[data-track-preview]")) {
                stopPreview();
                if (!root.Audio) return;
                preview = new root.Audio(track.src);
                preview.volume = Math.min(1, Math.max(0, Number(track.volume) / 100));
                preview.loop = false;
                try {
                    await preview.play();
                    status.textContent = "Testando " + track.label;
                } catch (_) {
                    status.textContent = "Toque novamente para liberar o áudio";
                }
            }
        });

        host.querySelector("[data-audio-stop]").addEventListener("click", () => {
            stopPreview();
            controller?.stopAll?.();
            status.textContent = "Áudio parado";
        });

        host.querySelector("[data-audio-clear]").addEventListener("click", () => {
            stopPreview();
            controller?.stopAll?.();
            config.tracks = [];
            persist("Áudios removidos desta tela");
            renderCatalog();
        });

        renderTracks();

        if (catalog.length) {
            renderCatalog();
        } else {
            loadCatalog(catalogUrl).then((items) => {
                catalog = normalizeCatalogItems(items);
                renderCatalog();
            });
        }

        activeCleanup = () => {
            stopPreview();
            root.removeEventListener("tq:dev-tool-activate", onOtherTool);
            host.remove();
            panelOpen = false;
        };
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.audioEditor = Object.freeze({
        normalizeCatalogItems,
        loadCatalog,
        mount
    });
})(globalThis);
