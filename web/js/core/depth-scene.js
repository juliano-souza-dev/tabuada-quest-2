(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.depth-scene.v1";

    const ROLE_PRESETS = Object.freeze({
        sky: Object.freeze({
            label: "Céu / fundo",
            depth: 6,
            drift: 4,
            speed: 12,
            opacity: 100,
            scale: 102
        }),
        cloudFar: Object.freeze({
            label: "Nuvem distante",
            depth: 22,
            drift: 18,
            speed: 18,
            opacity: 72,
            scale: 106
        }),
        cloudNear: Object.freeze({
            label: "Nuvem próxima",
            depth: 62,
            drift: 34,
            speed: 28,
            opacity: 92,
            scale: 112
        }),
        fog: Object.freeze({
            label: "Névoa",
            depth: 42,
            drift: 16,
            speed: 14,
            opacity: 46,
            scale: 110
        }),
        particles: Object.freeze({
            label: "Partículas",
            depth: 82,
            drift: 26,
            speed: 34,
            opacity: 100,
            scale: 114,
            tilt: 0
        }),
        ship: Object.freeze({
            label: "Navio",
            depth: 48,
            drift: 18,
            speed: 34,
            opacity: 100,
            scale: 104,
            tilt: 34
        }),
        world: Object.freeze({
            label: "Ilhas / cenário",
            depth: 12,
            drift: 3,
            speed: 10,
            opacity: 100,
            scale: 101
        }),
        custom: Object.freeze({
            label: "Personalizado",
            depth: 35,
            drift: 10,
            speed: 18,
            opacity: 100,
            scale: 106
        })
    });

    const PUBLISHED_CONFIGS = Object.freeze({});

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function number(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function percent(value, fallback) {
        return clamp(number(value, fallback), 0, 100);
    }

    function defaultConfig(regionId) {
        return {
            version: 1,
            enabled: true,
            intensity: 56,
            followPointer: true,
            regionId: Number(regionId) || null,
            layers: {}
        };
    }

    function normalizeLayer(layer) {
        const source = layer && typeof layer === "object" ? layer : {};
        const role = ROLE_PRESETS[source.role] ? source.role : "custom";
        const preset = ROLE_PRESETS[role];
        return {
            enabled: source.enabled === undefined ? true : Boolean(source.enabled),
            role,
            depth: percent(source.depth, preset.depth),
            drift: percent(source.drift, preset.drift),
            speed: percent(source.speed, preset.speed),
            opacity: percent(source.opacity, preset.opacity),
            scale: clamp(number(source.scale, preset.scale), 100, 125),
            tilt: percent(source.tilt, preset.tilt || 0)
        };
    }

    function normalizeConfig(config, regionId) {
        const base = defaultConfig(regionId);
        const source = config && typeof config === "object" ? config : {};
        const layers = {};
        Object.entries(source.layers && typeof source.layers === "object" ? source.layers : {})
            .forEach(([id, layer]) => {
                if (!id || !layer || typeof layer !== "object") return;
                layers[String(id)] = normalizeLayer(layer);
            });

        return {
            version: 1,
            enabled: source.enabled === undefined ? base.enabled : Boolean(source.enabled),
            intensity: percent(source.intensity, base.intensity),
            followPointer: source.followPointer === undefined ? base.followPointer : Boolean(source.followPointer),
            regionId: Number(regionId || source.regionId) || null,
            layers
        };
    }

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return {
                version: 1,
                scopes: parsed?.scopes && typeof parsed.scopes === "object" ? parsed.scopes : {}
            };
        } catch (_) {
            return { version: 1, scopes: {} };
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 1,
            scopes: store?.scopes && typeof store.scopes === "object" ? store.scopes : {}
        }));
    }

    function readConfig(scopeId, regionId) {
        const key = String(scopeId || "");
        const local = readStore().scopes[key];
        if (local) return normalizeConfig(local, regionId);
        const published = PUBLISHED_CONFIGS[key];
        if (published) return normalizeConfig(clone(published), regionId);
        return defaultConfig(regionId);
    }

    function saveConfig(scopeId, config, regionId) {
        const key = String(scopeId || "");
        if (!key) return normalizeConfig(config, regionId);
        const store = readStore();
        const normalized = normalizeConfig(config, regionId);
        store.scopes[key] = normalized;
        writeStore(store);
        return normalized;
    }

    function clearConfig(scopeId) {
        const key = String(scopeId || "");
        if (!key) return;
        const store = readStore();
        delete store.scopes[key];
        writeStore(store);
    }

    function applyRole(layer, role) {
        const selectedRole = ROLE_PRESETS[role] ? role : "custom";
        return normalizeLayer({
            ...layer,
            ...ROLE_PRESETS[selectedRole],
            role: selectedRole,
            enabled: true
        });
    }

    function normalizedToken(value, fallback = "item") {
        const token = String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9._#>:-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return token || fallback;
    }

    function pathSegment(element) {
        const tag = element.tagName.toLowerCase();
        const action = element.dataset.action;
        if (action) return tag + "[action-" + normalizedToken(action) + "]";
        if (element.id) return tag + "#" + normalizedToken(element.id);

        const usefulClasses = [...element.classList]
            .filter((name) => !name.startsWith("tq-dev-") && name !== "tq-screen-preparing")
            .slice(0, 2)
            .map((name) => normalizedToken(name));

        const siblings = element.parentElement
            ? [...element.parentElement.children].filter((candidate) => candidate.tagName === element.tagName)
            : [];
        const position = Math.max(1, siblings.indexOf(element) + 1);
        return tag + (usefulClasses.length ? "." + usefulClasses.join(".") : "") + ":" + position;
    }

    function generatedId(element, screenRoot, screenId) {
        const parts = [];
        let cursor = element;
        while (cursor && cursor !== screenRoot && parts.length < 8) {
            parts.push(pathSegment(cursor));
            cursor = cursor.parentElement;
        }
        parts.reverse();
        return normalizedToken(screenId, "screen") + ".auto." + parts.join(">");
    }

    function targetId(element, screenRoot, screenId) {
        return element?.dataset?.tqDevId
            || element?.dataset?.tqAssetId
            || generatedId(element, screenRoot, screenId);
    }

    function targetLabel(element, id) {
        return element?.dataset?.tqDevLabel
            || element?.dataset?.tqAssetLabel
            || element?.getAttribute?.("alt")
            || element?.getAttribute?.("aria-label")
            || element?.dataset?.tqLocalFile
            || [...(element?.classList || [])].find((name) => !name.startsWith("tq-"))
            || id;
    }

    function isVisualTarget(element) {
        if (!(element instanceof Element)) return false;
        if (element.closest(".tq-depth-dev, .tq-ocean-dev, .tq-scene-dev")) return false;
        if (element.dataset.tqDevKind === "function") return false;
        if (element.matches("button, a, input, select, textarea, label")) return false;
        if (element.matches("img, picture, svg, canvas, video")) return true;
        return ["asset", "overlay", "background"].includes(element.dataset.tqDevKind)
            || ["asset", "overlay", "background", "object"].includes(element.dataset.tqAssetRole);
    }

    function collectTargets(screenRoot, screenId) {
        if (!(screenRoot instanceof Element)) return [];
        const registry = TQ.content?.screenComposition || null;
        const compositionActive = Boolean(registry?.getScreen?.(screenId));
        const candidates = [screenRoot, ...screenRoot.querySelectorAll("*")]
            .filter(isVisualTarget)
            .filter((element) => {
                if (!compositionActive) return true;
                const semanticType = element.dataset.tqSemanticType;
                if (!element.dataset.tqCompositionSlot || !semanticType) return false;
                if (element.dataset.tqSlotEmpty === "true") return false;
                const fx = registry.allowedFxForSemanticType(semanticType);
                return fx.includes("depth") || fx.includes("ship-rock");
            });
        const seen = new Set();

        return candidates.map((element) => {
            const id = targetId(element, screenRoot, screenId);
            if (!id || seen.has(id)) return null;
            seen.add(id);
            const semanticType = element.dataset.tqSemanticType || null;
            return {
                id,
                label: targetLabel(element, id),
                semanticType,
                depthRoles: semanticType && registry
                    ? [...registry.depthRolesForSemanticType(semanticType)]
                    : [],
                element
            };
        }).filter(Boolean);
    }

    function stablePhase(id) {
        let hash = 0;
        const text = String(id || "");
        for (let i = 0; i < text.length; i += 1) {
            hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
        }
        return (Math.abs(hash) % 628) / 100;
    }

    function mount(options = {}) {
        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const scopeId = String(options.scopeId || "");
        const screenId = String(options.screenId || "screen");
        const regionId = Number(options.regionId) || null;

        if (!screenRoot || !scopeId) {
            return {
                getConfig: () => defaultConfig(regionId),
                update: () => {},
                refresh: () => {},
                listTargets: () => [],
                destroy: () => {}
            };
        }

        let config = readConfig(scopeId, regionId);
        let targets = [];
        let tracked = new Map();
        let raf = 0;
        let targetPointerX = 0;
        let targetPointerY = 0;
        let pointerX = 0;
        let pointerY = 0;
        let destroyed = false;
        const reducedMotion = root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        function restoreEntry(entry) {
            const element = entry?.element;
            const original = entry?.original;
            if (!(element instanceof HTMLElement) || !original) return;
            element.style.transform = original.transform;
            element.style.transformOrigin = original.transformOrigin;
            element.style.willChange = original.willChange;
            element.style.opacity = original.opacity;
            element.removeAttribute("data-tq-depth-active");
            element.removeAttribute("data-tq-depth-role");
        }

        function restoreAll() {
            tracked.forEach(restoreEntry);
            tracked = new Map();
        }

        function refresh() {
            if (destroyed) return;
            targets = collectTargets(screenRoot, screenId);
            const byId = new Map(targets.map((target) => [target.id, target]));

            [...tracked.entries()].forEach(([id, entry]) => {
                if (config.layers[id]?.enabled && byId.has(id) && config.enabled) return;
                restoreEntry(entry);
                tracked.delete(id);
            });

            if (!config.enabled) return;

            Object.entries(config.layers).forEach(([id, layer]) => {
                if (!layer?.enabled) return;
                const target = byId.get(id);
                const element = target?.element;
                if (!(element instanceof HTMLElement)) return;

                if (!tracked.has(id)) {
                    const computed = root.getComputedStyle(element);
                    tracked.set(id, {
                        id,
                        element,
                        phase: stablePhase(id),
                        original: {
                            transform: element.style.transform || "",
                            transformOrigin: element.style.transformOrigin || "",
                            willChange: element.style.willChange || "",
                            opacity: element.style.opacity || ""
                        },
                        baseTransform: computed.transform && computed.transform !== "none"
                            ? computed.transform
                            : "",
                        baseOpacity: clamp(number(computed.opacity, 1), 0, 1)
                    });
                }

                element.dataset.tqDepthActive = "true";
                element.dataset.tqDepthRole = layer.role;
                element.style.transformOrigin = "center center";
                element.style.willChange = "transform, opacity";
            });
        }

        function onPointerMove(event) {
            if (!config.followPointer || reducedMotion) return;
            const rect = screenRoot.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            targetPointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
            targetPointerY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        }

        function onPointerLeave() {
            targetPointerX = 0;
            targetPointerY = 0;
        }

        function frame(now) {
            if (destroyed) return;
            pointerX += (targetPointerX - pointerX) * 0.075;
            pointerY += (targetPointerY - pointerY) * 0.075;

            if (config.enabled && !document.hidden) {
                const intensity = config.intensity / 100;
                tracked.forEach((entry, id) => {
                    const layer = config.layers[id];
                    if (!layer?.enabled) return;

                    const depth = layer.depth / 100;
                    const drift = reducedMotion ? 0 : layer.drift / 100;
                    const speed = 0.00018 + (layer.speed / 100) * 0.00105;
                    const time = now * speed;
                    const autoX = Math.sin(time + entry.phase) * drift * 9;
                    const autoY = Math.cos((time * 0.72) + entry.phase) * drift * 5;
                    const pointerShiftX = config.followPointer && !reducedMotion
                        ? -pointerX * depth * intensity * 22
                        : 0;
                    const pointerShiftY = config.followPointer && !reducedMotion
                        ? -pointerY * depth * intensity * 15
                        : 0;
                    const x = pointerShiftX + autoX;
                    const shipBob = layer.role === "ship" && !reducedMotion
                        ? Math.sin((time * 1.45) + entry.phase) * (2 + drift * 5)
                        : 0;
                    const y = pointerShiftY + autoY + shipBob;
                    const scale = layer.scale / 100;
                    const tiltDegrees = layer.role === "ship" && !reducedMotion
                        ? Math.sin((time * 1.18) + entry.phase) * (layer.tilt / 100) * 4.5
                        : 0;
                    const transform = [
                        entry.baseTransform,
                        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
                        tiltDegrees ? `rotate(${tiltDegrees.toFixed(3)}deg)` : "",
                        `scale(${scale.toFixed(4)})`
                    ].filter(Boolean).join(" ");

                    entry.element.style.transform = transform;
                    entry.element.style.opacity = String(
                        clamp(entry.baseOpacity * (layer.opacity / 100), 0, 1)
                    );
                });
            }

            raf = root.requestAnimationFrame(frame);
        }

        function update(nextConfig) {
            config = normalizeConfig(nextConfig, regionId);
            refresh();
            return config;
        }

        function getConfig() {
            return clone(config);
        }

        screenRoot.addEventListener("pointermove", onPointerMove, { passive: true });
        screenRoot.addEventListener("pointerleave", onPointerLeave, { passive: true });
        screenRoot.addEventListener("pointercancel", onPointerLeave, { passive: true });

        refresh();
        raf = root.requestAnimationFrame(frame);

        return {
            getConfig,
            update,
            refresh,
            listTargets: () => collectTargets(screenRoot, screenId),
            destroy() {
                destroyed = true;
                if (raf) root.cancelAnimationFrame(raf);
                screenRoot.removeEventListener("pointermove", onPointerMove);
                screenRoot.removeEventListener("pointerleave", onPointerLeave);
                screenRoot.removeEventListener("pointercancel", onPointerLeave);
                restoreAll();
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.depthScene = Object.freeze({
        STORAGE_KEY,
        ROLE_PRESETS,
        PUBLISHED_CONFIGS,
        defaultConfig,
        normalizeLayer,
        normalizeConfig,
        readConfig,
        saveConfig,
        clearConfig,
        applyRole,
        collectTargets,
        mount
    });
})(globalThis);
