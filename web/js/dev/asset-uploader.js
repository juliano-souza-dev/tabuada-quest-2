(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_REPOSITORY = "juliano-souza-dev/tabuada-quest-2";
    const DEFAULT_BRANCH = "develop";
    const DEFAULT_ROOT_PATH = "web/assets";

    const originalVisualState = new WeakMap();
    const localPreviewUrls = new Map();

    const COMMON_FOLDERS = Object.freeze([
        { value: "web/assets", label: "Assets · raiz" },
        { value: "web/assets/ui", label: "UI" },
        { value: "web/assets/ui/icons", label: "UI · ícones" },
        { value: "web/assets/ui/niveis", label: "UI · níveis" },
        { value: "web/assets/ui/plaquinhas", label: "UI · plaquinhas" },
        { value: "web/assets/avatars", label: "Avatares" },
        { value: "web/assets/backgrounds", label: "Backgrounds" },
        { value: "web/assets/crew", label: "Tripulação" },
        { value: "web/assets/pets", label: "Pets" },
        { value: "web/assets/collectibles", label: "Colecionáveis" },
        { value: "web/assets/tavern", label: "Taverna" },
        { value: "web/assets/regions", label: "Regiões" },
        { value: "web/assets/global", label: "Globais" },
        { value: "web/assets/transitions", label: "Transições" }
    ]);

    function encodePath(path) {
        return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
    }

    function normalizeRootPath(value) {
        return String(value || DEFAULT_ROOT_PATH)
            .trim()
            .replace(/\\/g, "/")
            .replace(/^\/+|\/+$/g, "")
            .replace(/\/{2,}/g, "/") || DEFAULT_ROOT_PATH;
    }

    function normalizeAssetFolder(value, rootPath) {
        const root = normalizeRootPath(rootPath);
        let path = String(value || "")
            .trim()
            .replace(/\\/g, "/")
            .replace(/^\/+|\/+$/g, "")
            .replace(/\/{2,}/g, "/");

        if (!path) return root;
        if (path.startsWith("assets/")) path = "web/" + path;
        if (!path.startsWith(root)) path = root + "/" + path;

        const segments = path.split("/").filter((segment) => segment && segment !== "." && segment !== "..");
        path = segments.join("/");

        if (path !== root && !path.startsWith(root + "/")) return root;
        return path;
    }

    function assetUrlFromElement(element) {
        if (!(element instanceof Element)) return "";

        if (element instanceof HTMLImageElement) {
            return element.currentSrc || element.getAttribute("src") || "";
        }

        const nestedImage = element.querySelector("img");
        if (nestedImage instanceof HTMLImageElement) {
            return nestedImage.currentSrc || nestedImage.getAttribute("src") || "";
        }

        const backgroundImage = root.getComputedStyle(element).backgroundImage || "";
        const match = /url\((['"]?)(.*?)\1\)/.exec(backgroundImage);
        return match?.[2] || "";
    }

    function repositoryAssetPathFromUrl(rawUrl, rootPath) {
        if (!rawUrl) return "";

        let pathname = "";
        try {
            pathname = new URL(rawUrl, root.location.href).pathname;
        } catch (_) {
            pathname = String(rawUrl);
        }

        try {
            pathname = decodeURIComponent(pathname);
        } catch (_) {}

        const root = normalizeRootPath(rootPath);
        const explicitMarker = "/" + root + "/";
        const explicitIndex = pathname.lastIndexOf(explicitMarker);

        if (explicitIndex >= 0) {
            return root + "/" + pathname.slice(explicitIndex + explicitMarker.length);
        }

        const assetMarker = "/assets/";
        const assetIndex = pathname.lastIndexOf(assetMarker);
        if (assetIndex >= 0) {
            return "web/assets/" + pathname.slice(assetIndex + assetMarker.length);
        }

        return "";
    }

    function folderOf(path) {
        const clean = String(path || "").replace(/\/+$/g, "");
        const index = clean.lastIndexOf("/");
        return index > 0 ? clean.slice(0, index) : clean;
    }

    function selectedAssetElement() {
        return document.querySelector('[data-tq-dev-selected="true"]');
    }

    function selectedAssetFolder(rootPath) {
        const selected = selectedAssetElement();
        const rawUrl = assetUrlFromElement(selected);
        const repositoryPath = repositoryAssetPathFromUrl(rawUrl, rootPath);
        return repositoryPath ? folderOf(repositoryPath) : "";
    }

    function assetPreviewKey(element) {
        if (!(element instanceof Element)) return "";
        return element.dataset.tqAssetId
            || element.dataset.tqDevId
            || element.getAttribute("id")
            || "";
    }

    function visualTargets(element) {
        if (!(element instanceof Element)) return [];

        if (element instanceof HTMLImageElement) return [{ element, kind: "image" }];

        const image = element.querySelector("img");
        if (image instanceof HTMLImageElement) return [{ element: image, kind: "image" }];

        const style = root.getComputedStyle(element);
        if (style.backgroundImage && style.backgroundImage !== "none") {
            return [{ element, kind: "background" }];
        }

        return [];
    }

    function rememberOriginal(target) {
        if (originalVisualState.has(target.element)) return;

        if (target.kind === "image") {
            originalVisualState.set(target.element, {
                kind: "image",
                src: target.element.getAttribute("src") || ""
            });
            return;
        }

        originalVisualState.set(target.element, {
            kind: "background",
            backgroundImage: target.element.style.backgroundImage || ""
        });
    }

    function applyPreviewUrl(element, url) {
        const targets = visualTargets(element);
        if (!targets.length) return false;

        targets.forEach((target) => {
            rememberOriginal(target);
            if (target.kind === "image") {
                target.element.src = url;
            } else {
                target.element.style.backgroundImage = 'url("' + url.replace(/"/g, "%22") + '")';
            }
            target.element.dataset.tqLocalPreview = "true";
        });

        return true;
    }

    function applyLocalFilePreview(file) {
        const selected = selectedAssetElement();
        if (!(selected instanceof Element)) {
            return { ok: false, message: "Selecione primeiro um asset no UX." };
        }

        const key = assetPreviewKey(selected);
        if (!key) {
            return { ok: false, message: "Esse item não possui um ID de asset utilizável." };
        }

        const previousUrl = localPreviewUrls.get(key);
        if (previousUrl) URL.revokeObjectURL(previousUrl);

        const url = URL.createObjectURL(file);
        const applied = applyPreviewUrl(selected, url);
        if (!applied) {
            URL.revokeObjectURL(url);
            return { ok: false, message: "O item selecionado não possui imagem/background para prévia." };
        }

        localPreviewUrls.set(key, url);
        return { ok: true, key, url };
    }

    function restoreSelectedPreview() {
        const selected = selectedAssetElement();
        if (!(selected instanceof Element)) {
            return { ok: false, message: "Selecione primeiro um asset no UX." };
        }

        const targets = visualTargets(selected);
        if (!targets.length) {
            return { ok: false, message: "O item selecionado não possui imagem/background para restaurar." };
        }

        let restored = false;
        targets.forEach((target) => {
            const original = originalVisualState.get(target.element);
            if (!original) return;

            if (original.kind === "image") {
                target.element.setAttribute("src", original.src);
            } else {
                target.element.style.backgroundImage = original.backgroundImage;
            }
            delete target.element.dataset.tqLocalPreview;
            originalVisualState.delete(target.element);
            restored = true;
        });

        const key = assetPreviewKey(selected);
        const url = localPreviewUrls.get(key);
        if (url) {
            URL.revokeObjectURL(url);
            localPreviewUrls.delete(key);
        }

        return restored
            ? { ok: true }
            : { ok: false, message: "Esse item ainda não tem uma prévia local aplicada." };
    }

    function buildUploadUrl(repository, branch, folder) {
        return "https://github.com/"
            + repository
            + "/upload/"
            + encodeURIComponent(branch)
            + "/"
            + encodePath(folder);
    }

    function buildFolderUrl(repository, branch, folder) {
        return "https://github.com/"
            + repository
            + "/tree/"
            + encodeURIComponent(branch)
            + "/"
            + encodePath(folder);
    }

    function mount(options = {}) {
        document.querySelector(".tq-asset-upload-dev")?.remove();

        const repository = String(options.repository || DEFAULT_REPOSITORY);
        const branch = String(options.branch || DEFAULT_BRANCH);
        const rootPath = normalizeRootPath(options.rootPath || DEFAULT_ROOT_PATH);

        const host = document.createElement("aside");
        host.className = "tq-asset-upload-dev";
        host.innerHTML = `
            <button
                type="button"
                class="tq-asset-upload-dev-toggle"
                aria-label="Abrir upload de assets">
                UP
            </button>
            <section class="tq-asset-upload-dev-panel" hidden>
                <header>
                    <strong>UP · Assets</strong>
                    <span data-upload-status>DEV · ${branch}</span>
                </header>

                <label>
                    Pasta
                    <select data-upload-folder>
                        ${COMMON_FOLDERS.map((folder) => `<option value="${folder.value}">${folder.label}</option>`).join("")}
                        <option value="__custom__">Outra pasta...</option>
                    </select>
                </label>

                <label data-upload-custom-row hidden>
                    Caminho dentro de assets
                    <input
                        data-upload-custom
                        type="text"
                        spellcheck="false"
                        autocomplete="off"
                        placeholder="ui/novos-assets">
                </label>

                <div class="tq-asset-upload-dev-selected">
                    <small>Item selecionado no UX</small>
                    <strong data-upload-selected>Nenhum asset selecionado</strong>
                </div>

                <button type="button" data-upload-use-selected>
                    Usar pasta do item selecionado
                </button>

                <fieldset class="tq-asset-upload-dev-local" data-upload-local-drop>
                    <legend>Prévia local · tempo real</legend>
                    <input
                        data-upload-local-file
                        type="file"
                        accept=".webp,.png,.jpg,.jpeg,.gif,.svg,image/webp,image/png,image/jpeg,image/gif,image/svg+xml"
                        hidden>
                    <strong data-upload-local-name>Nenhum arquivo local</strong>
                    <small>Escolha uma imagem do computador e ela entra imediatamente no item selecionado no UX. Não faz upload.</small>
                    <div class="tq-asset-upload-dev-actions">
                        <button type="button" class="is-primary" data-upload-local-open>🖼 Escolher arquivo</button>
                        <button type="button" data-upload-local-restore>↩ Restaurar</button>
                    </div>
                    <small class="tq-asset-upload-dev-drop-hint">Você também pode arrastar a imagem para esta área.</small>
                </fieldset>

                <div class="tq-asset-upload-dev-actions">
                    <button type="button" class="is-primary" data-upload-open>
                        ⬆ Subir arquivo
                    </button>
                    <button type="button" data-upload-browse>
                        Abrir pasta
                    </button>
                </div>

                <small class="tq-asset-upload-dev-note">
                    O upload abre o GitHub já na pasta escolhida e sempre na branch <b>${branch}</b>.
                </small>
            </section>
        `;

        document.body.appendChild(host);

        const panel = host.querySelector(".tq-asset-upload-dev-panel");
        const status = host.querySelector("[data-upload-status]");
        const folderSelect = host.querySelector("[data-upload-folder]");
        const customRow = host.querySelector("[data-upload-custom-row]");
        const customInput = host.querySelector("[data-upload-custom]");
        const selectedLabel = host.querySelector("[data-upload-selected]");
        const localFileInput = host.querySelector("[data-upload-local-file]");
        const localFileName = host.querySelector("[data-upload-local-name]");
        const localDrop = host.querySelector("[data-upload-local-drop]");

        function currentFolder() {
            if (folderSelect.value === "__custom__") {
                return normalizeAssetFolder(customInput.value, rootPath);
            }
            return normalizeAssetFolder(folderSelect.value, rootPath);
        }

        function syncCustomVisibility() {
            customRow.hidden = folderSelect.value !== "__custom__";
        }

        function syncSelectedLabel() {
            const folder = selectedAssetFolder(rootPath);
            selectedLabel.textContent = folder || "Nenhum asset selecionado";
            return folder;
        }

        function openExternal(url) {
            const opened = root.open(url, "_blank");
            if (opened) opened.opener = null;
        }

        host.querySelector(".tq-asset-upload-dev-toggle").addEventListener("click", () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) {
                syncSelectedLabel();
                status.textContent = "DEV · " + branch;
            }
        });

        folderSelect.addEventListener("change", syncCustomVisibility);

        host.querySelector("[data-upload-use-selected]").addEventListener("click", () => {
            const folder = syncSelectedLabel();
            if (!folder) {
                status.textContent = "Selecione um asset no UX";
                return;
            }

            const known = [...folderSelect.options].find((option) => option.value === folder);
            if (known) {
                folderSelect.value = folder;
            } else {
                folderSelect.value = "__custom__";
                customInput.value = folder.startsWith(rootPath + "/")
                    ? folder.slice(rootPath.length + 1)
                    : folder;
            }

            syncCustomVisibility();
            status.textContent = "Pasta detectada";
        });

        host.querySelector("[data-upload-open]").addEventListener("click", () => {
            const folder = currentFolder();
            status.textContent = folder;
            openExternal(buildUploadUrl(repository, branch, folder));
        });

        host.querySelector("[data-upload-browse]").addEventListener("click", () => {
            const folder = currentFolder();
            status.textContent = folder;
            openExternal(buildFolderUrl(repository, branch, folder));
        });

        function handleLocalFile(file) {
            if (!(file instanceof File)) return;

            if (!file.type.startsWith("image/") && !/\.(webp|png|jpe?g|gif|svg)$/i.test(file.name)) {
                status.textContent = "Formato de imagem não suportado";
                return;
            }

            const result = applyLocalFilePreview(file);
            if (!result.ok) {
                status.textContent = result.message;
                return;
            }

            localFileName.textContent = file.name;
            status.textContent = "Prévia aplicada em tempo real";
        }

        host.querySelector("[data-upload-local-open]").addEventListener("click", () => {
            localFileInput.value = "";
            localFileInput.click();
        });

        localFileInput.addEventListener("change", () => {
            handleLocalFile(localFileInput.files?.[0]);
        });

        host.querySelector("[data-upload-local-restore]").addEventListener("click", () => {
            const result = restoreSelectedPreview();
            status.textContent = result.ok ? "Asset original restaurado" : result.message;
            if (result.ok) localFileName.textContent = "Nenhum arquivo local";
        });

        ["dragenter", "dragover"].forEach((eventName) => {
            localDrop.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                localDrop.classList.add("is-dragging");
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            localDrop.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                localDrop.classList.remove("is-dragging");
            });
        });

        localDrop.addEventListener("drop", (event) => {
            handleLocalFile(event.dataTransfer?.files?.[0]);
        });

        syncCustomVisibility();
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.assetUploader = Object.freeze({
        mount,
        normalizeAssetFolder,
        repositoryAssetPathFromUrl,
        buildUploadUrl,
        applyLocalFilePreview,
        restoreSelectedPreview
    });
})(globalThis);
