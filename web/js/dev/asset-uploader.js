(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_REPOSITORY = "juliano-souza-dev/tabuada-quest-2";
    const DEFAULT_BRANCH = "develop";
    const DEFAULT_ROOT_PATH = "web/assets";
    const LOCAL_DB_NAME = "tq2-dev-local-assets";
    const LOCAL_DB_VERSION = 1;
    const LOCAL_LAYER_STORE = "layers";
    const runtimeObjectUrls = new Map();

    const COMMON_FOLDERS = Object.freeze([
        { value: "web/assets", label: "Assets · raiz" },
        { value: "web/assets/ui", label: "UI" },
        { value: "web/assets/ui/icons", label: "UI · ícones" },
        { value: "web/assets/ui/niveis", label: "UI · níveis" },
        { value: "web/assets/ui/plaquinhas", label: "UI · plaquinhas" },
        { value: "web/assets/avatars", label: "Avatares" },
        { value: "web/assets/backgrounds", label: "Backgrounds" },
        { value: "web/assets/backgrounds/home", label: "Backgrounds · Home" },
        { value: "web/assets/parallax", label: "Parallax" },
        { value: "web/assets/parallax/islands", label: "Parallax · Ilhas" },
        { value: "web/assets/parallax/islands/region-1", label: "Parallax · Ilhas · Região 1" },
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

    function openLocalAssetDb() {
        if (!root.indexedDB) {
            return Promise.reject(new Error("IndexedDB não disponível"));
        }

        return new Promise((resolve, reject) => {
            const request = root.indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                const store = db.objectStoreNames.contains(LOCAL_LAYER_STORE)
                    ? request.transaction.objectStore(LOCAL_LAYER_STORE)
                    : db.createObjectStore(LOCAL_LAYER_STORE, { keyPath: "id" });

                if (!store.indexNames.contains("screenId")) {
                    store.createIndex("screenId", "screenId", { unique: false });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("Falha ao abrir IndexedDB"));
        });
    }

    function transactionDone(transaction) {
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error("Falha no IndexedDB"));
            transaction.onabort = () => reject(transaction.error || new Error("Operação cancelada no IndexedDB"));
        });
    }

    async function saveLocalLayerRecord(record) {
        const db = await openLocalAssetDb();
        try {
            const transaction = db.transaction(LOCAL_LAYER_STORE, "readwrite");
            transaction.objectStore(LOCAL_LAYER_STORE).put(record);
            await transactionDone(transaction);
        } finally {
            db.close();
        }
    }

    async function deleteLocalLayerRecord(id) {
        if (!id) return;
        const db = await openLocalAssetDb();
        try {
            const transaction = db.transaction(LOCAL_LAYER_STORE, "readwrite");
            transaction.objectStore(LOCAL_LAYER_STORE).delete(String(id));
            await transactionDone(transaction);
        } finally {
            db.close();
        }
    }

    async function readLocalLayerRecords(screenId) {
        const db = await openLocalAssetDb();
        try {
            const transaction = db.transaction(LOCAL_LAYER_STORE, "readonly");
            const store = transaction.objectStore(LOCAL_LAYER_STORE);
            const index = store.index("screenId");
            const request = index.getAll(String(screenId || "screen"));

            const records = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
                request.onerror = () => reject(request.error || new Error("Falha ao ler assets locais"));
            });

            await transactionDone(transaction);
            return records;
        } finally {
            db.close();
        }
    }

    async function clearLocalLayersForScreen(screenId, screenRoot = null) {
        const id = String(screenId || "screen");

        try {
            const records = await readLocalLayerRecords(id);

            if (records.length) {
                const db = await openLocalAssetDb();
                try {
                    const transaction = db.transaction(LOCAL_LAYER_STORE, "readwrite");
                    const store = transaction.objectStore(LOCAL_LAYER_STORE);
                    records.forEach((record) => store.delete(String(record.id)));
                    await transactionDone(transaction);
                } finally {
                    db.close();
                }
            }

            records.forEach((record) => releaseRuntimeUrl(record.id));

            if (screenRoot instanceof Element) {
                screenRoot
                    .querySelectorAll(".tq-dev-local-live-asset[data-tq-local-persisted='true']")
                    .forEach((element) => {
                        releaseRuntimeUrl(element.dataset.tqDevId);
                        element.remove();
                    });

                screenRoot
                    .querySelectorAll("[data-tq-local-preview='true'], [data-tq-live-preview]")
                    .forEach((element) => {
                        delete element.dataset.tqLocalPreview;
                        element.removeAttribute("data-tq-live-preview");
                    });
            }

            return records.length;
        } catch (error) {
            console.warn("Falha ao limpar assets locais da tela:", error);
            throw error;
        }
    }

    function releaseRuntimeUrl(id) {
        const current = runtimeObjectUrls.get(String(id));
        if (!current) return;
        URL.revokeObjectURL(current);
        runtimeObjectUrls.delete(String(id));
    }

    function localLayerStage(screenRoot) {
        if (!(screenRoot instanceof Element)) return null;
        return screenRoot.querySelector(".tq-canonical-stage")
            || screenRoot.querySelector(".tq-safe-visual-area")
            || screenRoot;
    }

    function createLocalLayerElement(record) {
        releaseRuntimeUrl(record.id);
        const objectUrl = URL.createObjectURL(record.blob);
        runtimeObjectUrls.set(String(record.id), objectUrl);

        const image = document.createElement("img");
        image.className = "tq-dev-local-live-asset";
        image.dataset.tqDevId = record.id;
        image.dataset.tqDevKind = "asset";
        image.dataset.tqDevRole = "object";
        image.dataset.tqDevLabel = record.slotLabel || ("Local · " + record.fileName);
        image.dataset.tqAssetId = record.id;
        image.dataset.tqAssetRole = "object";
        image.dataset.tqAssetLabel = record.slotLabel || ("Local · " + record.fileName);
        image.dataset.tqLocalFile = record.fileName;
        image.dataset.tqLocalPersisted = "true";
        image.dataset.tqLocalScreen = record.screenId;
        if (record.slotId) image.dataset.tqCompositionSlot = record.slotId;
        if (record.semanticType) image.dataset.tqSemanticType = record.semanticType;
        if (record.pairId) image.dataset.tqPairId = record.pairId;
        if (record.pairState) image.dataset.tqPairState = record.pairState;
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
        image.style.pointerEvents = record.slotId ? "none" : "auto";
        image.style.userSelect = "none";

        return { image, objectUrl };
    }

    function fileNameFromAssetUrl(rawUrl) {
        if (!rawUrl) return "";
        try {
            const url = new URL(rawUrl, root.location.href);
            const clean = decodeURIComponent(url.pathname.split("/").pop() || "");
            return clean.trim().toLowerCase();
        } catch (_) {
            return String(rawUrl).split(/[?#]/)[0].split("/").pop()?.trim().toLowerCase() || "";
        }
    }

    function promoteSavedSceneLayout(screenId, sourceId, targetElement) {
        const targetId = targetElement?.dataset?.tqDevId;
        if (!sourceId || !targetId) return false;

        try {
            const storageKey = "tq2.dev.scene-layout.v2";
            const store = JSON.parse(root.localStorage.getItem(storageKey) || "{}");
            const screen = store?.screens?.[screenId];
            const sourceLayout = screen?.[sourceId];

            if (!screen || !sourceLayout || typeof sourceLayout !== "object") {
                return false;
            }

            const targetLayout = screen[targetId] && typeof screen[targetId] === "object"
                ? screen[targetId]
                : {};

            screen[targetId] = {
                ...targetLayout,
                ...sourceLayout,
                deleted: false
            };
            delete screen[sourceId];
            root.localStorage.setItem(storageKey, JSON.stringify(store));
            return true;
        } catch (error) {
            console.warn("Falha ao promover layout local para asset oficial:", error);
            return false;
        }
    }

    async function restoreLocalLayers(options = {}) {
        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const screenId = String(options.screenId || "screen");
        const compositionScreenId = String(options.compositionScreenId || screenId);
        const composition = TQ.content?.screenComposition?.getScreen?.(compositionScreenId) || null;
        if (!screenRoot) return 0;

        try {
            const records = await readLocalLayerRecords(screenId);
            const stage = localLayerStage(screenRoot);
            if (!(stage instanceof Element)) return 0;

            if (root.getComputedStyle(stage).position === "static") {
                stage.style.position = "relative";
            }

            /*
             * A local layer is a DEV draft. Once an asset with the same filename
             * is part of the web-rendered screen, the draft must not be restored,
             * otherwise the promoted asset appears twice after refresh.
             */
            const webBackedByFileName = new Map();
            [...screenRoot.querySelectorAll("img:not(.tq-dev-local-live-asset)")].forEach((image) => {
                const fileName = fileNameFromAssetUrl(image.currentSrc || image.getAttribute("src") || "");
                if (fileName && !webBackedByFileName.has(fileName)) {
                    webBackedByFileName.set(fileName, image);
                }
            });

            let restored = 0;
            const ordered = records
                .slice()
                .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

            for (const record of ordered) {
                const localFileName = String(record.fileName || "").trim().toLowerCase();

                // Composition v1 starts from semantic slots. Old free-floating DEV
                // layers are intentionally discarded during the refactor reset.
                if (composition && !record.slotId) {
                    await deleteLocalLayerRecord(record.id);
                    releaseRuntimeUrl(record.id);
                    continue;
                }

                // One-time promotion cleanup for the Home background that was first
                // positioned as local 48378.png and is now an official WebP asset.
                if (screenId === "home" && (record.id === "home.local.48378-png.1790304073944" || localFileName === "48378.png")) {
                    try {
                        const storageKey = "tq2.dev.scene-layout.v2";
                        const sceneStore = JSON.parse(root.localStorage.getItem(storageKey) || "{}");
                        if (sceneStore?.screens?.[screenId]?.[record.id]) {
                            delete sceneStore.screens[screenId][record.id];
                            root.localStorage.setItem(storageKey, JSON.stringify(sceneStore));
                        }
                    } catch (_) {}
                    await deleteLocalLayerRecord(record.id);
                    releaseRuntimeUrl(record.id);
                    continue;
                }

                if (localFileName && webBackedByFileName.has(localFileName)) {
                    const promotedTarget = webBackedByFileName.get(localFileName);
                    promoteSavedSceneLayout(screenId, record.id, promotedTarget);
                    await deleteLocalLayerRecord(record.id);
                    releaseRuntimeUrl(record.id);
                    continue;
                }

                const duplicate = [...screenRoot.querySelectorAll("[data-tq-dev-id]")]
                    .some((element) => element.dataset.tqDevId === record.id);
                if (duplicate || !(record.blob instanceof Blob)) continue;

                const { image } = createLocalLayerElement(record);
                stage.appendChild(image);
                restored += 1;
            }

            return restored;
        } catch (error) {
            console.warn("Falha ao restaurar assets locais:", error);
            return 0;
        }
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
        const compositionScreenId = String(options.compositionScreenId || screenId);
        const compositionRegistry = TQ.content?.screenComposition || null;
        const composition = compositionRegistry?.getScreen?.(compositionScreenId) || null;
        const compositionSlots = compositionRegistry?.getAssetSlots?.(compositionScreenId) || [];

        let replacementPreview = null;
        const localLayers = [...screenRoot.querySelectorAll(".tq-dev-local-live-asset[data-tq-local-persisted='true']")]
            .map((image) => ({
                id: image.dataset.tqDevId,
                image,
                objectUrl: runtimeObjectUrls.get(image.dataset.tqDevId) || image.src,
                fileName: image.dataset.tqLocalFile || "asset local"
            }));

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

                ${composition ? `
                    <label>
                        Destino na tela
                        <select data-upload-slot>
                            ${compositionSlots.map((slot) =>
                                '<option value="' + slot.id + '">' +
                                (slot.required ? '● ' : '○ ') + slot.label +
                                '</option>'
                            ).join("")}
                        </select>
                    </label>

                    <label>
                        Tipo
                        <select data-upload-semantic></select>
                    </label>

                    <small data-upload-slot-info>
                        ● obrigatório · ○ opcional
                    </small>
                ` : ""}

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
                        <b>Adicionar por cima</b> cria uma nova camada visível sobre a arte,
                        salva neste dispositivo e restaura após F5. Ela abre automaticamente no UX.
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
                    Assets adicionados ficam salvos localmente neste navegador, sem GitHub.
                    Quando aprovar a arte, use <b>Subir arquivo</b> para gravá-la na branch <b>${branch}</b>.
                </small>
            </section>
        `;

        document.body.appendChild(host);

        const panel = host.querySelector(".tq-asset-upload-dev-panel");
        const status = host.querySelector("[data-upload-status]");
        const slotSelect = host.querySelector("[data-upload-slot]");
        const semanticSelect = host.querySelector("[data-upload-semantic]");
        const slotInfo = host.querySelector("[data-upload-slot-info]");
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

        function selectedCompositionSlot() {
            if (!composition || !slotSelect) return null;
            return compositionRegistry.getSlot(compositionScreenId, slotSelect.value);
        }

        function syncCompositionSlot() {
            if (!composition || !slotSelect || !semanticSelect) return;
            const slot = selectedCompositionSlot();
            semanticSelect.replaceChildren(...((slot?.acceptedTypes || []).map((type) => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent = compositionRegistry.SEMANTIC_TYPES[type]?.label || type;
                return option;
            })));
            const current = slot
                ? compositionRegistry.readBinding(screenId, compositionScreenId, slot.id)
                : null;
            if (current?.semanticType && [...semanticSelect.options].some((option) => option.value === current.semanticType)) {
                semanticSelect.value = current.semanticType;
            }
            if (slotInfo) {
                const fx = slot
                    ? compositionRegistry.allowedFxForSlot(compositionScreenId, slot.id, semanticSelect.value)
                    : [];
                slotInfo.textContent = slot
                    ? (slot.required ? "Obrigatório" : "Opcional")
                        + " · " + (current?.asset ? "arte vinculada" : "sem arte")
                        + (fx.length ? " · FX: " + fx.join(", ") : " · sem FX")
                    : "";
            }
        }

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

        async function addLocalLayer(file) {
            const stage = stageForLocalLayer();
            if (!(stage instanceof Element)) {
                status.textContent = "Não encontrei a área visual da tela";
                return;
            }

            if (root.getComputedStyle(stage).position === "static") {
                stage.style.position = "relative";
            }

            const slot = selectedCompositionSlot();
            if (composition && !slot) {
                status.textContent = "Escolha primeiro o destino desta arte";
                return;
            }

            const semanticType = slot && semanticSelect
                ? semanticSelect.value
                : null;
            const id = slot
                ? slot.id
                : screenId + ".local." + slug(file.name) + "." + Date.now();

            if (slot) {
                const previous = localLayers.find((entry) => entry.id === id);
                if (previous) {
                    previous.image.remove();
                    releaseRuntimeUrl(previous.id);
                    localLayers.splice(localLayers.indexOf(previous), 1);
                }
                try { await deleteLocalLayerRecord(id); } catch (_) {}
                screenRoot.querySelectorAll('[data-tq-composition-slot="' + slot.id + '"]')
                    .forEach((element) => {
                        if (element.classList.contains("tq-dev-local-live-asset")) element.remove();
                    });
            }

            const record = {
                id,
                screenId,
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
                blob: file,
                createdAt: Date.now(),
                slotId: slot?.id || null,
                slotLabel: slot?.label || null,
                semanticType: semanticType || slot?.semanticType || null,
                pairId: slot?.pairId || null,
                pairState: slot?.pairState || null
            };

            if (slot) {
                compositionRegistry.bindAsset(
                    screenId,
                    compositionScreenId,
                    slot.id,
                    null,
                    record.semanticType
                );
            }

            try {
                await saveLocalLayerRecord(record);
            } catch (error) {
                console.error("Falha ao salvar asset local:", error);
                status.textContent = "Não consegui salvar o asset localmente";
                return;
            }

            const { image, objectUrl } = createLocalLayerElement(record);
            stage.appendChild(image);

            const entry = {
                id,
                image,
                objectUrl,
                fileName: file.name,
                slotId: record.slotId,
                semanticType: record.semanticType
            };
            localLayers.push(entry);

            fileName.textContent = file.name;
            removeButton.disabled = false;
            status.textContent = "SALVO LOCAL · " + file.name;

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

        async function removeLastLayer() {
            const entry = localLayers.pop();
            if (!entry) return;

            entry.image.remove();
            releaseRuntimeUrl(entry.id);

            try {
                await deleteLocalLayerRecord(entry.id);
            } catch (error) {
                console.warn("Falha ao remover asset local persistido:", error);
            }

            removeButton.disabled = localLayers.length === 0;
            fileName.textContent = localLayers.at(-1)?.fileName || "Nenhum arquivo local";
            status.textContent = "Camada local removida";
        }

        function validImage(file) {
            return file instanceof File
                && (
                    file.type.startsWith("image/")
                    || /\.(webp|png|jpe?g|gif|svg)$/i.test(file.name)
                );
        }

        async function handleFile(file, mode) {
            if (!validImage(file)) {
                status.textContent = "Escolha uma imagem válida";
                return;
            }

            if (mode === "replace") replaceSelected(file);
            else await addLocalLayer(file);
        }

        host.querySelector(".tq-asset-upload-dev-toggle").addEventListener("click", () => {
            const opening = panel.hidden;
            if (opening) {
                document.querySelectorAll(".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-parallax-dev-panel, .tq-region-builder-panel").forEach((candidate) => {
                    if (candidate !== panel) candidate.hidden = true;
                });
                root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                    detail: { tool: "assets" }
                }));
            }
            panel.hidden = !opening;
            if (!panel.hidden) {
                syncSelected();
                status.textContent = "DEV · " + branch;
            }
        });

        slotSelect?.addEventListener("change", syncCompositionSlot);
        semanticSelect?.addEventListener("change", () => {
            const slot = selectedCompositionSlot();
            if (slot) {
                compositionRegistry.setSemanticType(
                    screenId,
                    compositionScreenId,
                    slot.id,
                    semanticSelect.value
                );
                screenRoot
                    .querySelectorAll('[data-tq-composition-slot="' + slot.id + '"]')
                    .forEach((element) => {
                        element.dataset.tqSemanticType = semanticSelect.value;
                    });
                const entry = localLayers.find((item) => item.slotId === slot.id);
                if (entry) entry.semanticType = semanticSelect.value;
            }
            syncCompositionSlot();
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

        removeButton.disabled = localLayers.length === 0;
        if (localLayers.length) {
            fileName.textContent = localLayers.at(-1)?.fileName || "Asset local restaurado";
        }

        syncCustomVisibility();
        syncSelected();
        syncCompositionSlot();
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.assetUploader = Object.freeze({
        mount,
        normalizeAssetFolder,
        repositoryAssetPathFromUrl,
        buildUploadUrl,
        restoreLocalLayers,
        readLocalLayerRecords,
        clearLocalLayersForScreen,
        deleteLocalLayerRecord
    });
})(globalThis);
