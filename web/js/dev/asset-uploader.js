(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_REPOSITORY = "juliano-souza-dev/tabuada-quest-2";
    const DEFAULT_BRANCH = "develop";
    const DEFAULT_ROOT_PATH = "web/assets";

    const COMMON_FOLDERS = Object.freeze([
        { value: "web/assets", label: "Assets · raiz" },
        { value: "web/assets/ui", label: "UI" },
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

    function selectedAssetFolder(rootPath) {
        const selected = document.querySelector('[data-tq-dev-selected="true"]');
        const rawUrl = assetUrlFromElement(selected);
        const repositoryPath = repositoryAssetPathFromUrl(rawUrl, rootPath);
        return repositoryPath ? folderOf(repositoryPath) : "";
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

        syncCustomVisibility();
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.assetUploader = Object.freeze({
        mount,
        normalizeAssetFolder,
        repositoryAssetPathFromUrl,
        buildUploadUrl
    });
})(globalThis);
