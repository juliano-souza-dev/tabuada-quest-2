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
        const defaultShip = TQ.content.shopCatalog.ships.find(
            (item) => item.id === "ship-colombo"
        ) || null;
        const equippedShip = TQ.content.shopCatalog.ships.find(
            (item) => item.id === state.shop.equippedShipId
                && state.shop.purchasedItemIds.includes(item.id)
        ) || defaultShip;

        const travelAnimation = equippedShip?.travelAnimation || defaultShip?.travelAnimation || null;
        const travelShipAsset = equippedShip?.asset || defaultShip?.asset || null;
        const travelBackground = equippedShip?.travelBackground || defaultShip?.travelBackground || null;

        screen.innerHTML = `
            <div class="island-travel-stage" aria-label="Viajando para ${label}"></div>
            <span class="visually-hidden">Viajando para ${label}</span>
        `;

        const stage = screen.querySelector(".island-travel-stage");
        if (travelBackground) {
            stage.classList.add("has-travel-background");
            stage.style.backgroundImage = `url("${travelBackground}")`;
        }
        let finished = false;
        let animation = null;

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

        function renderColomboFallback() {
            if (finished || !travelShipAsset) return;
            disposeAnimation();
            stage.replaceChildren();

            const fallback = document.createElement("div");
            fallback.className = "island-travel-colombo-fallback";
            if (travelBackground) fallback.style.backgroundImage = `url("${travelBackground}")`;
            fallback.innerHTML = `
                <img class="island-travel-colombo-ship" src="${travelShipAsset}" alt="">
            `;
            stage.appendChild(fallback);

            const ship = fallback.querySelector(".island-travel-colombo-ship");
            ship.addEventListener("animationend", completeTravel, { once: true });
            root.setTimeout(() => {
                if (!finished) completeTravel();
            }, 6500);
        }

        function renderAnimationFallback() {
            if (finished) return;
            if (travelShipAsset) {
                renderColomboFallback();
                return;
            }
            fallbackToChallenge();
        }

        if (travelAnimation && root.lottie?.loadAnimation) {
            const lottieContainer = document.createElement("div");
            lottieContainer.className = "island-travel-lottie";
            lottieContainer.setAttribute("aria-hidden", "true");
            stage.appendChild(lottieContainer);

            try {
                const resolvedAnimationUrl = new URL(travelAnimation, document.baseURI);
                const assetsPath = new URL("./images/", resolvedAnimationUrl).href;
                animation = root.lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: "svg",
                    loop: false,
                    autoplay: true,
                    path: resolvedAnimationUrl.href,
                    assetsPath,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid meet",
                        progressiveLoad: true
                    }
                });
                animation.addEventListener("DOMLoaded", () => {
                    try {
                        animation.setDirection(1);
                        animation.setSpeed(1);
                        animation.goToAndPlay(0, true);
                    } catch (_) {}
                });
                animation.addEventListener("complete", completeTravel);
                animation.addEventListener("data_failed", renderAnimationFallback);
                animation.addEventListener("error", renderAnimationFallback);
            } catch (_) {
                renderAnimationFallback();
            }
        } else {
            renderAnimationFallback();
        }

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.travel = Object.freeze({
        renderIslandTravelScreen
    });
})(globalThis);
