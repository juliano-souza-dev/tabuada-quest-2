(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    function renderIslandTravelScreen({ state, onStateChange, onNavigate }) {
        const active = state.learning.activeSession;
        const screen = document.createElement("section");
        screen.className = "island-travel-screen";
        screen.setAttribute("aria-label", "Viagem para a Ilha");

        if (!active) {
            screen.innerHTML = '<div class="island-travel-fallback" aria-hidden="true"></div>';
            root.setTimeout(() => onNavigate("islands"), 0);
            return screen;
        }

        TQ.screens.challenge?.preloadChallengeArt?.(active);

        const identity = TQ.content.getIslandIdentity(active.regionId, active.islandId);
        const label = identity ? identity.label : `Ilha ${active.islandId}`;
        const equippedShip = TQ.content.shopCatalog.ships.find(
            (item) => item.id === state.shop.equippedShipId
                && state.shop.purchasedItemIds.includes(item.id)
        ) || null;
        const travelVideo = equippedShip?.travelVideo || TQ.content.assets.islandTravel;

        screen.innerHTML = `
            <video class="island-travel-video"
                src="${travelVideo}"
                autoplay
                muted
                playsinline
                preload="auto"
                aria-label="Viajando para ${label}">
            </video>
            <button class="island-travel-play-button" type="button" hidden>
                VIAJAR
            </button>
            <span class="visually-hidden">Viajando para ${label}</span>
        `;

        const video = screen.querySelector(".island-travel-video");
        const playButton = screen.querySelector(".island-travel-play-button");

        let finished = false;

        function completeTravel() {
            if (finished) return;
            finished = true;
            onStateChange(
                TQ.domain.playerState.completeIslandTravel(
                    state,
                    active.regionId,
                    active.islandId
                )
            );
        }

        function fallbackToChallenge() {
            if (finished) return;
            finished = true;
            onNavigate("challenge");
        }

        video.addEventListener("ended", completeTravel, { once: true });
        video.addEventListener("error", fallbackToChallenge, { once: true });

        playButton.addEventListener("click", () => {
            playButton.hidden = true;
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    playButton.hidden = false;
                });
            }
        });

        root.requestAnimationFrame(() => {
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    playButton.hidden = false;
                });
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.travel = Object.freeze({
        renderIslandTravelScreen
    });
})(globalThis);
