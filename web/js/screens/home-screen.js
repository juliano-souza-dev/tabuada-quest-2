(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function safeAvatarId(avatarId) {
        return TQ.content.assets.avatars[avatarId] ? avatarId : "luna";
    }

    function resolveHomeBackground(backgroundId) {
        return TQ.content.homeBackgrounds.find((item) => item.id === backgroundId)
            || TQ.content.homeBackgrounds.find((item) => item.id === TQ.content.defaultHomeBackgroundId)
            || TQ.content.homeBackgrounds[0];
    }

    function resolveProfileFrame(frameId) {
        return TQ.content.profileFrames.find((item) => item.id === frameId)
            || TQ.content.profileFrames.find((item) => item.id === TQ.content.defaultProfileFrameId)
            || TQ.content.profileFrames[0];
    }

    function clampPercent(value) {
        return Math.max(0, Math.min(100, value));
    }

    function renderHomeScreen({ state, onStateChange }) {
        const avatarId = safeAvatarId(state.player.avatarId);
        const avatarSrc = TQ.content.assets.avatars[avatarId];
        const heroSrc = TQ.content.assets.homeHeroes[avatarId] || avatarSrc;
        const background = resolveHomeBackground(state.ui.homeBackgroundId);
        const profileFrame = resolveProfileFrame(state.player.profileFrameId);
        const totals = TQ.content.campaignTotals;

        const xpPercent = clampPercent((state.progression.xpCurrent / state.progression.xpRequired) * 100);
        const chestCount = Math.min(state.campaign.claimedChestIds.length, totals.chests);
        const chestPercent = clampPercent((chestCount / totals.chests) * 100);
        const petCount = Math.min(state.campaign.petsRescuedIds.length, totals.pets);

        const screen = document.createElement("section");
        screen.className = "home-screen home-v1";
        screen.dataset.backgroundId = background.id;
        screen.style.setProperty("--home-background-image", `url("${background.src}")`);
        screen.setAttribute("aria-label", "Início do Tabuada Quest");

        screen.innerHTML = `
            <div class="home-layout">
                <header class="pirate-hud">
                    <button class="hud-avatar" type="button" data-action="frames" aria-label="Trocar moldura do perfil">
                        <img class="hud-avatar-photo" src="${avatarSrc}" alt="">
                        <img class="hud-avatar-frame" src="${profileFrame.src}" alt="" aria-hidden="true">
                    </button>

                    <div class="hud-identity">
                        <strong class="hud-name">${state.player.displayName}</strong>
                        <div class="hud-level-row">
                            <span class="hud-level">NÍVEL ${state.progression.level}</span>
                            <div class="hud-xp" aria-label="Experiência ${state.progression.xpCurrent} de ${state.progression.xpRequired}">
                                <span style="width:${xpPercent}%"></span>
                                <b>${state.progression.xpCurrent}/${state.progression.xpRequired}</b>
                            </div>
                        </div>
                    </div>

                    <div class="hud-wallet" aria-label="Recursos do jogador">
                        <span class="hud-currency"><i aria-hidden="true">●</i><b>${state.wallet.coins}</b></span>
                        <span class="hud-currency gem"><i aria-hidden="true">◆</i><b>${state.wallet.gems}</b></span>
                    </div>
                </header>

                <div class="game-logo" aria-label="Tabuada Quest">
                    <span class="logo-tabuada">TABUADA</span>
                    <span class="logo-quest">QUEST</span>
                    <span class="logo-compass" aria-hidden="true">✦</span>
                </div>

                <section class="hero-stage" aria-label="Aventura principal">
                    <div class="hero-portal" aria-hidden="true">
                        <span class="portal-wheel">✦</span>
                        <span class="portal-rope left"></span>
                        <span class="portal-rope right"></span>
                    </div>

                    <img class="hero-character" src="${heroSrc}" alt="Avatar selecionado em traje de aventura pirata">

                    <button class="side-action background-action" type="button" data-action="backgrounds">
                        <span class="side-icon scenic" aria-hidden="true"></span>
                        <strong>FUNDO</strong>
                    </button>

                    <button class="side-action frame-action" type="button" data-action="frames">
                        <span class="side-icon fashion" aria-hidden="true"></span>
                        <strong>MODA</strong>
                    </button>

                    <button class="play-button-v1" type="button" data-action="play" style="--play-image:url('${TQ.content.assets.playButton}')">
                        <span>JOGAR</span>
                    </button>
                </section>

                <section class="reward-progress" aria-label="Próximo baú de recompensa">
                    <div class="reward-copy">
                        <strong>PRÓXIMO BAÚ DE RECOMPENSA</strong>
                        <div class="reward-bar">
                            <span style="width:${chestPercent}%"></span>
                            <b>${chestCount}/${totals.chests}</b>
                        </div>
                    </div>
                    <img src="${TQ.content.assets.nauticalChest}" alt="" aria-hidden="true">
                </section>

                <nav class="home-nav" aria-label="Navegação principal">
                    <button type="button" data-action="regions">
                        <img src="${TQ.content.assets.compass}" alt="">
                        <span>REGIÕES</span>
                    </button>
                    <button type="button" data-action="daily">
                        <img src="${TQ.content.assets.reward}" alt="">
                        <span>RECOMPENSA<br>DIÁRIA</span>
                    </button>
                    <button type="button" data-action="shop">
                        <span class="nav-shop-icon" aria-hidden="true">⌂</span>
                        <span>LOJA</span>
                    </button>
                    <button type="button" data-action="collection">
                        <span class="nav-book-icon" aria-hidden="true">★</span>
                        <span>COLECIONÁVEIS</span>
                    </button>
                    <button type="button" data-action="chests">
                        <img src="${TQ.content.assets.chest}" alt="">
                        <span>BAÚS</span>
                    </button>
                </nav>

                <section class="home-cards" aria-label="Coleção e itens">
                    <button class="feature-card pets-card" type="button" data-action="pets">
                        <img src="${TQ.content.assets.pet}" alt="">
                        <span class="feature-copy">
                            <strong>PETS</strong>
                            <b>${petCount}/${totals.pets}</b>
                        </span>
                    </button>

                    <button class="feature-card items-card" type="button" data-action="items">
                        <img src="${TQ.content.assets.itemChest}" alt="">
                        <span class="feature-copy">
                            <strong>BAÚ DE ITENS</strong>
                            <small>Itens da aventura</small>
                        </span>
                    </button>
                </section>
            </div>

            <div class="home-toast" role="status" aria-live="polite"></div>

            <div class="personalization-sheet" data-sheet="backgrounds" hidden>
                <button class="sheet-backdrop" type="button" data-action="close-sheet" aria-label="Fechar"></button>
                <section class="sheet-panel" aria-label="Escolha o fundo">
                    <header><strong>Escolha o fundo</strong><button type="button" data-action="close-sheet">×</button></header>
                    <div class="choice-grid background-choices">
                        ${TQ.content.homeBackgrounds.map((item) => `
                            <button type="button" class="choice-card ${item.id === background.id ? "is-selected" : ""}" data-background-id="${item.id}">
                                <span class="background-thumb" style="background-image:url('${item.src}')"></span>
                                <strong>${item.label}</strong>
                            </button>
                        `).join("")}
                    </div>
                </section>
            </div>

            <div class="personalization-sheet" data-sheet="frames" hidden>
                <button class="sheet-backdrop" type="button" data-action="close-sheet" aria-label="Fechar"></button>
                <section class="sheet-panel" aria-label="Escolha a moldura">
                    <header><strong>Escolha a moldura</strong><button type="button" data-action="close-sheet">×</button></header>
                    <div class="choice-grid frame-choices">
                        ${TQ.content.profileFrames.map((item) => `
                            <button type="button" class="choice-card ${item.id === profileFrame.id ? "is-selected" : ""}" data-frame-id="${item.id}">
                                <span class="frame-thumb">
                                    <img class="frame-thumb-avatar" src="${avatarSrc}" alt="">
                                    <img class="frame-thumb-art" src="${item.src}" alt="">
                                </span>
                                <strong>${item.label}</strong>
                            </button>
                        `).join("")}
                    </div>
                </section>
            </div>
        `;

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
            if (sheet) {
                sheet.hidden = false;
            }
        }

        function closeSheets() {
            screen.querySelectorAll(".personalization-sheet").forEach((sheet) => {
                sheet.hidden = true;
            });
        }

        screen.addEventListener("click", (event) => {
            const backgroundChoice = event.target.closest("[data-background-id]");
            if (backgroundChoice) {
                const allowed = TQ.content.homeBackgrounds.map((item) => item.id);
                const next = TQ.domain.playerState.withHomeBackground(state, backgroundChoice.dataset.backgroundId, allowed);
                onStateChange(next);
                return;
            }

            const frameChoice = event.target.closest("[data-frame-id]");
            if (frameChoice) {
                const allowed = TQ.content.profileFrames.map((item) => item.id);
                const next = TQ.domain.playerState.withProfileFrame(state, frameChoice.dataset.frameId, allowed);
                onStateChange(next);
                return;
            }

            const button = event.target.closest("[data-action]");
            if (!button) return;

            const action = button.dataset.action;

            if (action === "backgrounds") {
                openSheet("backgrounds");
                return;
            }

            if (action === "frames") {
                openSheet("frames");
                return;
            }

            if (action === "close-sheet") {
                closeSheets();
                return;
            }

            const messages = {
                play: "A primeira aventura jogável chega nas próximas issues.",
                regions: "As Regiões serão o mapa principal da campanha.",
                daily: "Recompensa diária preparada para a próxima etapa.",
                shop: "A Loja será liberada na evolução da campanha.",
                collection: "Sua coleção será reunida aqui.",
                chests: "Seus baús aparecerão aqui.",
                pets: "Companheiros resgatados: " + petCount + "/" + totals.pets + ".",
                items: "O Baú de Itens guardará seus itens da aventura."
            };

            showToast(messages[action] || "");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.home = Object.freeze({ renderHomeScreen, resolveHomeBackground, resolveProfileFrame });
})(globalThis);
