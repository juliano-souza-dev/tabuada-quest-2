(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const PIXI_CDN = "https://cdn.jsdelivr.net/npm/pixi.js@8.21.0/dist/pixi.min.js";
    const GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js";
    let animationRuntimePromise = null;

    function loadExternalScript(src, globalName) {
        if (root[globalName]) return Promise.resolve(root[globalName]);

        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-tq-runtime="${globalName}"]`);
            if (existing) {
                existing.addEventListener("load", () => resolve(root[globalName]), { once: true });
                existing.addEventListener("error", reject, { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.dataset.tqRuntime = globalName;

            const timeout = root.setTimeout(() => {
                script.remove();
                reject(new Error(`Timeout carregando ${globalName}`));
            }, 8000);

            script.addEventListener("load", () => {
                root.clearTimeout(timeout);
                if (root[globalName]) resolve(root[globalName]);
                else reject(new Error(`${globalName} não ficou disponível`));
            }, { once: true });

            script.addEventListener("error", () => {
                root.clearTimeout(timeout);
                script.remove();
                reject(new Error(`Falha carregando ${globalName}`));
            }, { once: true });

            document.head.appendChild(script);
        });
    }

    function loadAnimationRuntime() {
        if (root.PIXI && root.gsap) {
            return Promise.resolve({ PIXI: root.PIXI, gsap: root.gsap });
        }

        if (!animationRuntimePromise) {
            animationRuntimePromise = Promise.all([
                loadExternalScript(PIXI_CDN, "PIXI"),
                loadExternalScript(GSAP_CDN, "gsap")
            ]).then(() => {
                if (!root.PIXI || !root.gsap) {
                    throw new Error("Runtime PixiJS/GSAP indisponível");
                }
                return { PIXI: root.PIXI, gsap: root.gsap };
            }).catch((error) => {
                animationRuntimePromise = null;
                throw error;
            });
        }

        return animationRuntimePromise;
    }

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

        function restoreStaticBackground() {
            if (!travelBackground) return;
            stage.classList.add("has-travel-background");
            stage.style.backgroundImage = `url("${travelBackground}")`;
        }

        function renderColomboFallback() {
            if (finished || !travelShipAsset) {
                fallbackToChallenge();
                return;
            }

            disposeAnimation();
            stage.replaceChildren();
            restoreStaticBackground();

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

        function renderLottieFallback() {
            if (finished) return;

            if (!travelAnimation || !root.lottie?.loadAnimation) {
                renderColomboFallback();
                return;
            }

            disposeAnimation();
            stage.replaceChildren();
            restoreStaticBackground();

            const lottieContainer = document.createElement("div");
            lottieContainer.className = "island-travel-lottie";
            lottieContainer.setAttribute("aria-hidden", "true");
            stage.appendChild(lottieContainer);

            try {
                const resolvedAnimationUrl = new URL(travelAnimation, document.baseURI);
                animation = root.lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: "svg",
                    loop: false,
                    autoplay: true,
                    path: resolvedAnimationUrl.href,
                    assetsPath: new URL("./images/", resolvedAnimationUrl).href,
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
                animation.addEventListener("data_failed", renderColomboFallback);
                animation.addEventListener("error", renderColomboFallback);
            } catch (_) {
                renderColomboFallback();
            }
        }

        function renderPixiTravel() {
            if (finished || !travelShipAsset) {
                renderLottieFallback();
                return;
            }

            loadAnimationRuntime().then(async ({ PIXI, gsap }) => {
                if (finished) return;

                stage.replaceChildren();

                const app = new PIXI.Application();
                const rect = stage.getBoundingClientRect();
                const initialWidth = Math.max(320, Math.round(rect.width || root.innerWidth || 1080));
                const initialHeight = Math.max(480, Math.round(rect.height || root.innerHeight || 720));

                await app.init({
                    width: initialWidth,
                    height: initialHeight,
                    backgroundAlpha: 0,
                    antialias: true,
                    autoDensity: true,
                    resolution: Math.min(Math.max(root.devicePixelRatio || 1, 1), 2)
                });

                if (finished) {
                    app.destroy(true, { children: true, texture: false, textureSource: false });
                    return;
                }

                app.canvas.className = "island-travel-canvas";
                app.canvas.setAttribute("aria-hidden", "true");
                stage.appendChild(app.canvas);

                const [texture, backgroundTexture] = await Promise.all([
                    PIXI.Assets.load(travelShipAsset),
                    travelBackground ? PIXI.Assets.load(travelBackground) : Promise.resolve(null)
                ]);
                if (finished) {
                    app.destroy(true, { children: true, texture: false, textureSource: false });
                    return;
                }

                const backgroundLayer = new PIXI.Container();
                const waterLayer = new PIXI.Container();
                const travelLayer = new PIXI.Container();
                const floatLayer = new PIXI.Container();
                const wakeLayer = new PIXI.Container();
                const bowLayer = new PIXI.Container();
                const ship = new PIXI.Sprite(texture);

                let backgroundSprite = null;
                let backgroundBreathTween = null;
                let backgroundDriftTween = null;

                if (backgroundTexture) {
                    backgroundSprite = new PIXI.Sprite(backgroundTexture);
                    backgroundSprite.anchor.set(0.5);

                    const coverScale = Math.max(
                        app.screen.width / Math.max(backgroundTexture.width, 1),
                        app.screen.height / Math.max(backgroundTexture.height, 1)
                    ) * 1.035;

                    backgroundSprite.scale.set(coverScale);
                    backgroundSprite.position.set(app.screen.width / 2, app.screen.height / 2);
                    backgroundLayer.addChild(backgroundSprite);

                    stage.style.backgroundImage = "none";

                    backgroundBreathTween = gsap.to(backgroundSprite.scale, {
                        x: coverScale * 1.012,
                        y: coverScale * 1.012,
                        duration: 3.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });

                    backgroundDriftTween = gsap.to(backgroundSprite.position, {
                        x: app.screen.width / 2 - Math.max(3, app.screen.width * 0.006),
                        y: app.screen.height / 2 + Math.max(2, app.screen.height * 0.003),
                        duration: 4.6,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                }

                const waveBands = [
                    { graphic: new PIXI.Graphics(), y: 0.58, amp: 2.4, length: 72, speed: 1.15, alpha: 0.12, width: 1.2 },
                    { graphic: new PIXI.Graphics(), y: 0.68, amp: 3.8, length: 108, speed: 0.78, alpha: 0.10, width: 1.5 },
                    { graphic: new PIXI.Graphics(), y: 0.79, amp: 5.2, length: 146, speed: 0.52, alpha: 0.08, width: 1.8 }
                ];

                waveBands.forEach((band) => waterLayer.addChild(band.graphic));

                ship.anchor.set(0.5);
                floatLayer.addChild(ship);
                travelLayer.addChild(wakeLayer);
                travelLayer.addChild(floatLayer);
                travelLayer.addChild(bowLayer);

                app.stage.addChild(backgroundLayer);
                app.stage.addChild(waterLayer);
                app.stage.addChild(travelLayer);

                const maxShipWidth = Math.min(app.screen.width * 0.72, 620);
                const maxShipHeight = app.screen.height * 0.64;
                const shipScale = Math.min(
                    maxShipWidth / Math.max(texture.width, 1),
                    maxShipHeight / Math.max(texture.height, 1)
                );
                ship.scale.set(shipScale);

                const startX = app.screen.width + ship.width * 0.62;
                const endX = -ship.width * 0.72;
                const centerY = app.screen.height * 0.5;

                travelLayer.position.set(startX, centerY);
                floatLayer.position.set(0, 0);
                floatLayer.rotation = -0.012;

                const particles = [];
                let wakeAccumulator = 0;
                let bowAccumulator = 0;
                let waveTime = 0;

                function redrawWaterBands(dt) {
                    waveTime += dt;

                    waveBands.forEach((band, bandIndex) => {
                        const graphic = band.graphic;
                        const baseY = app.screen.height * band.y;
                        const phase = waveTime * band.speed * Math.PI * 2 + bandIndex * 1.7;

                        graphic.clear();
                        graphic.moveTo(-12, baseY);

                        for (let x = -12; x <= app.screen.width + 12; x += 12) {
                            const y =
                                baseY
                                + Math.sin((x / band.length) * Math.PI * 2 + phase) * band.amp
                                + Math.sin((x / (band.length * 0.47)) * Math.PI * 2 - phase * 0.63) * band.amp * 0.28;
                            graphic.lineTo(x, y);
                        }

                        graphic.stroke({
                            width: band.width,
                            color: 0xdaf8ff,
                            alpha: band.alpha
                        });
                    });
                }

                function spawnFoam(layer, x, y, direction, scale = 1) {
                    if (particles.length >= 72) {
                        const oldest = particles.shift();
                        oldest.graphic.destroy();
                    }

                    const radius = (2.6 + Math.random() * 5.6) * scale;
                    const graphic = new PIXI.Graphics()
                        .ellipse(0, 0, radius * 1.9, radius)
                        .fill({
                            color: Math.random() > 0.35 ? 0xffffff : 0xd9f7ff,
                            alpha: 0.32 + Math.random() * 0.46
                        });

                    graphic.position.set(x, y);
                    layer.addChild(graphic);

                    particles.push({
                        graphic,
                        vx: direction * (18 + Math.random() * 42),
                        vy: -9 + Math.random() * 18,
                        life: 0.72 + Math.random() * 0.78,
                        age: 0,
                        drift: 0.8 + Math.random() * 1.5
                    });
                }

                const tickerHandler = (ticker) => {
                    const dt = Math.min(ticker.deltaMS / 1000, 0.05);
                    wakeAccumulator += dt;
                    bowAccumulator += dt;
                    redrawWaterBands(dt);

                    if (wakeAccumulator >= 0.075) {
                        wakeAccumulator = 0;
                        spawnFoam(
                            wakeLayer,
                            ship.width * 0.42,
                            ship.height * (0.13 + Math.random() * 0.08),
                            1,
                            1
                        );
                    }

                    if (bowAccumulator >= 0.12) {
                        bowAccumulator = 0;
                        spawnFoam(
                            bowLayer,
                            -ship.width * 0.43,
                            ship.height * (0.14 + Math.random() * 0.06),
                            -1,
                            0.7
                        );
                    }

                    for (let index = particles.length - 1; index >= 0; index -= 1) {
                        const particle = particles[index];
                        particle.age += dt;
                        particle.graphic.x += particle.vx * dt;
                        particle.graphic.y += particle.vy * dt;
                        particle.graphic.scale.x += particle.drift * dt;
                        particle.graphic.scale.y += 0.22 * dt;
                        particle.graphic.alpha = Math.max(0, 1 - particle.age / particle.life);

                        if (particle.age >= particle.life) {
                            particle.graphic.destroy();
                            particles.splice(index, 1);
                        }
                    }
                };

                app.ticker.add(tickerHandler);

                const travelTween = gsap.to(travelLayer.position, {
                    x: endX,
                    duration: 6,
                    ease: "none",
                    onComplete: completeTravel
                });

                const bobTween = gsap.to(floatLayer.position, {
                    y: Math.max(5, app.screen.height * 0.012),
                    duration: 1.15,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                const rollTween = gsap.to(floatLayer, {
                    rotation: 0.018,
                    duration: 1.48,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                const breatheTween = gsap.to(floatLayer.scale, {
                    x: 1.008,
                    y: 0.996,
                    duration: 1.72,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                animation = {
                    destroy() {
                        travelTween.kill();
                        bobTween.kill();
                        rollTween.kill();
                        breatheTween.kill();
                        if (backgroundBreathTween) backgroundBreathTween.kill();
                        if (backgroundDriftTween) backgroundDriftTween.kill();
                        app.ticker.remove(tickerHandler);
                        particles.splice(0).forEach((particle) => {
                            try { particle.graphic.destroy(); } catch (_) {}
                        });
                        try {
                            app.destroy(true, { children: true, texture: false, textureSource: false });
                        } catch (_) {}
                    }
                };
            }).catch(() => {
                if (!finished) renderLottieFallback();
            });
        }

        renderPixiTravel();
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.travel = Object.freeze({
        renderIslandTravelScreen
    });
})(globalThis);
