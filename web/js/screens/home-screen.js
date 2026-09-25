(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function safeAvatarId(avatarId) {
        return TQ.content.assets.avatars[avatarId] ? avatarId : "luna";
    }

    function normalizeShopBackground(item) {
        return item ? { id: item.id, label: item.label, src: item.asset, isShopItem: true } : null;
    }

    function resolveHomeBackground(backgroundId) {
        return TQ.content.homeBackgrounds.find((item) => item.id === backgroundId)
            || normalizeShopBackground(TQ.content.shopCatalog.backgrounds.find((item) => item.id === backgroundId))
            || TQ.content.homeBackgrounds.find((item) => item.id === TQ.content.defaultHomeBackgroundId)
            || TQ.content.homeBackgrounds[0];
    }


    function clampPercent(value) {
        return Math.max(0, Math.min(100, value));
    }

    function renderHomeScreen({ state, onStateChange, onNavigate, onExitSession }) {
        const avatarId = safeAvatarId(state.player.avatarId);
        const fallbackAvatarId = "sofia";
        const resolvedAvatarId = TQ.content.assets.avatars[avatarId] ? avatarId : fallbackAvatarId;
        const avatarSrc = TQ.content.assets.avatars[resolvedAvatarId];
        const heroSrc = TQ.content.assets.homeHeroes[resolvedAvatarId] || avatarSrc;
        const background = resolveHomeBackground(state.ui.homeBackgroundId);
        const currentLevel = Math.min(10, Math.max(1, Number(state.progression.level) || 1));
        const levelBadgeSrc = TQ.content.levelBadges[currentLevel - 1];

        const frame = TQ.content.frames.find((item) => item.id === state.player.frameId)
            || TQ.content.frames.find((item) => item.id === TQ.content.defaultFrameId)
            || TQ.content.frames[0];
        const purchasedIds = new Set(state.shop.purchasedItemIds);
        const ownedBackgrounds = [
            ...TQ.content.homeBackgrounds,
            ...TQ.content.shopCatalog.backgrounds
                .filter((item) => purchasedIds.has(item.id))
                .map(normalizeShopBackground)
        ];
        const ownedShips = TQ.content.shopCatalog.ships.filter((item) => purchasedIds.has(item.id));
        const equippedShip = ownedShips.find((item) => item.id === state.shop.equippedShipId) || null;
        const defaultBackground = TQ.content.homeBackgrounds.find((item) => item.id === TQ.content.defaultHomeBackgroundId)
            || TQ.content.homeBackgrounds[0];
        const displayedBackgroundSrc = background.src || defaultBackground?.src || "";
        const totals = TQ.content.campaignTotals;

        const chestCount = Math.min(state.campaign.claimedChestIds.length, totals.chests);
        const chestPercent = clampPercent((chestCount / totals.chests) * 100);
        const petCount = Math.min(state.campaign.petsRescuedIds.length, totals.pets);

        const screen = document.createElement("section");
        screen.className = "home-screen home-premium";
        screen.setAttribute("aria-label", "Início do Tabuada Quest");
        screen.setAttribute("data-tq-dev-ignore", "true");
        screen.style.setProperty("--home-bleed-image", `url("${displayedBackgroundSrc}")`);

        screen.innerHTML = `
            <img
                class="home-full-bleed-background"
                data-tq-dev-ignore="true"
                data-tq-asset-id="home.background.bleed" data-tq-asset-role="background" data-tq-asset-label="Fundo externo da Home" data-tq-dev-id="home.background.bleed" data-tq-dev-kind="background" data-tq-dev-role="background" data-tq-dev-label="Fundo externo da Home"
                src="${displayedBackgroundSrc}"
                data-default-src="${defaultBackground?.src || displayedBackgroundSrc}"
                alt=""
                aria-hidden="true"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;pointer-events:none;user-select:none;"
            >
            <div class="tq-safe-visual-area home-safe-visual-area" data-tq-dev-ignore="true">
            <div class="home-design-stage tq-canonical-stage" data-tq-dev-ignore="true">
                <div class="home-world" data-tq-dev-ignore="true" aria-hidden="true">
                    <img class="home-background-image"
                         data-tq-asset-id="home.background.main" data-tq-asset-role="background" data-tq-asset-label="Background principal" data-tq-dev-id="home.background.main" data-tq-dev-kind="background" data-tq-dev-role="background" data-tq-dev-label="Background principal"
                         src="${displayedBackgroundSrc}"
                         data-default-src="${defaultBackground?.src || displayedBackgroundSrc}"
                         alt="">
                </div>

                <div class="home-frame" aria-label="Moldura do jogador" data-tq-asset-id="home.player.frame" data-tq-asset-role="object" data-tq-asset-label="Moldura do jogador" data-tq-dev-id="home.player.frame" data-tq-dev-kind="asset" data-tq-dev-role="object" data-tq-dev-label="Moldura do jogador">
                    <img class="home-frame-art" src="${frame.asset}" alt="" aria-hidden="true">
                    <span class="home-frame-text" data-tq-dev-id="home.player.name" data-tq-dev-kind="dynamicText" data-tq-dev-label="Nome do jogador">${state.player.displayName}</span>
                </div>

                <img class="home-art-overlay"
                     data-tq-asset-id="home.art.overlay" data-tq-asset-role="overlay" data-tq-asset-label="Arte sobreposta da Home" data-tq-dev-id="home.art.overlay" data-tq-dev-kind="overlay" data-tq-dev-role="overlay" data-tq-dev-label="Arte sobreposta da Home"
                     src="${TQ.content.assets.homeOverlay}"
                     alt=""
                     aria-hidden="true">

                <button class="profile-slot" type="button" data-action="items" data-tq-asset-id="home.player.portrait" data-tq-asset-role="function" data-tq-asset-label="Avatar do jogador" data-tq-dev-id="home.player.portrait" data-tq-dev-kind="function" data-tq-dev-role="button" data-tq-dev-label="Avatar do jogador · abrir itens" data-tq-dev-action="items" aria-label="Abrir Baú de Itens pelo avatar">
                    <img class="profile-slot-avatar" src="${avatarSrc}" alt="Avatar do jogador" draggable="false">
                </button>

                <div class="hud-level-slot" data-tq-asset-id="home.level.badge" data-tq-asset-role="object" data-tq-asset-label="Placa de nível" data-tq-dev-id="home.level.badge" data-tq-dev-kind="asset" data-tq-dev-role="object" data-tq-dev-label="Placa de nível" aria-label="Nível ${currentLevel}"><img src="${levelBadgeSrc}" alt="Nível ${currentLevel}"></div>

                <span class="wallet-value coins" data-tq-dev-id="home.wallet.coins" data-tq-dev-kind="dynamicText" data-tq-dev-label="Ouro" aria-label="${state.wallet.coins} moedas">${state.wallet.coins}</span>
                <span class="wallet-value gems" data-tq-dev-id="home.wallet.gems" data-tq-dev-kind="dynamicText" data-tq-dev-label="Gemas" aria-label="${state.wallet.gems} gemas">${state.wallet.gems}</span>

                <img class="home-hero-character"
                     data-tq-asset-id="home.hero" data-tq-asset-role="object" data-tq-asset-label="Personagem" data-tq-dev-id="home.hero" data-tq-dev-kind="asset" data-tq-dev-role="object" data-tq-dev-label="Personagem"
                     src="${heroSrc}"
                     alt="Avatar selecionado em traje de aventura pirata">

                <img class="home-play-art"
                     data-tq-asset-id="home.play.art"
                     data-tq-asset-role="object"
                     data-tq-asset-label="Arte Jogar"
                     data-tq-dev-id="home.play.art"
                     data-tq-dev-kind="asset"
                     data-tq-dev-role="object"
                     data-tq-dev-label="Arte Jogar"
                     src="./assets/ui/icons/jogar.webp"
                     alt=""
                     aria-hidden="true"
                     draggable="false">

                <img class="home-crew-art"
                     data-tq-asset-id="home.crew.art"
                     data-tq-asset-role="object"
                     data-tq-asset-label="Arte Tripulação"
                     data-tq-dev-id="home.crew.art"
                     data-tq-dev-kind="asset"
                     data-tq-dev-role="object"
                     data-tq-dev-label="Arte Tripulação"
                     src="./assets/ui/icons/tripulacao.webp"
                     alt=""
                     aria-hidden="true"
                     draggable="false">

                <img class="home-shipyard-art"
                     data-tq-asset-id="home.shipyard.art"
                     data-tq-asset-role="object"
                     data-tq-asset-label="Arte do Estaleiro"
                     data-tq-dev-id="home.shipyard.art"
                     data-tq-dev-kind="asset"
                     data-tq-dev-role="object"
                     data-tq-dev-label="Arte do Estaleiro"
                     src="./assets/ui/icons/estaleiro.webp"
                     alt=""
                     aria-hidden="true"
                     draggable="false">

                <button class="art-hotspot hotspot-background" type="button" data-action="backgrounds" data-tq-dev-id="home.action.backgrounds" data-tq-dev-kind="function" data-tq-dev-label="Abrir seleção de fundo" data-tq-dev-action="backgrounds" aria-label="Escolher fundo"></button>
                <button class="art-hotspot hotspot-fashion" type="button" data-action="fashion" data-tq-dev-id="home.action.fashion" data-tq-dev-kind="function" data-tq-dev-label="Abrir Moda" data-tq-dev-action="fashion" aria-label="Abrir Moda"></button>

                <button class="play-slot" type="button" data-action="play" data-tq-dev-id="home.action.play" data-tq-dev-kind="function" data-tq-dev-label="Jogar" data-tq-dev-action="play" aria-label="Jogar"></button>
                <button class="art-hotspot hotspot-crew" type="button" data-action="crew" data-tq-dev-id="home.action.crew" data-tq-dev-kind="function" data-tq-dev-label="Abrir Tripulação" data-tq-dev-action="crew" aria-label="Abrir Tripulação"></button>
                <button class="art-hotspot hotspot-shipyard" type="button" data-action="shipyard" data-tq-dev-id="home.action.shipyard" data-tq-dev-kind="function" data-tq-dev-label="Abrir Estaleiro" data-tq-dev-action="shipyard" aria-label="Abrir Estaleiro"></button>

                <button class="art-hotspot hotspot-regions" type="button" data-action="regions" data-tq-dev-id="home.action.regions" data-tq-dev-kind="function" data-tq-dev-label="Abrir Regiões" data-tq-dev-action="regions" aria-label="Regiões"></button>
                <button class="art-hotspot hotspot-daily" type="button" data-action="daily" data-tq-dev-id="home.action.daily" data-tq-dev-kind="function" data-tq-dev-label="Recompensa diária" data-tq-dev-action="daily" aria-label="Recompensa diária"></button>
                <button class="art-hotspot hotspot-shop" type="button" data-action="shop" data-tq-dev-id="home.action.shop" data-tq-dev-kind="function" data-tq-dev-label="Abrir Loja" data-tq-dev-action="shop" aria-label="Loja"></button>
                <button class="art-hotspot hotspot-collection" type="button" data-action="collection" data-tq-dev-id="home.action.collection" data-tq-dev-kind="function" data-tq-dev-label="Abrir Colecionáveis" data-tq-dev-action="collection" aria-label="Colecionáveis"></button>
                <button class="art-hotspot hotspot-items" type="button" data-action="items" data-tq-dev-id="home.action.items" data-tq-dev-kind="function" data-tq-dev-label="Abrir Itens" data-tq-dev-action="items" aria-label="Itens"></button>


            </div>
            </div>

            <div class="home-toast" role="status" aria-live="polite"></div>

            <div class="personalization-sheet" data-sheet="backgrounds" hidden>
                <button class="sheet-backdrop" type="button" data-action="close-sheet" aria-label="Fechar"></button>
                <section class="sheet-panel" aria-label="Escolha o fundo">
                    <header>
                        <strong>Escolha o fundo</strong>
                        <button type="button" data-action="close-sheet">×</button>
                    </header>
                    <div class="choice-grid">
                        ${ownedBackgrounds.map((item) => `
                            <button type="button"
                                    class="choice-card ${item.id === background.id ? "is-selected" : ""}"
                                    data-background-id="${item.id}">
                                <span class="background-thumb ${item.src ? "" : "is-pending"}" ${item.src ? `style="background-image:url('${item.src}')"` : ""}>
                                    ${item.src ? "" : "<small>Arte em breve</small>"}
                                </span>
                                <strong>${item.label}</strong>
                            </button>
                        `).join("")}
                    </div>
                </section>
            </div>

            <div class="personalization-sheet" data-sheet="fashion" hidden>
                <button class="sheet-backdrop" type="button" data-action="close-sheet" aria-label="Fechar"></button>
                <section class="sheet-panel" aria-label="Moda">
                    <header>
                        <strong>Moda</strong>
                        <button type="button" data-action="close-sheet">×</button>
                    </header>
                    <p class="personalization-empty">
                        As skins e roupas do avatar aparecerão aqui.
                    </p>
                </section>
            </div>

            <div class="personalization-sheet" data-sheet="shipyard" hidden>
                <button class="sheet-backdrop" type="button" data-action="close-sheet" aria-label="Fechar"></button>
                <section class="sheet-panel" aria-label="Escolha o navio">
                    <header>
                        <strong>Estaleiro</strong>
                        <button type="button" data-action="close-sheet">×</button>
                    </header>
                    ${ownedShips.length ? `
                        <div class="choice-grid">
                            ${ownedShips.map((item) => `
                                <button type="button"
                                        class="choice-card ${item.id === equippedShip?.id ? "is-selected" : ""}"
                                        data-ship-id="${item.id}">
                                    <span class="asset-pending-card">⛵</span>
                                    <strong>${item.label}</strong>
                                </button>
                            `).join("")}
                        </div>
                    ` : `
                        <p class="personalization-empty">Nenhum navio comprado ainda. Visite a Loja para adquirir um.</p>
                    `}
                </section>
            </div>
        `;

        TQ.core.safeViewport.bindCanonicalStage(
            screen.querySelector(".home-safe-visual-area"),
            screen.querySelector(".home-design-stage")
        );

        const backgroundImages = [
            screen.querySelector(".home-full-bleed-background"),
            screen.querySelector(".home-background-image")
        ].filter(Boolean);

        backgroundImages.forEach((backgroundImage) => {
            backgroundImage.addEventListener("error", () => {
                const fallbackSrc = backgroundImage.dataset.defaultSrc;
                if (fallbackSrc && !backgroundImage.src.endsWith(fallbackSrc.replace("./", "/"))) {
                    backgroundImage.src = fallbackSrc;
                }
            }, { once: true });
        });

        const toast = screen.querySelector(".home-toast");
        let toastTimer = null;

        function showToast(message) {
            toast.textContent = message;
            toast.classList.add("is-visible");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
        }

        function openSheet(name) {
            const sheet = screen.querySelector(`[data-sheet="${name}"]`);
            if (sheet) sheet.hidden = false;
        }

        function closeSheets() {
            screen.querySelectorAll(".personalization-sheet").forEach((sheet) => {
                sheet.hidden = true;
            });
        }

        screen.addEventListener("click", (event) => {
            const backgroundChoice = event.target.closest("[data-background-id]");
            if (backgroundChoice) {
                const allowed = ownedBackgrounds.map((item) => item.id);
                onStateChange(
                    TQ.domain.playerState.withHomeBackground(
                        state,
                        backgroundChoice.dataset.backgroundId,
                        allowed
                    )
                );
                return;
            }

            const shipChoice = event.target.closest("[data-ship-id]");
            if (shipChoice) {
                const allowed = ownedShips.map((item) => item.id);
                onStateChange(
                    TQ.domain.playerState.withEquippedShip(
                        state,
                        shipChoice.dataset.shipId,
                        allowed
                    )
                );
                return;
            }

            const button = event.target.closest("[data-action]");
            if (!button) return;

            const action = button.dataset.action;

            if (action === "backgrounds") {
                openSheet("backgrounds");
                return;
            }

            if (action === "fashion") {
                openSheet("fashion");
                return;
            }

            if (action === "shipyard") {
                openSheet("shipyard");
                return;
            }

            if (action === "close-sheet") {
                closeSheets();
                return;
            }

            if (action === "tavern") {
                onNavigate("tavern");
                return;
            }

            if (action === "crew") {
                onNavigate("crew");
                return;
            }

            if (action === "collection") {
                onNavigate("collectibles");
                return;
            }

            if (action === "shop") {
                onNavigate("shop");
                return;
            }

            if (action === "items") {
                onNavigate("items");
                return;
            }

            if (action === "regions") {
                onNavigate("regions");
                return;
            }

            if (action === "development-regions") {
                onNavigate("development-regions");
                return;
            }

            if (action === "dev-add-gold") {
                onStateChange(TQ.domain.playerState.applyNumericReward(state, { coins: 1000 }));
                return;
            }

            if (action === "dev-level-up") {
                const currentLevel = Math.min(10, Math.max(1, Number(state.progression.level) || 1));
                if (currentLevel >= 10) return;
                onStateChange({
                    ...state,
                    progression: {
                        ...state.progression,
                        level: currentLevel + 1
                    }
                });
                return;
            }

            if (action === "exit-session") {
                onExitSession?.();
                return;
            }

            if (action === "play") {
                const playRegionId = TQ.domain.playerState.getPlayRegionId(state);
                if (!playRegionId) {
                    onNavigate("regions");
                    return;
                }

                const selected = TQ.domain.playerState.selectRegion(state, playRegionId);
                onStateChange(TQ.domain.playerState.withLastScreen(selected, "islands"));
                return;
            }

            const messages = {
                daily: "Recompensa diária será implementada em breve.",
                chests: "Seus baús aparecerão aqui.",
                pets: "Companheiros resgatados: " + petCount + "/" + totals.pets + "."
            };

            showToast(messages[action] || "");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.home = Object.freeze({
        renderHomeScreen,
        resolveHomeBackground
    });
})(globalThis);
