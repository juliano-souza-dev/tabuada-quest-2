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
        screen.className = "home-screen home-premium";
        screen.style.setProperty("--home-background-image", `url("${background.src}")`);
        screen.setAttribute("aria-label", "Início do Tabuada Quest");

        screen.innerHTML = `
            <div class="home-design-stage">
                <div class="home-world" aria-hidden="true"></div>

                <img class="home-art-overlay"
                     src="${TQ.content.assets.homeOverlay}"
                     alt=""
                     aria-hidden="true">

                <button class="profile-slot" type="button" data-action="frames" aria-label="Trocar moldura do perfil">
                    <img class="profile-slot-avatar" src="${avatarSrc}" alt="">
                    <img class="profile-slot-frame" src="${profileFrame.src}" alt="" aria-hidden="true">
                </button>

                <div class="hud-name-slot">${state.player.displayName}</div>
                <div class="hud-level-slot">NÍVEL ${state.progression.level}</div>

                <div class="hud-xp-slot" aria-label="Experiência ${state.progression.xpCurrent} de ${state.progression.xpRequired}">
                    <span class="hud-xp-fill" style="width:${xpPercent}%"></span>
                    <b>${state.progression.xpCurrent}/${state.progression.xpRequired}</b>
                </div>

                <div class="hud-wallet-slot">
                    <span class="wallet-value coins" aria-label="${state.wallet.coins} moedas">● ${state.wallet.coins}</span>
                    <span class="wallet-value gems" aria-label="${state.wallet.gems} gemas">◆ ${state.wallet.gems}</span>
                </div>

                <img class="home-hero-character"
                     src="${heroSrc}"
                     alt="Avatar selecionado em traje de aventura pirata">

                <button class="art-hotspot hotspot-background" type="button" data-action="backgrounds" aria-label="Escolher fundo"></button>
                <button class="art-hotspot hotspot-fashion" type="button" data-action="frames" aria-label="Escolher moldura"></button>

                <button class="play-slot" type="button" data-action="play">JOGAR</button>

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

                <div class="regions-label">REGIÕES</div>
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
                        ${TQ.content.homeBackgrounds.map((item) => `
                            <button type="button"
                                    class="choice-card ${item.id === background.id ? "is-selected" : ""}"
                                    data-background-id="${item.id}">
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
                    <header>
                        <strong>Escolha a moldura</strong>
                        <button type="button" data-action="close-sheet">×</button>
                    </header>
                    <div class="choice-grid">
                        ${TQ.content.profileFrames.map((item) => `
                            <button type="button"
                                    class="choice-card ${item.id === profileFrame.id ? "is-selected" : ""}"
                                    data-frame-id="${item.id}">
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
                const allowed = TQ.content.homeBackgrounds.map((item) => item.id);
                onStateChange(
                    TQ.domain.playerState.withHomeBackground(
                        state,
                        backgroundChoice.dataset.backgroundId,
                        allowed
                    )
                );
                return;
            }

            const frameChoice = event.target.closest("[data-frame-id]");
            if (frameChoice) {
                const allowed = TQ.content.profileFrames.map((item) => item.id);
                onStateChange(
                    TQ.domain.playerState.withProfileFrame(
                        state,
                        frameChoice.dataset.frameId,
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

            if (action === "frames") {
                openSheet("frames");
                return;
            }

            if (action === "close-sheet") {
                closeSheets();
                return;
            }

            const messages = {
                play: "A rota está pronta para a próxima etapa.",
                regions: "As Regiões serão o mapa principal da campanha.",
                daily: "Recompensa diária preparada para a evolução da campanha.",
                shop: "A Loja será liberada na evolução da campanha.",
                collection: "Sua coleção ficará reunida aqui.",
                chests: "Seus baús aparecerão aqui.",
                pets: "Companheiros resgatados: " + petCount + "/" + totals.pets + ".",
                items: "O Baú de Itens guardará seus itens da aventura."
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
