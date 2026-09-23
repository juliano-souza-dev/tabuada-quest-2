(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function safeAvatarId(avatarId) {
        return TQ.content.assets.avatars[avatarId] ? avatarId : "luna";
    }

    function normalizeShopBackground(item) {
        return item ? { id: item.id, label: item.label, src: item.asset, isShopItem: true } : null;
    }

    function normalizeShopFrame(item) {
        return item ? { id: item.id, label: item.label, src: item.asset, isShopItem: true } : null;
    }

    function resolveHomeBackground(backgroundId) {
        return TQ.content.homeBackgrounds.find((item) => item.id === backgroundId)
            || normalizeShopBackground(TQ.content.shopCatalog.backgrounds.find((item) => item.id === backgroundId))
            || TQ.content.homeBackgrounds.find((item) => item.id === TQ.content.defaultHomeBackgroundId)
            || TQ.content.homeBackgrounds[0];
    }

    function resolveProfileFrame(frameId) {
        return TQ.content.profileFrames.find((item) => item.id === frameId)
            || normalizeShopFrame(TQ.content.shopCatalog.frames.find((item) => item.id === frameId))
            || TQ.content.profileFrames.find((item) => item.id === TQ.content.defaultProfileFrameId)
            || TQ.content.profileFrames[0];
    }

    function clampPercent(value) {
        return Math.max(0, Math.min(100, value));
    }

    function renderHomeScreen({ state, onStateChange, onNavigate, onExitSession }) {
        const avatarId = safeAvatarId(state.player.avatarId);
        const avatarSrc = TQ.content.assets.avatars[avatarId];
        const heroSrc = TQ.content.assets.homeHeroes[avatarId] || avatarSrc;
        const background = resolveHomeBackground(state.ui.homeBackgroundId);
        const profileFrame = resolveProfileFrame(state.player.profileFrameId);
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

        const xpPercent = clampPercent((state.progression.xpCurrent / state.progression.xpRequired) * 100);
        const chestCount = Math.min(state.campaign.claimedChestIds.length, totals.chests);
        const chestPercent = clampPercent((chestCount / totals.chests) * 100);
        const petCount = Math.min(state.campaign.petsRescuedIds.length, totals.pets);

        const screen = document.createElement("section");
        screen.className = "home-screen home-premium";
        screen.setAttribute("aria-label", "Início do Tabuada Quest");
        screen.style.setProperty("--home-bleed-image", `url("${displayedBackgroundSrc}")`);

        screen.innerHTML = `
            <img
                class="home-full-bleed-background"
                src="${displayedBackgroundSrc}"
                data-default-src="${defaultBackground?.src || displayedBackgroundSrc}"
                alt=""
                aria-hidden="true"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;pointer-events:none;user-select:none;"
            >
            <div class="tq-safe-visual-area home-safe-visual-area">
            <div class="home-design-stage tq-canonical-stage">
                <div class="home-world" aria-hidden="true">
                    <img class="home-background-image"
                         src="${displayedBackgroundSrc}"
                         data-default-src="${defaultBackground?.src || displayedBackgroundSrc}"
                         alt="">
                </div>

                <img class="home-art-overlay"
                     src="${TQ.content.assets.homeOverlay}"
                     alt=""
                     aria-hidden="true">

                <button class="profile-slot ${profileFrame.src ? "has-frame" : "is-simple"}" type="button" data-action="items" aria-label="Abrir Baú de Itens para trocar moldura">
                    <img class="profile-slot-avatar" src="${avatarSrc}" alt="">
                    ${profileFrame.src ? `<img class="profile-slot-frame" src="${profileFrame.src}" alt="" aria-hidden="true">` : ""}
                </button>

                <div class="hud-name-slot">${state.player.displayName}</div>
                <div class="hud-level-slot" aria-label="Nível ${state.progression.level}">${state.progression.level}</div>

                <div class="hud-xp-slot" aria-label="Experiência ${state.progression.xpCurrent} de ${state.progression.xpRequired}">
                    <span class="hud-xp-fill" style="width:${xpPercent}%"></span>
                    <b>${state.progression.xpCurrent}/${state.progression.xpRequired}</b>
                </div>

                <div class="hud-wallet-slot">
                    <span class="wallet-value coins" aria-label="${state.wallet.coins} moedas">${state.wallet.coins}</span>
                    <span class="wallet-value gems" aria-label="${state.wallet.gems} gemas">${state.wallet.gems}</span>
                </div>

                <img class="home-hero-character"
                     src="${heroSrc}"
                     alt="Avatar selecionado em traje de aventura pirata">

                <button class="art-hotspot hotspot-background" type="button" data-action="backgrounds" aria-label="Escolher fundo"></button>
                <button class="art-hotspot hotspot-fashion" type="button" data-action="fashion" aria-label="Abrir Moda"></button>

                <button class="play-slot" type="button" data-action="play" aria-label="Jogar"></button>
                <button class="art-hotspot hotspot-crew" type="button" data-action="crew" aria-label="Abrir Tripulação"></button>
                <button class="art-hotspot hotspot-shipyard" type="button" data-action="shipyard" aria-label="Abrir Estaleiro"></button>

                <div class="reward-dynamic-bar" aria-label="Próximo baú de recompensa">
                    <span style="width:${chestPercent}%"></span>
                    <b>${chestCount}/${totals.chests}</b>
                </div>

                <div class="pet-dynamic-count">${petCount}/${totals.pets}</div>

                <button class="art-hotspot hotspot-regions" type="button" data-action="regions" aria-label="Regiões"></button>
                <button class="art-hotspot hotspot-daily" type="button" data-action="daily" aria-label="Recompensa diária"></button>
                <button class="art-hotspot hotspot-shop" type="button" data-action="shop" aria-label="Loja"></button>
                <button class="art-hotspot hotspot-collection" type="button" data-action="collection" aria-label="Colecionáveis"></button>
                <button class="art-hotspot hotspot-chests" type="button" data-action="chests" aria-label="Baús"></button>
                <button class="art-hotspot hotspot-pets" type="button" data-action="pets" aria-label="Pets"></button>
                <button class="art-hotspot hotspot-items" type="button" data-action="items" aria-label="Baú de itens"></button>

                ${TQ.content.development?.shortcutsEnabled ? `
                    <div class="development-shortcuts" aria-label="Atalhos de desenvolvimento">
                        <button class="development-regions-shortcut"
                            type="button"
                            data-action="development-regions"
                            aria-label="Abrir lista de Regiões para desenvolvimento">
                            DEV · REGIÕES
                        </button>
                        <button class="development-exit-shortcut"
                            type="button"
                            data-action="exit-session"
                            aria-label="Sair e limpar a sessão local de testes">
                            SAIR
                        </button>
                    </div>
                ` : ""}

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
                daily: "Recompensa diária preparada para a evolução da campanha.",
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
        resolveHomeBackground,
        resolveProfileFrame
    });
})(globalThis);
