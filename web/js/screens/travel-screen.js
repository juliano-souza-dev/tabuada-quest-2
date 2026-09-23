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

        const travelAnimation = equippedShip?.travelAnimation
            || (!equippedShip ? TQ.content.assets.islandTravelAnimation : null);
        const travelVideo = equippedShip?.travelVideo || TQ.content.assets.islandTravel;

        screen.innerHTML = `
            <div class="island-travel-stage" aria-label="Viajando para ${label}"></div>
            <button class="island-travel-play-button" type="button" hidden>
                VIAJAR
            </button>
            <span class="visually-hidden">Viajando para ${label}</span>
        `;

        const stage = screen.querySelector(".island-travel-stage");
        const playButton = screen.querySelector(".island-travel-play-button");
        let finished = false;
        let animation = null;
        let video = null;

        function disposeAnimation() {
            if (!animation) return;
            try {
                animation.destroy();
            } catch (_) {}
            animation = null;
        }

        function completeTravel() {
            if (finished) return;
            finished = true;
            disposeAnimation();
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
            disposeAnimation();
            onNavigate("challenge");
        }

        function renderVideoFallback() {
            if (finished || video) return;
            disposeAnimation();
            stage.replaceChildren();

            video = document.createElement("video");
            video.className = "island-travel-video";
            video.src = travelVideo;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
            video.setAttribute("aria-label", `Viajando para ${label}`);
            stage.appendChild(video);

            video.addEventListener("ended", completeTravel, { once: true });
            video.addEventListener("error", fallbackToChallenge, { once: true });

            playButton.onclick = () => {
                playButton.hidden = true;
                const promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(() => {
                        playButton.hidden = false;
                    });
                }
            };

            root.requestAnimationFrame(() => {
                const promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(() => {
                        playButton.hidden = false;
                    });
                }
            });
        }

        if (travelAnimation && root.lottie?.loadAnimation) {
            const lottieContainer = document.createElement("div");
            lottieContainer.className = "island-travel-lottie";
            lottieContainer.setAttribute("aria-hidden", "true");
            stage.appendChild(lottieContainer);

            try {
                animation = root.lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: "svg",
                    loop: false,
                    autoplay: true,
                    path: travelAnimation,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                        progressiveLoad: true
                    }
                });
                animation.addEventListener("complete", completeTravel);
                animation.addEventListener("data_failed", renderVideoFallback);
                animation.addEventListener("error", renderVideoFallback);
            } catch (_) {
                renderVideoFallback();
            }
        } else {
            renderVideoFallback();
        }

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.travel = Object.freeze({
        renderIslandTravelScreen
    });
})(globalThis);
