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

    function renderHomeScreen({ state }) {
        const avatarId = safeAvatarId(state.player.avatarId);
        const avatarSrc = TQ.content.assets.avatars[avatarId];
        const background = resolveHomeBackground(state.ui.homeBackgroundId);
        const profileFrame = resolveProfileFrame(state.player.profileFrameId);
        const mapOne = state.campaign.specialMaps["1"];
        const totals = TQ.content.campaignTotals;

        const screen = document.createElement("section");
        screen.className = "home-screen";
        screen.dataset.backgroundId = background.id;
        screen.style.setProperty("--home-background-image", `url("${background.src}")`);
        screen.setAttribute("aria-label", "Início do Tabuada Quest");

        screen.innerHTML = `
            <header class="player-bar">
                <div class="player-avatar">
                    <img class="player-avatar-image" src="${avatarSrc}" alt="">
                    <img class="player-avatar-frame" src="${profileFrame.src}" alt="" aria-hidden="true">
                </div>
                <div class="player-copy">
                    <span class="player-kicker">Tripulação</span>
                    <strong class="player-name">${state.player.displayName}</strong>
                    <span class="player-route">Nível ${state.progression.level} · XP ${state.progression.xpCurrent}/${state.progression.xpRequired}</span>
                </div>
                <div class="wallet-hud" aria-label="Moedas e gemas">
                    <span>🪙 <strong>${state.wallet.coins}</strong></span>
                    <span>💎 <strong>${state.wallet.gems}</strong></span>
                </div>
            </header>

            <div class="home-brand" aria-label="Tabuada Quest 2.0">
                <small>Uma aventura pelos mares</small>
                <h1>Tabuada <span>Quest</span></h1>
            </div>

            <div class="home-character" aria-hidden="true">
                <img src="${avatarSrc}" alt="">
            </div>

            <div class="home-actions">
                <button class="play-button" type="button" data-action="play">
                    <strong>JOGAR</strong>
                </button>

                <div class="map-progress">
                    <img src="${TQ.content.assets.compass}" alt="">
                    <div class="map-copy">
                        <strong>Mapa especial</strong>
                        <span>Encontre as 4 partes e viaje</span>
                    </div>
                    <div class="fragment-pill">${mapOne.fragments}/${totals.fragmentsPerMap}</div>
                </div>

                <nav class="quick-grid" aria-label="Atalhos da aventura">
                    <button class="quick-action" type="button" data-action="regions">
                        <img src="${TQ.content.assets.compass}" alt="">
                        <span><strong>Regiões</strong><span>${state.campaign.unlockedRegionIds.length}/${totals.regions}</span></span>
                    </button>
                    <button class="quick-action" type="button" data-action="chests">
                        <img src="${TQ.content.assets.chest}" alt="">
                        <span><strong>Baús</strong><span>${state.campaign.claimedChestIds.length}/${totals.chests}</span></span>
                    </button>
                    <button class="quick-action" type="button" data-action="missions">
                        <img src="${TQ.content.assets.reward}" alt="">
                        <span><strong>Missões</strong><span>Mapas especiais</span></span>
                    </button>
                </nav>

                <div class="campaign-strip" aria-label="Progresso da campanha">
                    <div class="campaign-stat">PETs ${state.campaign.petsRescuedIds.length}/${totals.pets}</div>
                    <div class="campaign-stat">MAPAS 0/${totals.specialMaps}</div>
                    <div class="campaign-stat">BAÚS ${state.campaign.claimedChestIds.length}/${totals.chests}</div>
                </div>
            </div>

            <div class="home-toast" role="status" aria-live="polite"></div>
        `;

        const toast = screen.querySelector(".home-toast");
        let toastTimer = null;

        function showToast(message) {
            toast.textContent = message;
            toast.classList.add("is-visible");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
        }

        screen.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");
            if (!button) return;

            const messages = {
                play: "A rota está pronta para receber o primeiro desafio.",
                regions: "Região 1 está liberada.",
                chests: "Os baús fazem parte da jornada.",
                missions: "Complete mapas para liberar viagens especiais."
            };

            showToast(messages[button.dataset.action] || "");
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.home = Object.freeze({ renderHomeScreen, resolveHomeBackground, resolveProfileFrame });
})(globalThis);
