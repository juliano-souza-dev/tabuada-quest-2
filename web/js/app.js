(function (root) {
    const TQ = root.TabuadaQuest;
    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) return;

    // App-style input: suppress browser pinch and double-tap zoom while preserving ordinary single-touch interaction.
    document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("gesturechange", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("gestureend", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("touchmove", (event) => {
        if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener("touchend", (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) event.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    let developmentState = null;
    let developmentMode = false;
    let developmentRegionId = null;
    let worldMapPreviewRegionId = null;
    let rewardReturnScreen = null;
    let worldMapReturnScreen = "home";
    let authBusy = false;
    let authRestorePending = false;
    let authRestoreRequired = false;
    let authErrorCode = "";
    const screens = TQ.core.screenManager.createScreenManager(appRoot);

    function syncStatus() {
        return TQ.persistence.localStorage.getSyncStatus();
    }

    function requestRemoteRestore() {
        authRestoreRequired = true;
        authRestorePending = true;
        authErrorCode = "";
        render();
        if (!TQ.persistence.localStorage.restoreFromServer()) {
            authRestorePending = false;
            authErrorCode = "restore_failed";
            render();
        }
    }

    function startGoogleSignIn() {
        if (authBusy) return;
        authBusy = true;
        authErrorCode = "";
        render();
        if (!TQ.persistence.localStorage.signInWithGoogle()) {
            authBusy = false;
            authErrorCode = "google_sign_in_cancelled_or_failed";
            render();
        }
    }

    function resetDevelopmentSession() {
        const status = syncStatus();

        if (status.native) {
            signOut();
            return;
        }

        TQ.persistence.localStorage.clearLocalState(root.localStorage);
        state = TQ.domain.playerState.createInitialState();
        developmentState = null;
        developmentMode = false;
        developmentRegionId = null;
        worldMapPreviewRegionId = null;
        rewardReturnScreen = null;
        worldMapReturnScreen = "home";
        authBusy = false;
        authRestorePending = false;
        authRestoreRequired = false;
        authErrorCode = "";
        render();
    }

    function signOut() {
        TQ.persistence.localStorage.signOut();
        authBusy = false;
        authRestorePending = false;
        authRestoreRequired = false;
        authErrorCode = "";
        render();
    }

    root.addEventListener("tq:native-auth", (event) => {
        authBusy = false;
        const detail = event.detail || {};

        if (!detail.ok) {
            authRestorePending = false;
            authRestoreRequired = false;
            authErrorCode = detail.code || "google_sign_in_cancelled_or_failed";
            render();
            return;
        }

        if (detail.code === "signed_out") {
            authRestorePending = false;
            authRestoreRequired = false;
            authErrorCode = "";
            render();
            return;
        }

        requestRemoteRestore();
    });

    root.addEventListener("tq:native-restore", (event) => {
        const detail = event.detail || {};
        authRestorePending = false;

        if (detail.code === "remote_state_empty") {
            authRestoreRequired = false;
            authErrorCode = "";
            state = TQ.persistence.localStorage.saveState(
                root.localStorage,
                TQ.domain.playerState.createInitialState()
            );
            render();
            return;
        }

        authRestoreRequired = true;
        authErrorCode = detail.code || "restore_failed";
        render();
    });

    function save(nextState) {
        if (developmentMode) {
            developmentState = nextState;
            render();
            return;
        }

        state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
        render();
    }

    function mountParallaxPrototype() {
        document.querySelector(".tq-parallax-dev")?.remove();
        const stage = appRoot.querySelector(".tq-canonical-stage");
        if (!stage) return;
        const assets = [...appRoot.querySelectorAll("[data-tq-asset-id]")];
        if (!assets.length) return;

        const host = document.createElement("aside");
        host.className = "tq-parallax-dev";
        host.innerHTML = `
            <button type="button" class="tq-parallax-dev-toggle">FX</button>
            <section class="tq-parallax-dev-panel" hidden>
                <strong>Parallax · protótipo</strong>
                <div class="tq-parallax-background-context">Fundo atual: <b data-fx-background></b></div>
                <select data-fx-asset>${assets.map((asset) => `<option value="${asset.dataset.tqAssetId}">${asset.dataset.tqAssetLabel || asset.dataset.tqAssetId} · ${asset.dataset.tqAssetRole}</option>`).join("")}</select>
                <button type="button" data-fx-select>Desenhar área</button>
                <label>Movimento <select data-fx-mode><option value="alternate">Vai e volta</option><option value="continuous">Contínuo</option></select></label>
                <label>Direção <select data-fx-direction><option value="left">← Esquerda</option><option value="right">→ Direita</option><option value="up">↑ Cima</option><option value="down">↓ Baixo</option></select></label>
                <label data-fx-distance-row>Distância <input data-fx-distance type="range" min="1" max="60" value="14"></label>
                <label>Velocidade <input data-fx-duration type="range" min="1" max="12" step=".25" value="5"></label>
                <div class="tq-parallax-dev-actions"><button type="button" data-fx-save>💾 Salvar efeito</button><button type="button" data-fx-new>＋ Novo efeito</button></div>
                <div class="tq-parallax-dev-actions"><button type="button" data-fx-play>▶ Aplicar</button><button type="button" data-fx-clear>Excluir rascunho</button></div>
                <label>Efeitos salvos <select data-fx-saved><option value="">Nenhum</option></select></label>
                <div class="tq-parallax-dev-actions"><button type="button" data-fx-load>Editar</button><button type="button" data-fx-delete>Excluir salvo</button></div>
                <small>Os efeitos salvos persistem no navegador e podem coexistir no mesmo asset.</small>
            </section>`;
        document.body.appendChild(host);
        const panel = host.querySelector(".tq-parallax-dev-panel");
        let draft = null;
        let region = null;
        let animation = null;
        let draftData = null;
        const storageKey = "tq2.dev.parallax.effects.v2";
        const legacyStorageKey = "tq2.dev.parallax.effects.v1";
        const activeBackgroundId = state?.ui?.homeBackgroundId || TQ.content.defaultHomeBackgroundId || "default";
        const activeBackground = TQ.screens?.home?.resolveHomeBackground?.(activeBackgroundId);
        const activeBackgroundLabel = activeBackground?.label || activeBackgroundId;
        host.querySelector("[data-fx-background]").textContent = activeBackgroundLabel;
        let effects = (() => { try {
            const current = JSON.parse(root.localStorage.getItem(storageKey) || "[]");
            if (current.length) return current;
            const legacy = JSON.parse(root.localStorage.getItem(legacyStorageKey) || "[]");
            return legacy.map((fx) => ({ ...fx, backgroundId: activeBackgroundId, backgroundLabel: activeBackgroundLabel }));
        } catch (_) { return []; } })();
        effects = effects.map((fx) => ({
            ...fx,
            mode: fx.mode || "alternate",
            direction: fx.direction || (fx.axis === "y" ? "up" : "left")
        }));

        const persistEffects = () => root.localStorage.setItem(storageKey, JSON.stringify(effects));
        const savedSelect = host.querySelector("[data-fx-saved]");
        const refreshSaved = () => {
            savedSelect.innerHTML = '<option value="">Selecione...</option>' + effects.filter((fx) => fx.backgroundId === activeBackgroundId).map((fx, i) => '<option value="'+fx.id+'">'+(i+1)+'. '+fx.assetLabel+' · '+(fx.mode === "continuous" ? "contínuo "+fx.direction : "vai e volta")+'</option>').join("");
        };
        const selectedAsset = () => appRoot.querySelector(`[data-tq-asset-id="${host.querySelector("[data-fx-asset]").value}"]`);
        const clearRegion = () => {
            animation?.cancel(); animation = null;
            region?.remove(); region = null;
            draft?.remove(); draft = null;
        };
        const animateRegion = (target, config) => {
            target.querySelectorAll("[data-fx-loop-copy]").forEach((copy) => copy.remove());
            const primary = target.querySelector("img");
            if (!primary) return { cancel() {} };
            const mode = config.mode || "alternate";
            const direction = config.direction || (config.axis === "y" ? "up" : "left");
            const axis = ["up", "down"].includes(direction) ? "y" : "x";
            const durationMs = Math.max(.25, Number(config.duration) || 5) * 1000;

            if (mode !== "continuous") {
                const distance = Math.max(1, Number(config.distance) || 14);
                const player = primary.animate(
                    axis === "x"
                        ? [{ transform: "translateX(-"+distance+"px) scale(1.08)" }, { transform: "translateX("+distance+"px) scale(1.08)" }]
                        : [{ transform: "translateY(-"+distance+"px) scale(1.08)" }, { transform: "translateY("+distance+"px) scale(1.08)" }],
                    { duration: durationMs, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }
                );
                return { cancel: () => player.cancel() };
            }

            const loopCopy = primary.cloneNode(false);
            loopCopy.dataset.fxLoopCopy = "true";
            const baseLeft = Number.parseFloat(primary.style.left) || 0;
            const baseTop = Number.parseFloat(primary.style.top) || 0;
            const forward = direction === "left" || direction === "up" ? -1 : 1;
            if (axis === "x") loopCopy.style.left = (baseLeft - forward * 100) + "%";
            else loopCopy.style.top = (baseTop - forward * 100) + "%";
            target.appendChild(loopCopy);

            const span = axis === "x" ? target.clientWidth : target.clientHeight;
            const delta = forward * span;
            const frames = axis === "x"
                ? [{ transform: "translateX(0)" }, { transform: "translateX("+delta+"px)" }]
                : [{ transform: "translateY(0)" }, { transform: "translateY("+delta+"px)" }];
            const options = { duration: durationMs, iterations: Infinity, easing: "linear" };
            const players = [primary.animate(frames, options), loopCopy.animate(frames, options)];
            return {
                cancel() {
                    players.forEach((player) => player.cancel());
                    loopCopy.remove();
                }
            };
        };
        const syncModeUi = () => {
            const continuous = host.querySelector("[data-fx-mode]").value === "continuous";
            host.querySelector("[data-fx-distance]").disabled = continuous;
            host.querySelector("[data-fx-distance-row]").style.opacity = continuous ? ".45" : "1";
        };
        const currentEffectConfig = () => {
            const direction = host.querySelector("[data-fx-direction]").value;
            return {
                mode: host.querySelector("[data-fx-mode]").value,
                direction,
                axis: ["up", "down"].includes(direction) ? "y" : "x",
                distance: Number(host.querySelector("[data-fx-distance]").value),
                duration: Number(host.querySelector("[data-fx-duration]").value)
            };
        };
        const apply = () => {
            if (!region) return;
            animation?.cancel();
            animation = animateRegion(region, currentEffectConfig());
        };

        const renderEffect = (fx, editable = false) => {
            const asset = appRoot.querySelector('[data-tq-asset-id="'+fx.assetId+'"]');
            if (!(asset instanceof HTMLImageElement)) return null;
            const assetRect = asset.getBoundingClientRect(), stageRect = stage.getBoundingClientRect();
            const r = fx.bounds;
            const el = document.createElement("div"); el.className = "tq-parallax-region" + (editable ? " is-editing" : ""); el.dataset.fxId = fx.id;
            el.style.left=((assetRect.left-stageRect.left+r.x*assetRect.width)/stageRect.width*100)+"%"; el.style.top=((assetRect.top-stageRect.top+r.y*assetRect.height)/stageRect.height*100)+"%"; el.style.width=(r.w*assetRect.width/stageRect.width*100)+"%"; el.style.height=(r.h*assetRect.height/stageRect.height*100)+"%";
            const poly=fx.points.map(p=>(((p.x-r.x)/r.w)*100).toFixed(2)+"% "+(((p.y-r.y)/r.h)*100).toFixed(2)+"%").join(","); el.style.clipPath="polygon("+poly+")"; el.style.webkitClipPath=el.style.clipPath;
            const clone=asset.cloneNode(false); clone.removeAttribute("data-tq-asset-id"); clone.style.position="absolute"; clone.style.width=(1/r.w*100)+"%"; clone.style.height=(1/r.h*100)+"%"; clone.style.left=(-r.x/r.w*100)+"%"; clone.style.top=(-r.y/r.h*100)+"%"; clone.style.maxWidth="none"; clone.style.pointerEvents="none"; el.appendChild(clone); stage.appendChild(el); el._fxAnimation=animateRegion(el,fx); return el;
        };
        effects.filter((fx) => fx.backgroundId === activeBackgroundId).forEach((fx)=>renderEffect(fx)); refreshSaved(); persistEffects();

        host.querySelector("[data-fx-save]").onclick = () => {
            if (!draftData || !region) return;
            const fx={...draftData,id:"fx_"+Date.now(),backgroundId:activeBackgroundId,backgroundLabel:activeBackgroundLabel,...currentEffectConfig()};
            effects.push(fx); persistEffects(); region.remove(); region=null; animation?.cancel(); animation=null; draftData=null; renderEffect(fx); refreshSaved(); savedSelect.value=fx.id;
        };
        host.querySelector("[data-fx-new]").onclick = () => clearRegion();
        host.querySelector("[data-fx-delete]").onclick = () => { const id=savedSelect.value;if(!id)return;effects=effects.filter(f=>f.id!==id);persistEffects();const savedRegion=stage.querySelector('[data-fx-id="'+id+'"]');savedRegion?._fxAnimation?.cancel();savedRegion?.remove();refreshSaved(); };
        host.querySelector("[data-fx-load]").onclick = () => { const fx=effects.find(f=>f.id===savedSelect.value);if(!fx)return;host.querySelector("[data-fx-asset]").value=fx.assetId;host.querySelector("[data-fx-mode]").value=fx.mode||"alternate";host.querySelector("[data-fx-direction]").value=fx.direction||(fx.axis==="y"?"up":"left");host.querySelector("[data-fx-distance]").value=fx.distance;host.querySelector("[data-fx-duration]").value=fx.duration;syncModeUi(); };

        host.querySelector(".tq-parallax-dev-toggle").onclick = () => panel.hidden = !panel.hidden;
        host.querySelector("[data-fx-clear]").onclick = clearRegion;
        host.querySelector("[data-fx-play]").onclick = apply;
        host.querySelector("[data-fx-mode]").addEventListener("input", () => { syncModeUi(); apply(); });
        host.querySelectorAll("input, select[data-fx-direction]").forEach((control) => control.addEventListener("input", apply));
        syncModeUi();
        host.querySelector("[data-fx-select]").onclick = () => {
            clearRegion();
            const asset = selectedAsset();
            if (!(asset instanceof HTMLImageElement)) return;
            const assetRect = asset.getBoundingClientRect();
            let points = [];
            let drawing = false;

            const clampPoint = (event) => ({
                x: Math.max(assetRect.left, Math.min(event.clientX, assetRect.right)),
                y: Math.max(assetRect.top, Math.min(event.clientY, assetRect.bottom))
            });
            const redraw = () => {
                if (!draft || points.length < 2) return;
                draft.setAttribute("points", points.map((p) => p.x + "," + p.y).join(" "));
            };
            const down = (event) => {
                if (event.clientX < assetRect.left || event.clientX > assetRect.right || event.clientY < assetRect.top || event.clientY > assetRect.bottom) return;
                drawing = true;
                points = [clampPoint(event)];
                draft = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                draft.classList.add("tq-parallax-lasso");
                const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                polygon.classList.add("tq-parallax-lasso-shape");
                draft.appendChild(polygon);
                document.body.appendChild(draft);
                draft = polygon;
                event.preventDefault();
            };
            const move = (event) => {
                if (!drawing || !draft) return;
                const point = clampPoint(event);
                const last = points[points.length - 1];
                if (Math.hypot(point.x-last.x, point.y-last.y) < 3) return;
                points.push(point);
                redraw();
                event.preventDefault();
            };
            const up = () => {
                if (!drawing) return cleanup();
                drawing = false;
                if (points.length >= 3) {
                    const minX = Math.min(...points.map((p) => p.x));
                    const maxX = Math.max(...points.map((p) => p.x));
                    const minY = Math.min(...points.map((p) => p.y));
                    const maxY = Math.max(...points.map((p) => p.y));
                    const width = maxX-minX, height = maxY-minY;
                    if (width > 8 && height > 8) {
                        region = document.createElement("div");
                        region.className = "tq-parallax-region";
                        const stageRect = stage.getBoundingClientRect();
                        region.style.left = ((minX-stageRect.left)/stageRect.width*100)+"%";
                        region.style.top = ((minY-stageRect.top)/stageRect.height*100)+"%";
                        region.style.width = (width/stageRect.width*100)+"%";
                        region.style.height = (height/stageRect.height*100)+"%";
                        const polygon = points.map((p) => (((p.x-minX)/width)*100).toFixed(2)+"% "+(((p.y-minY)/height)*100).toFixed(2)+"%").join(",");
                        region.style.clipPath = "polygon("+polygon+")";
                        region.style.webkitClipPath = "polygon("+polygon+")";
                        const clone = asset.cloneNode(false);
                        clone.removeAttribute("data-tq-asset-id");
                        clone.style.position="absolute";
                        clone.style.width=(assetRect.width/width*100)+"%";
                        clone.style.height=(assetRect.height/height*100)+"%";
                        clone.style.left=(-((minX-assetRect.left)/width)*100)+"%";
                        clone.style.top=(-((minY-assetRect.top)/height)*100)+"%";
                        clone.style.maxWidth="none";
                        clone.style.pointerEvents="none";
                        region.appendChild(clone);
                        stage.appendChild(region);
                        draftData = { assetId: asset.dataset.tqAssetId, assetLabel: asset.dataset.tqAssetLabel || asset.dataset.tqAssetId, bounds: { x:(minX-assetRect.left)/assetRect.width, y:(minY-assetRect.top)/assetRect.height, w:width/assetRect.width, h:height/assetRect.height }, points: points.map(p=>({x:(p.x-assetRect.left)/assetRect.width,y:(p.y-assetRect.top)/assetRect.height})) };
                        apply();
                    }
                }
                const svg = draft?.ownerSVGElement;
                svg?.remove();
                draft=null; points=[]; cleanup();
            };
            const cleanup = () => {
                root.removeEventListener("pointerdown",down,true);
                root.removeEventListener("pointermove",move,true);
                root.removeEventListener("pointerup",up,true);
                root.removeEventListener("pointercancel",up,true);
            };
            root.addEventListener("pointerdown",down,true);
            root.addEventListener("pointermove",move,true);
            root.addEventListener("pointerup",up,true);
            root.addEventListener("pointercancel",up,true);
        };
    }

    function normalizePreviewRegionId(regionId) {
        const normalized = Number(regionId);
        return Number.isInteger(normalized) && normalized >= 1 && normalized <= 22
            ? normalized
            : null;
    }

    function setWorldMapPreviewRegion(regionId) {
        worldMapPreviewRegionId = normalizePreviewRegionId(regionId);
    }

    function setDevelopmentRegion(regionId) {
        developmentRegionId = normalizePreviewRegionId(regionId);
    }

    function openDevelopmentIsland(regionId, islandId) {
        if (!developmentMode) return;

        const normalizedRegionId = normalizePreviewRegionId(regionId);
        const normalizedIslandId = Number(islandId);
        if (!normalizedRegionId
            || !Number.isInteger(normalizedIslandId)
            || normalizedIslandId < 1
            || normalizedIslandId > 5) return;

        developmentRegionId = normalizedRegionId;
        const baseState = developmentState || state;
        developmentState = TQ.screens.islands.createDevelopmentIslandEntryState(
            baseState,
            normalizedRegionId,
            normalizedIslandId
        );
        render();
    }

    function navigate(screenId, options = {}) {
        if (screenId === "development-regions") {
            developmentMode = true;
            developmentState = TQ.domain.playerState.withLastScreen(
                developmentState || state,
                "development-regions"
            );
            render();
            return;
        }

        if (developmentMode) {
            if (screenId === "home") {
                developmentMode = false;
                developmentState = null;
                developmentRegionId = null;
                worldMapPreviewRegionId = null;
                state = TQ.persistence.localStorage.saveState(
                    root.localStorage,
                    TQ.domain.playerState.withLastScreen(state, "home")
                );
                render();
                return;
            }

            const developmentTarget = screenId === "regions"
                ? "development-regions"
                : screenId;
            developmentState = TQ.domain.playerState.withLastScreen(
                developmentState || state,
                developmentTarget
            );
            render();
            return;
        }

        if (["world-map", "regions"].includes(screenId)) {
            worldMapReturnScreen = options.returnScreen
                || (state.ui.lastScreen === "islands" ? "islands" : "home");
        }

        if (!["world-map", "development-regions", "islands"].includes(screenId)) {
            worldMapPreviewRegionId = null;
        }

        if (screenId === "pet" || screenId === "chest" || screenId === "map-reward") {
            rewardReturnScreen = options.afterReward === "regions" ? "regions" : "islands";
        } else if (screenId !== "result") {
            rewardReturnScreen = null;
        }

        state = TQ.persistence.localStorage.saveState(
            root.localStorage,
            TQ.domain.playerState.withLastScreen(state, screenId)
        );
        render();
    }

    function render() {
        const renderState = developmentMode && developmentState
            ? developmentState
            : state;
        const status = syncStatus();

        if (status.native && !status.authenticated) {
            screens.render(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: authBusy,
                restoring: false,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            });
            return;
        }

        if (status.native && (authRestorePending || authRestoreRequired)) {
            screens.render(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: false,
                restoring: authRestorePending,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            });
            return;
        }

        if (!renderState.player.profileCreated) {
            screens.render(TQ.screens.profileSetup.renderProfileScreen, {
                state: renderState,
                status,
                onStateChange: save
            });
            return;
        }

        const renderers = {
            home: TQ.screens.home.renderHomeScreen,
            tavern: TQ.screens.tavern.renderTavernScreen,
            crew: TQ.screens.crew.renderCrewScreen,
            collectibles: TQ.screens.collectibles.renderCollectiblesScreen,
            shop: TQ.screens.shop.renderShopScreen,
            items: TQ.screens.items.renderItemsScreen,
            "ruby-shop": TQ.screens.rubyShop.renderRubyShopScreen,
            "world-map": TQ.screens.worldMap.renderWorldMapScreen,
            regions: TQ.screens.worldMap.renderWorldMapScreen,
            "development-regions": TQ.screens.developmentRegions.renderDevelopmentRegionsScreen,
            islands: TQ.screens.islands.renderIslandsScreen,
            travel: TQ.screens.travel.renderIslandTravelScreen,
            challenge: TQ.screens.challenge.renderChallengeScreen,
            "special-mission": TQ.screens.specialMission.renderSpecialMissionScreen,
            chest: TQ.screens.chest.renderChestScreen,
            pet: TQ.screens.pet.renderPetScreen,
            "map-reward": TQ.screens.mapReward.renderMapRewardScreen,
            result: TQ.screens.result.renderResultScreen
        };
        const renderer = renderers[renderState.ui.lastScreen] || renderers.home;

        screens.render(renderer, {
            state: renderState,
            onStateChange: save,
            onNavigate: navigate,
            onExitSession: resetDevelopmentSession,
            rewardReturnScreen,
            worldMapReturnScreen,
            previewRegionId: developmentMode ? developmentRegionId : worldMapPreviewRegionId,
            onPreviewRegionChange: developmentMode ? setDevelopmentRegion : setWorldMapPreviewRegion,
            developmentMode,
            onDevelopmentIslandOpen: openDevelopmentIsland
        });
        if (TQ.content.development?.shortcutsEnabled) mountParallaxPrototype();
    }

    render();
})(globalThis);
