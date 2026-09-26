(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const LEGACY_LAYOUT_KEYS = Object.freeze([
        "tq2.dev.scene-layout.v3",
        "tq2.dev.scene-layout.v2",
        "tq2.dev.scene-layout.v1"
    ]);

    const PENDING_UPLOAD_KEY = "tq2.dev.pending-semantic-upload.v1";

    function unique(values) {
        return [...new Set(
            (Array.isArray(values) ? values : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
        )];
    }

    function effectScopeCandidates(options = {}) {
        const scopes = [
            options.effectsScopeId,
            options.storageScopeId
        ];

        const screenId = String(options.screenId || "");
        const homeBackgroundId = String(options.homeBackgroundId || "").trim();

        if (screenId === "home") {
            const registry = TQ.content?.screenComposition;
            const canonical = registry?.resolveHomeBackgroundGroupId?.(
                homeBackgroundId || "default"
            ) || (homeBackgroundId || "default");

            scopes.push("home.background-" + canonical);

            if (canonical === "default") {
                scopes.push("home.background-pirate-main");
            }

            if (canonical === "pirate-main") {
                scopes.push("home.background-default");
            }
        }

        return unique(scopes);
    }

    function clearLayoutScope(storageScopeId) {
        const scope = String(storageScopeId || "");
        if (!scope) return 0;

        let cleared = 0;

        LEGACY_LAYOUT_KEYS.forEach((key) => {
            try {
                const raw = root.localStorage.getItem(key);
                if (!raw) return;

                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== "object") return;
                if (!parsed.screens || typeof parsed.screens !== "object") return;
                if (!Object.prototype.hasOwnProperty.call(parsed.screens, scope)) return;

                delete parsed.screens[scope];
                cleared += 1;

                if (Object.keys(parsed.screens).length) {
                    root.localStorage.setItem(key, JSON.stringify(parsed));
                } else {
                    root.localStorage.removeItem(key);
                }
            } catch (error) {
                throw new Error("Falha ao limpar layout UX: " + error.message);
            }
        });

        return cleared;
    }

    function clearPendingUpload(storageScopeId, screenId) {
        try {
            const raw = root.localStorage.getItem(PENDING_UPLOAD_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            const matches = (
                String(parsed?.screenId || "") === String(storageScopeId || "")
                || String(parsed?.screenId || "") === String(screenId || "")
                || String(parsed?.compositionScreenId || "") === String(screenId || "")
            );
            if (!matches) return false;
            root.localStorage.removeItem(PENDING_UPLOAD_KEY);
            return true;
        } catch (_) {
            root.localStorage.removeItem(PENDING_UPLOAD_KEY);
            return true;
        }
    }

    function scopeStillStored(storageKey, scopes) {
        if (!storageKey) return [];
        try {
            const raw = root.localStorage.getItem(storageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            const stored = parsed?.scopes && typeof parsed.scopes === "object"
                ? parsed.scopes
                : {};
            return scopes.filter((scope) =>
                Object.prototype.hasOwnProperty.call(stored, scope)
            );
        } catch (_) {
            return [];
        }
    }

    async function resetScreen(options = {}) {
        const storageScopeId = String(options.storageScopeId || "");
        const screenId = String(options.screenId || "");
        const effectsScopeId = String(options.effectsScopeId || "");
        const homeBackgroundId = options.homeBackgroundId ?? null;
        const screenRoot = options.screenRoot instanceof Element
            ? options.screenRoot
            : null;

        if (!storageScopeId || !screenId) {
            throw new Error("Tela ou escopo de edição inválido.");
        }

        const errors = [];
        const report = {
            storageScopeId,
            screenId,
            effectsScopes: effectScopeCandidates({
                storageScopeId,
                screenId,
                effectsScopeId,
                homeBackgroundId
            }),
            layoutStoresCleared: 0,
            localDraftsCleared: 0,
            compositionReset: false,
            pendingUploadCleared: false,
            oceanCleared: [],
            depthCleared: [],
            audioCleared: []
        };

        try {
            report.layoutStoresCleared = clearLayoutScope(storageScopeId);
        } catch (error) {
            errors.push(error);
        }

        try {
            report.localDraftsCleared = await (
                TQ.dev?.assetUploader?.clearLocalLayersForScreen?.(
                    storageScopeId,
                    screenRoot
                ) ?? 0
            );
        } catch (error) {
            errors.push(new Error("Falha ao limpar assets do UP: " + error.message));
        }

        try {
            const registry = TQ.content?.screenComposition;
            if (!registry?.resetScope) {
                throw new Error("Registro de composição indisponível.");
            }
            registry.resetScope(storageScopeId, screenId);
            report.compositionReset = true;
        } catch (error) {
            errors.push(new Error("Falha ao restaurar composição: " + error.message));
        }

        report.pendingUploadCleared = clearPendingUpload(storageScopeId, screenId);

        for (const scope of report.effectsScopes) {
            try {
                TQ.core?.oceanScene?.clearConfig?.(scope);
                report.oceanCleared.push(scope);
            } catch (error) {
                errors.push(new Error("Falha ao limpar MAR em " + scope + ": " + error.message));
            }

            try {
                TQ.core?.depthScene?.clearConfig?.(scope);
                report.depthCleared.push(scope);
            } catch (error) {
                errors.push(new Error("Falha ao limpar CENA em " + scope + ": " + error.message));
            }

            try {
                TQ.core?.audioScene?.clearConfig?.(scope);
                report.audioCleared.push(scope);
            } catch (error) {
                errors.push(new Error("Falha ao limpar SOM em " + scope + ": " + error.message));
            }
        }

        try {
            const remainingDrafts = await (
                TQ.dev?.assetUploader?.readLocalLayerRecords?.(storageScopeId)
                ?? []
            );
            if (remainingDrafts.length) {
                errors.push(new Error(
                    "Ainda existem " + remainingDrafts.length + " asset(s) local(is) do UP."
                ));
            }
        } catch (error) {
            errors.push(new Error("Falha ao verificar assets locais: " + error.message));
        }

        const remainingOcean = scopeStillStored(
            TQ.core?.oceanScene?.STORAGE_KEY,
            report.effectsScopes
        );
        const remainingDepth = scopeStillStored(
            TQ.core?.depthScene?.STORAGE_KEY,
            report.effectsScopes
        );
        const remainingAudio = scopeStillStored(
            TQ.core?.audioScene?.STORAGE_KEY,
            report.effectsScopes
        );

        if (remainingOcean.length) {
            errors.push(new Error("MAR ainda possui override local: " + remainingOcean.join(", ")));
        }
        if (remainingDepth.length) {
            errors.push(new Error("CENA ainda possui override local: " + remainingDepth.join(", ")));
        }
        if (remainingAudio.length) {
            errors.push(new Error("SOM ainda possui override local: " + remainingAudio.join(", ")));
        }

        if (errors.length) {
            const message = errors.map((error) => error.message).join(" | ");
            const failure = new Error(message);
            failure.report = report;
            throw failure;
        }

        root.dispatchEvent(new CustomEvent("tq:dev-screen-reset", {
            detail: report
        }));

        return report;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.developmentReset = Object.freeze({
        LEGACY_LAYOUT_KEYS,
        effectScopeCandidates,
        clearLayoutScope,
        resetScreen
    });
})(globalThis);
