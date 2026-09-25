(function (root) {
    const TQ = root.TabuadaQuest;
    const appRoot = document.querySelector("#app");
    if (!TQ || !appRoot) return;

    let state = TQ.persistence.localStorage.loadState(root.localStorage);
    let worldMapPreviewRegionId = null;
    let rewardReturnScreen = null;
    let worldMapReturnScreen = "home";
    let authBusy = false;
    let authRestorePending = false;
    let authRestoreRequired = false;
    let authErrorCode = "";
    const screens = TQ.core.screenManager.createScreenManager(appRoot);
    let renderToken = 0;
    let homeCompositionController = null;
    let homeOceanController = null;
    let homeDepthController = null;

    function destroyHomeRuntime() {
        homeOceanController?.destroy?.();
        homeOceanController = null;
        homeDepthController?.destroy?.();
        homeDepthController = null;
        homeCompositionController?.destroy?.();
        homeCompositionController = null;
    }

    function homeEffectScope(renderState) {
        const rawBackgroundId = String(renderState?.ui?.homeBackgroundId || "default")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "default";
        const backgroundId = TQ.content?.screenComposition?.resolveHomeBackgroundGroupId?.(
            rawBackgroundId
        ) || rawBackgroundId;
        return "home.background-" + backgroundId;
    }

    function mountHomeRuntime(renderState) {
        const screenRoot = appRoot.firstElementChild;
        if (!(screenRoot instanceof Element) || !screenRoot.classList.contains("home-screen")) return;

        homeCompositionController = TQ.core?.screenCompositionRuntime?.mount?.({
            screenRoot,
            screenId: "home",
            scopeId: "home",
            state: renderState,
            presentationRoot: screenRoot.querySelector(".home-design-stage")
        }) || null;

        const effectScope = homeEffectScope(renderState);
        homeOceanController = TQ.core?.oceanScene?.mount?.({
            screenRoot,
            scopeId: effectScope,
            regionId: null
        }) || null;
        homeDepthController = TQ.core?.depthScene?.mount?.({
            screenRoot,
            scopeId: effectScope,
            screenId: "home",
            regionId: null
        }) || null;
    }

    async function renderManaged(renderScreen, context, renderState, token) {
        await screens.render(renderScreen, context);
        if (token !== renderToken) return;
        destroyHomeRuntime();
        mountHomeRuntime(renderState);
    }

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

    function resetSession() {
        const status = syncStatus();

        if (status.native) {
            signOut();
            return;
        }

        TQ.persistence.localStorage.clearLocalState(root.localStorage);
        state = TQ.domain.playerState.createInitialState();
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
        state = TQ.persistence.localStorage.saveState(root.localStorage, nextState);
        render();
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

    function navigate(screenId, options = {}) {
        if (["world-map", "regions"].includes(screenId)) {
            worldMapReturnScreen = options.returnScreen
                || (state.ui.lastScreen === "islands" ? "islands" : "home");
        }

        if (!["world-map", "islands"].includes(screenId)) {
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

    async function render() {
        const token = ++renderToken;
        const renderState = state;
        const status = syncStatus();

        if (status.native && !status.authenticated) {
            await renderManaged(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: authBusy,
                restoring: false,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            }, renderState, token);
            return;
        }

        if (status.native && (authRestorePending || authRestoreRequired)) {
            await renderManaged(TQ.screens.auth.renderAuthScreen, {
                status,
                busy: false,
                restoring: authRestorePending,
                errorCode: authErrorCode,
                onGoogleSignIn: startGoogleSignIn,
                onRetryRestore: requestRemoteRestore,
                onSignOut: signOut
            }, renderState, token);
            return;
        }

        if (!renderState.player.profileCreated) {
            await renderManaged(TQ.screens.profileSetup.renderProfileScreen, {
                state: renderState,
                status,
                onStateChange: save
            }, renderState, token);
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

        await renderManaged(renderer, {
            state: renderState,
            onStateChange: save,
            onNavigate: navigate,
            onExitSession: resetSession,
            rewardReturnScreen,
            worldMapReturnScreen,
            previewRegionId: worldMapPreviewRegionId,
            onPreviewRegionChange: setWorldMapPreviewRegion
        }, renderState, token);
    }

    render();
})(globalThis);
