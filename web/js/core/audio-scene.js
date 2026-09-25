(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.audio-scene.v1";
    const SCHEMA_VERSION = 1;
    const MAX_TRACKS = 12;

    const ROLE_LABELS = Object.freeze({
        ambient: "Ambiente",
        music: "Música",
        effect: "Efeito"
    });

    const PUBLISHED_CONFIGS = Object.freeze({});

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function slug(value, fallback) {
        const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return normalized || fallback;
    }

    function normalizeTrack(track, index = 0) {
        const src = String(track?.src || "").trim();
        const label = String(track?.label || "").trim()
            || src.split("/").pop()
            || "Áudio " + (index + 1);
        const id = slug(track?.id || label || src, "audio-" + (index + 1));
        const role = Object.prototype.hasOwnProperty.call(ROLE_LABELS, track?.role)
            ? track.role
            : "ambient";

        return {
            id,
            label,
            src,
            role,
            enabled: track?.enabled !== false,
            autoplay: Boolean(track?.autoplay),
            loop: track?.loop !== false,
            volume: clamp(Number.isFinite(Number(track?.volume)) ? Number(track.volume) : 50, 0, 100)
        };
    }

    function normalizeConfig(config, regionId = null) {
        const tracks = (Array.isArray(config?.tracks) ? config.tracks : [])
            .map(normalizeTrack)
            .filter((track) => track.src)
            .filter((track, index, list) =>
                list.findIndex((candidate) => candidate.id === track.id) === index
            )
            .slice(0, MAX_TRACKS);

        return {
            version: SCHEMA_VERSION,
            enabled: config?.enabled !== false,
            regionId: Number(regionId) || Number(config?.regionId) || null,
            tracks
        };
    }

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return {
                version: SCHEMA_VERSION,
                scopes: parsed?.scopes && typeof parsed.scopes === "object"
                    ? parsed.scopes
                    : {}
            };
        } catch (_) {
            return { version: SCHEMA_VERSION, scopes: {} };
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: SCHEMA_VERSION,
            scopes: store?.scopes && typeof store.scopes === "object"
                ? store.scopes
                : {}
        }));
    }

    function readConfig(scopeId, regionId = null) {
        const scope = String(scopeId || "");
        const stored = readStore().scopes[scope];
        if (stored) return normalizeConfig(stored, regionId);
        if (PUBLISHED_CONFIGS[scope]) {
            return normalizeConfig(PUBLISHED_CONFIGS[scope], regionId);
        }
        return normalizeConfig({ enabled: true, tracks: [] }, regionId);
    }

    function saveConfig(scopeId, config, regionId = null) {
        const scope = String(scopeId || "");
        const normalized = normalizeConfig(config, regionId);
        if (!scope) return normalized;
        const store = readStore();
        store.scopes[scope] = normalized;
        writeStore(store);
        return clone(normalized);
    }

    function clearConfig(scopeId) {
        const scope = String(scopeId || "");
        if (!scope) return;
        const store = readStore();
        delete store.scopes[scope];
        writeStore(store);
    }

    function mount(options = {}) {
        const scopeId = String(options.scopeId || "");
        const regionId = Number(options.regionId) || null;
        let config = normalizeConfig(
            options.config || readConfig(scopeId, regionId),
            regionId
        );
        const players = new Map();
        const pendingAutoplay = new Set();
        let destroyed = false;

        function stopPlayer(id, reset = true) {
            const audio = players.get(id);
            if (!audio) return;
            audio.pause?.();
            if (reset) {
                try { audio.currentTime = 0; } catch (_) {}
            }
            pendingAutoplay.delete(id);
        }

        function ensurePlayer(track) {
            if (!root.Audio || !track?.src) return null;
            let audio = players.get(track.id);
            if (!audio || audio.dataset?.tqAudioSrc !== track.src) {
                stopPlayer(track.id);
                audio = new root.Audio(track.src);
                audio.preload = "auto";
                if (audio.dataset) audio.dataset.tqAudioSrc = track.src;
                players.set(track.id, audio);
            }
            audio.loop = Boolean(track.loop);
            audio.volume = clamp(Number(track.volume) / 100, 0, 1);
            return audio;
        }

        async function playTrack(trackId) {
            const track = config.tracks.find((item) => item.id === String(trackId || ""));
            if (!track || !track.enabled || !config.enabled) return false;
            const audio = ensurePlayer(track);
            if (!audio) return false;
            try {
                await audio.play();
                pendingAutoplay.delete(track.id);
                return true;
            } catch (_) {
                pendingAutoplay.add(track.id);
                return false;
            }
        }

        function stopTrack(trackId) {
            stopPlayer(String(trackId || ""));
        }

        function stopAll() {
            players.forEach((_, id) => stopPlayer(id));
        }

        function sync(nextConfig) {
            config = normalizeConfig(nextConfig, regionId);
            const wanted = new Set(config.tracks.map((track) => track.id));
            [...players.keys()].forEach((id) => {
                if (!wanted.has(id)) {
                    stopPlayer(id);
                    players.delete(id);
                }
            });

            config.tracks.forEach((track) => {
                if (!track.enabled || !config.enabled) {
                    stopPlayer(track.id, false);
                    return;
                }
                ensurePlayer(track);
                if (track.autoplay) {
                    playTrack(track.id);
                } else {
                    pendingAutoplay.delete(track.id);
                }
            });
            return clone(config);
        }

        function unlockPending() {
            if (destroyed || !config.enabled) return;
            [...pendingAutoplay].forEach((id) => playTrack(id));
        }

        root.addEventListener?.("pointerdown", unlockPending, true);
        root.addEventListener?.("keydown", unlockPending, true);
        sync(config);

        return {
            active: true,
            scopeId,
            getConfig: () => clone(config),
            update(nextConfig) {
                return sync(nextConfig);
            },
            playTrack,
            stopTrack,
            stopAll,
            destroy() {
                destroyed = true;
                root.removeEventListener?.("pointerdown", unlockPending, true);
                root.removeEventListener?.("keydown", unlockPending, true);
                stopAll();
                players.clear();
                pendingAutoplay.clear();
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.audioScene = Object.freeze({
        STORAGE_KEY,
        SCHEMA_VERSION,
        MAX_TRACKS,
        ROLE_LABELS,
        PUBLISHED_CONFIGS,
        normalizeTrack,
        normalizeConfig,
        readConfig,
        saveConfig,
        clearConfig,
        mount
    });
})(globalThis);
