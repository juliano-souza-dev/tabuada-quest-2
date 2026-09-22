(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tabuadaQuest.playerState";
    const NATIVE_BRIDGE_NAME = "TabuadaQuestNative";

    function resolveDomain() {
        if (!TQ.domain || !TQ.domain.playerState) {
            throw new Error("player-state module must be loaded before persistence");
        }
        return TQ.domain.playerState;
    }

    function getNativeBridge() {
        const bridge = root[NATIVE_BRIDGE_NAME];
        return bridge
            && typeof bridge.getState === "function"
            && typeof bridge.saveState === "function"
                ? bridge
                : null;
    }

    function parseAndNormalize(raw, domain) {
        if (!raw) return null;
        try {
            return domain.normalizeState(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    function loadState(storage) {
        const domain = resolveDomain();
        const nativeBridge = getNativeBridge();

        if (nativeBridge) {
            try {
                const nativeState = parseAndNormalize(nativeBridge.getState(), domain);
                if (nativeState) return nativeState;
            } catch {
                // O bridge nativo nunca pode impedir o jogo de abrir.
            }
        }

        try {
            const raw = storage.getItem(STORAGE_KEY);
            const storedState = parseAndNormalize(raw, domain);

            if (storedState) {
                if (nativeBridge) {
                    try {
                        nativeBridge.saveState(JSON.stringify(storedState));
                    } catch {
                        // A migração para SQLite é best-effort.
                    }
                }
                return storedState;
            }
        } catch {
            // Fallback para estado inicial.
        }

        const initial = domain.createInitialState();

        if (nativeBridge) {
            try {
                nativeBridge.saveState(JSON.stringify(initial));
            } catch {
                // O jogo continua offline mesmo que o bridge falhe.
            }
        }

        return initial;
    }

    function saveState(storage, state) {
        const domain = resolveDomain();
        const normalized = domain.normalizeState(state);
        const payload = JSON.stringify(normalized);
        const nativeBridge = getNativeBridge();

        if (nativeBridge) {
            try {
                nativeBridge.saveState(payload);
            } catch {
                // Fallback abaixo mantém compatibilidade com browser/WebView.
            }
        }

        try {
            storage.setItem(STORAGE_KEY, payload);
        } catch {
            // Persistência nativa, quando disponível, continua sendo a fonte principal.
        }

        return normalized;
    }

    function getSyncStatus() {
        const nativeBridge = getNativeBridge();
        if (!nativeBridge || typeof nativeBridge.getStatus !== "function") {
            return Object.freeze({
                native: false,
                firebaseConfigured: false,
                authenticated: false,
                pendingSync: 0
            });
        }

        try {
            return Object.freeze(JSON.parse(nativeBridge.getStatus()));
        } catch {
            return Object.freeze({
                native: true,
                firebaseConfigured: false,
                authenticated: false,
                pendingSync: 0
            });
        }
    }

    function requestSync() {
        const nativeBridge = getNativeBridge();
        if (nativeBridge && typeof nativeBridge.syncNow === "function") {
            nativeBridge.syncNow();
            return true;
        }
        return false;
    }

    function signInWithEmailPassword(email, password) {
        const nativeBridge = getNativeBridge();
        if (nativeBridge && typeof nativeBridge.signInWithEmailPassword === "function") {
            nativeBridge.signInWithEmailPassword(String(email || ""), String(password || ""));
            return true;
        }
        return false;
    }

    function signOut() {
        const nativeBridge = getNativeBridge();
        if (nativeBridge && typeof nativeBridge.signOut === "function") {
            nativeBridge.signOut();
            return true;
        }
        return false;
    }

    function restoreFromServer() {
        const nativeBridge = getNativeBridge();
        if (nativeBridge && typeof nativeBridge.restoreFromServer === "function") {
            nativeBridge.restoreFromServer();
            return true;
        }
        return false;
    }

    TQ.persistence = TQ.persistence || {};
    TQ.persistence.localStorage = Object.freeze({
        STORAGE_KEY,
        NATIVE_BRIDGE_NAME,
        getNativeBridge,
        getSyncStatus,
        requestSync,
        signInWithEmailPassword,
        signOut,
        restoreFromServer,
        loadState,
        saveState
    });
})(globalThis);
