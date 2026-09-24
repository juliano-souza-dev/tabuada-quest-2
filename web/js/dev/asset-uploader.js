(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_REPOSITORY = "juliano-souza-dev/tabuada-quest-2";
    const DEFAULT_BRANCH = "develop";
    const DEFAULT_ROOT_PATH = "web/assets";

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
        const rootPathNormalized = normalizeRootPath(rootPath);
        let path = String(value || "")
            .trim()
            .replace(/\\/g, "/")
            .replace(/^\/+|\/+$/g, "")
            .replace(/\/{2,}/g, "/");

        if (!path) return rootPathNormalized;
        if (path.startsWith("assets/")) path = "web/" + path;
        if (!path.startsWith(rootPathNormalized)) path = rootPathNormalized + "/" + path;

        const segments = path
            .split("/")
            .filter((segment) => segment && segment !== "." && segment !== "..");
        path = segments.join("/");

        if (
            path !== rootPathNormalized
            && !path.startsWith(rootPathNormalized + "/")
        ) {
            return rootPathNormalized;
        }

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

        const rootPathNormalized = normalizeRootPath(rootPath);
        const explicitMarker = "/" + rootPathNormalized + "/";
        const explicitIndex = pathname.lastIndexOf(explicitMarker);

        if (explicitIndex >= 0) {
            return rootPathNormalized + "/" + pathname.slice(explicitIndex + explicitMarker.length);
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

    function selectedAssetLabel() {
        const selected = selectedAssetElement();
        if (!(selected instanceof Element)) return "Nenhum asset selecionado";

        return selected.dataset.tqDevLabel
            || selected.dataset.tqAssetLabel
            || selected.getAttribute("alt")
            || selected.dataset.tqDevId
            || selected.dataset.tqAssetId
            || selected.className
            || selected.tagName.toLowerCase();
    }

    function resolveVisualTarget(element) {
        if (!(element instanceof Element)) return null;

        if (element instanceof HTMLImageElement) {
            return { visual: element, mode: "image" };
        }

        const nestedImage = element.querySelector("img");
        if (nestedImage instanceof HTMLImageElement) {
            return { visual: nestedImage, mode: "image" };
        }

        return { visual: element, mode: "background" };
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

    function slug(value) {
        return String(value || "asset")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 42) || "asset";
    }

    function mount(options = {}) {
        document.querySelector(".tq-asset-upload-dev")?.remove();

        const repository = String(options.repository || DEFAULT_REPOSITORY);
        const branch = String(options.branch || DEFAULT_BRANCH);
        const rootPath = normalizeRootPath(options.rootPath || DEFAULT_ROOT_PATH);
        const appRoot = options.appRoot instanceof Element ? options.appRoot : document.querySelector("#app");
        const screenRoot = options.screenRoot instanceof Element
            ? options.screenRoot
            : appRoot?.firstElementChild || appRoot;
        const screenId = String(options.screenId || "screen");

        let replacementPreview = null;
        const localLayers = [];

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
                    <small>Selecionado no UX</small>
                    <strong data-upload-selected>Nenhum asset selecionado</strong>
                    <small data-upload-selected-path></small>
                </div>

                <button type="button" data-upload-use-selected>
                    Usar pasta do item selecionado
                </button>

                <fieldset class="tq-asset-upload-dev-local" data-live-dropzone>
                    <legend>Arquivo local · tempo real</legend>

                    <strong data-live-file-name>Nenhum arquivo local</strong>

                    <small>
                        <b>Adicionar por cima</b> cria uma nova camada visível sobre a arte.
                        Ela abre automaticamente no UX para mover e redimensionar.
                    </small>

                    <div class="tq-asset-upload-dev-actions">
                        <button type="button" class="is-primary" data-live-add>
                            ➕ Adicionar por cima
                        </button>
                        <button type="button" data-live-replace>
                            ⇄ Trocar selecionado
                        </button>
                    </div>

                    <div class="tq-asset-upload-dev-actions">
                        <button type="button" data-live-remove disabled>
                            🗑 Remover camada
                        </button>
                        <button type="button" data-live-revert disabled>
                            ↩ Desfazer troca
                        </button>
                    </div>

                    <input
                        data-live-file
                        type="file"
                        accept="image/*,.webp,.png,.jpg,.jpeg,.gif,.svg"
                        hidden>

                    <small class="tq-asset-upload-dev-drop-hint">
                        Arrastar uma imagem para este bloco também adiciona uma camada por cima.
                    </small>
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
                    A prévia local não envia nada ao GitHub. Quando aprovar a arte,
                    use <b>Subir arquivo</b> para gravá-la na branch <b>${branch}</b>.
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
        const selectedPath = host.querySelector("[data-upload-selected-path]");
        const fileInput = host.querySelector("[data-live-file]");
        const fileName = host.querySelector("[data-live-file-name]");
        const dropzone = host.querySelector("[data-live-dropzone]");
        const removeButton = host.querySelector("[data-live-remove]");
        const revertButton = host.querySelector("[data-live-revert]");

        function currentFolder() {
            if (folderSelect.value === "__custom__") {
                return normalizeAssetFolder(customInput.value, rootPath);
            }
            return normalizeAssetFolder(folderSelect.value, rootPath);
        }

        function syncCustomVisibility() {
            customRow.hidden = folderSelect.value !== "__custom__";
        }

        function syncSelected() {
            const folder = selectedAssetFolder(rootPath);
            selectedLabel.textContent = selectedAssetLabel();
            selectedPath.textContent = folder || "Sem pasta detectável";
            return folder;
        }

        function selectFolder(folder) {
            if (!folder) return;

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
        }

        function openExternal(url) {
            const opened = root.open(url, "_blank");
            if (opened) opened.opener = null;
        }

        function pickFile(mode) {
            fileInput.value = "";
            fileInput.dataset.liveMode = mode;
            fileInput.click();
        }

        function stageForLocalLayer() {
            const selected = selectedAssetElement();
            return selected?.closest(".tq-canonical-stage")
                || screenRoot?.querySelector(".tq-canonical-stage")
                || selected?.closest(".tq-safe-visual-area")
                || screenRoot?.querySelector(".tq-safe-visual-area")
                || screenRoot;
        }

        function reopenUxOn(element) {
            if (
                !(element instanceof Element)
                || !(appRoot instanceof Element)
                || !(screenRoot instanceof Element)
            ) return;

            TQ.dev?.sceneEditor?.mount(appRoot, {
                screenId,
                screenRoot,
                initialSelectedId: element.dataset.tqDevId,
                initialOpen: true
            });
        }

        function addLocalLayer(file) {
            const stage = stageForLocalLayer();
            if (!(stage instanceof Element)) {
                status.textContent = "Não encontrei a área visual da tela";
                return;
            }

            if (root.getComputedStyle(stage).position === "static") {
                stage.style.position = "relative";
            }

            const objectUrl = URL.createObjectURL(file);
            const id = screenId + ".local." + slug(file.name) + "." + Date.now();

            const image = document.createElement("img");
            image.className = "tq-dev-local-live-asset";
            image.dataset.tqDevId = id;
            image.dataset.tqDevKind = "asset";
            image.dataset.tqDevRole = "object";
            image.dataset.tqDevLabel = "Local · " + file.name;
            image.dataset.tqAssetId = id;
            image.dataset.tqAssetRole = "object";
            image.dataset.tqAssetLabel = "Local · " + file.name;
            image.dataset.tqLocalFile = file.name;
            image.src = objectUrl;
            image.alt = "";
            image.draggable = false;

            image.style.position = "absolute";
            image.style.left = "30%";
            image.style.top = "28%";
            image.style.width = "40%";
            image.style.height = "auto";
            image.style.maxWidth = "none";
            image.style.maxHeight = "60%";
            image.style.objectFit = "contain";
            image.style.objectPosition = "center";
            image.style.zIndex = "500";
            image.style.pointerEvents = "auto";
            image.style.userSelect = "none";

            stage.appendChild(image);

            const entry = { image, objectUrl, file };
            localLayers.push(entry);

            fileName.textContent = file.name;
            removeButton.disabled = false;
            status.textContent = "CAMADA VISÍVEL · " + file.name;

            image.addEventListener("error", () => {
                status.textContent = "Falha ao exibir " + file.name;
            }, { once: true });

            root.requestAnimationFrame(() => reopenUxOn(image));
        }

        function replaceSelected(file) {
            const selected = selectedAssetElement();
            if (!(selected instanceof Element)) {
                status.textContent = "Selecione primeiro um asset no UX";
                return;
            }

            const target = resolveVisualTarget(selected);
            if (!target) {
                status.textContent = "Esse item não aceita imagem";
                return;
            }

            if (replacementPreview?.objectUrl) {
                URL.revokeObjectURL(replacementPreview.objectUrl);
            }

            const objectUrl = URL.createObjectURL(file);
            const original = target.mode === "image"
                ? {
                    src: target.visual.getAttribute("src") || "",
                    visibility: target.visual.style.visibility || "",
                    opacity: target.visual.style.opacity || ""
                }
                : {
                    backgroundImage: target.visual.style.backgroundImage || "",
                    backgroundSize: target.visual.style.backgroundSize || "",
                    backgroundPosition: target.visual.style.backgroundPosition || "",
                    backgroundRepeat: target.visual.style.backgroundRepeat || "",
                    visibility: target.visual.style.visibility || "",
                    opacity: target.visual.style.opacity || ""
                };

            if (target.mode === "image") {
                target.visual.src = objectUrl;
            } else {
                target.visual.style.backgroundImage = 'url("' + objectUrl + '")';
                target.visual.style.backgroundSize = "contain";
                target.visual.style.backgroundPosition = "center";
                target.visual.style.backgroundRepeat = "no-repeat";
            }

            target.visual.style.visibility = "visible";
            target.visual.style.opacity = "1";
            target.visual.dataset.tqLocalPreview = "true";

            replacementPreview = {
                selected,
                target,
                objectUrl,
                original,
                file
            };

            fileName.textContent = file.name;
            revertButton.disabled = false;
            status.textContent = "TROCA AO VIVO · " + file.name;
        }

        function revertReplacement() {
            if (!replacementPreview) return;

            const { target, original, objectUrl } = replacementPreview;
            if (target.mode === "image") {
                target.visual.setAttribute("src", original.src);
            } else {
                target.visual.style.backgroundImage = original.backgroundImage;
                target.visual.style.backgroundSize = original.backgroundSize;
                target.visual.style.backgroundPosition = original.backgroundPosition;
                target.visual.style.backgroundRepeat = original.backgroundRepeat;
            }

            target.visual.style.visibility = original.visibility;
            target.visual.style.opacity = original.opacity;
            delete target.visual.dataset.tqLocalPreview;

            URL.revokeObjectURL(objectUrl);
            replacementPreview = null;
            revertButton.disabled = true;
            status.textContent = "Troca desfeita";
        }

        function removeLastLayer() {
            const entry = localLayers.pop();
            if (!entry) return;

            entry.image.remove();
            URL.revokeObjectURL(entry.objectUrl);
            removeButton.disabled = localLayers.length === 0;
            fileName.textContent = localLayers.at(-1)?.file?.name || "Nenhum arquivo local";
            status.textContent = "Camada local removida";
        }

        function validImage(file) {
            return file instanceof File
                && (
                    file.type.startsWith("image/")
                    || /\.(webp|png|jpe?g|gif|svg)$/i.test(file.name)
                );
        }

        function handleFile(file, mode) {
            if (!validImage(file)) {
                status.textContent = "Escolha uma imagem válida";
                return;
            }

            if (mode === "replace") replaceSelected(file);
            else addLocalLayer(file);
        }

        host.querySelector(".tq-asset-upload-dev-toggle").addEventListener("click", () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) {
                syncSelected();
                status.textContent = "DEV · " + branch;
            }
        });

        folderSelect.addEventListener("change", syncCustomVisibility);

        host.querySelector("[data-upload-use-selected]").addEventListener("click", () => {
            const folder = syncSelected();
            if (!folder) {
                status.textContent = "Não encontrei a pasta desse item";
                return;
            }

            selectFolder(folder);
            status.textContent = "Pasta detectada";
        });

        host.querySelector("[data-live-add]").addEventListener("click", () => pickFile("add"));
        host.querySelector("[data-live-replace]").addEventListener("click", () => pickFile("replace"));
        removeButton.addEventListener("click", removeLastLayer);
        revertButton.addEventListener("click", revertReplacement);

        fileInput.addEventListener("change", () => {
            handleFile(fileInput.files?.[0], fileInput.dataset.liveMode || "add");
        });

        ["dragenter", "dragover"].forEach((type) => {
            dropzone.addEventListener(type, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.add("is-dragging");
            });
        });

        ["dragleave", "drop"].forEach((type) => {
            dropzone.addEventListener(type, (event) => {
                event.preventDefault();
                event.stopPropagation();
                dropzone.classList.remove("is-dragging");
            });
        });

        dropzone.addEventListener("drop", (event) => {
            handleFile(event.dataTransfer?.files?.[0], "add");
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

        syncCustomVisibility();
        syncSelected();
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.assetUploader = Object.freeze({
        mount,
        normalizeAssetFolder,
        repositoryAssetPathFromUrl,
        buildUploadUrl
    });
})(globalThis);
