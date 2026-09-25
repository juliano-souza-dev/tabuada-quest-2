(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const PAGE_SIZE = 25;

    function resolveAssetCatalog(catalog, manifest) {
        const assetsById = new Map(
            (Array.isArray(manifest) ? manifest : [])
                .filter((entry) => entry && entry.id && entry.asset)
                .map((entry) => [entry.id, entry.asset])
        );

        return (Array.isArray(catalog) ? catalog : [])
            .map((item) => {
                const asset = assetsById.get(item.id) || item.asset || null;
                return asset ? Object.freeze({ ...item, asset }) : null;
            })
            .filter(Boolean);
    }

    function filterCollectedAssets(items, collectedIds) {
        const collected = collectedIds instanceof Set
            ? collectedIds
            : new Set(Array.isArray(collectedIds) ? collectedIds : []);

        return (Array.isArray(items) ? items : []).filter((item) => collected.has(item.id));
    }

    function paginateAssetCatalog(items, pageIndex, pageSize = PAGE_SIZE) {
        const source = Array.isArray(items) ? items : [];
        const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : PAGE_SIZE;
        const totalPages = Math.max(1, Math.ceil(source.length / safePageSize));
        const requestedPage = Number.isInteger(pageIndex) ? pageIndex : 0;
        const safePageIndex = Math.min(Math.max(requestedPage, 0), totalPages - 1);
        const start = safePageIndex * safePageSize;
        const pageItems = source.slice(start, start + safePageSize);

        return Object.freeze({
            pageIndex: safePageIndex,
            totalPages,
            items: pageItems,
            hasPrevious: safePageIndex > 0,
            hasNext: start + safePageSize < source.length
        });
    }

    function renderCollectiblesScreen({ state, onNavigate }) {
        const catalog = TQ.content.collectibles || [];
        const manifest = TQ.collectibleAssetManifest || [];
        const assetCatalog = resolveAssetCatalog(catalog, manifest);
        const collected = new Set(state.campaign?.collectibles?.collectedIds || []);
        const visibleCatalog = filterCollectedAssets(assetCatalog, collected);
        const collectedCount = catalog.filter((item) => collected.has(item.id)).length;

        let currentPage = 0;

        const screen = document.createElement("section");
        screen.className = "collectibles-screen";
        screen.setAttribute(
            "aria-label",
            `Colecionáveis. ${collectedCount} de ${catalog.length} encontrados.`
        );

        screen.innerHTML = `
            <div class="tq-safe-visual-area collectibles-safe-visual-area">\n                <div class="collectibles-artboard tq-canonical-stage">
                <img
                    class="collectibles-background"
                    src="./assets/collectibles/colecionaveis-background.webp"
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                >

                <button
                    type="button"
                    class="collectibles-hotspot collectibles-home-hotspot"
                    data-action="back"
                    aria-label="Voltar para a tela inicial"
                ></button>

                <div class="collectibles-grid" role="list" aria-label="Estante de colecionáveis"></div>

                <button
                    type="button"
                    class="collectibles-hotspot collectibles-page-hotspot collectibles-page-previous"
                    data-action="previous"
                    aria-label="Mostrar os 25 colecionáveis anteriores"
                ></button>

                <button
                    type="button"
                    class="collectibles-hotspot collectibles-page-hotspot collectibles-page-next"
                    data-action="next"
                    aria-label="Mostrar os próximos 25 colecionáveis"
                ></button>

                <p class="collectibles-page-status sr-only" aria-live="polite"></p>
            </div>
        `;

        const grid = screen.querySelector(".collectibles-grid");
        const previousButton = screen.querySelector('[data-action="previous"]');
        const nextButton = screen.querySelector('[data-action="next"]');
        const pageStatus = screen.querySelector(".collectibles-page-status");

        function renderPage() {
            const page = paginateAssetCatalog(visibleCatalog, currentPage, PAGE_SIZE);
            currentPage = page.pageIndex;

            const cells = Array.from({ length: PAGE_SIZE }, (_, index) => {
                const item = page.items[index];
                if (!item) {
                    return '<div class="collectible-slot is-empty" aria-hidden="true"></div>';
                }

                return `
                    <div
                        class="collectible-slot is-collected"
                        role="listitem"
                        data-collectible-id="${item.id}"
                        title="${item.label}"
                    >
                        <img
                            src="${item.asset}"
                            alt="${item.label}"
                            draggable="false"
                        >
                    </div>
                `;
            });

            grid.innerHTML = cells.join("");
            previousButton.disabled = !page.hasPrevious;
            nextButton.disabled = !page.hasNext;
            screen.dataset.collectiblesPage = String(page.pageIndex + 1);
            screen.dataset.collectiblesPages = String(page.totalPages);
            pageStatus.textContent = `Página ${page.pageIndex + 1} de ${page.totalPages}. ${page.items.length} colecionáveis nesta página.`;
        }

        screen.addEventListener("click", (event) => {
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }

            if (event.target.closest('[data-action="previous"]') && !previousButton.disabled) {
                currentPage -= 1;
                renderPage();
                return;
            }

            if (event.target.closest('[data-action="next"]') && !nextButton.disabled) {
                currentPage += 1;
                renderPage();
            }
        });

        renderPage();
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.collectibles = Object.freeze({
        PAGE_SIZE,
        renderCollectiblesScreen,
        resolveAssetCatalog,
        filterCollectedAssets,
        paginateAssetCatalog
    });
})(globalThis);
