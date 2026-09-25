(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.ocean-scene.v1";
    const DESIGN_WIDTH = 941;
    const DESIGN_HEIGHT = 1672;

    const PRESETS = Object.freeze({
        calm: Object.freeze({
            label: "Mar calmo",
            movement: 28,
            speed: 24,
            shine: 58,
            foam: 12,
            tint: Object.freeze([0.96, 1.02, 1.07])
        }),
        adventure: Object.freeze({
            label: "Aventura",
            movement: 52,
            speed: 44,
            shine: 62,
            foam: 28,
            tint: Object.freeze([0.94, 1.04, 1.10])
        }),
        storm: Object.freeze({
            label: "Tempestade",
            movement: 82,
            speed: 76,
            shine: 22,
            foam: 68,
            tint: Object.freeze([0.72, 0.84, 0.94])
        }),
        night: Object.freeze({
            label: "Noite",
            movement: 42,
            speed: 32,
            shine: 20,
            foam: 18,
            tint: Object.freeze([0.66, 0.80, 1.08])
        }),
        crystal: Object.freeze({
            label: "Água cristalina",
            movement: 24,
            speed: 20,
            shine: 86,
            foam: 10,
            tint: Object.freeze([0.90, 1.08, 1.14])
        })
    });

    const PUBLISHED_CONFIGS = Object.freeze({});

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function percent(value, fallback) {
        const number = Number(value);
        return clamp(Number.isFinite(number) ? number : fallback, 0, 100);
    }

    function normalizeArea(area) {
        const points = Array.isArray(area) ? area : [];
        const normalized = points
            .map((point) => ({
                x: clamp(Number(point?.x) || 0, 0, 1),
                y: clamp(Number(point?.y) || 0, 0, 1)
            }))
            .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
        return normalized.length >= 3
            ? normalized
            : [
                { x: 0, y: 0.2 },
                { x: 1, y: 0.2 },
                { x: 1, y: 1 },
                { x: 0, y: 1 }
            ];
    }

    function defaultConfig(regionId) {
        const preset = PRESETS.adventure;
        return {
            version: 1,
            enabled: false,
            preset: "adventure",
            movement: preset.movement,
            speed: preset.speed,
            shine: preset.shine,
            foam: preset.foam,
            ripples: true,
            shipWake: true,
            quality: "balanced",
            area: normalizeArea(null),
            regionId: Number(regionId) || null
        };
    }

    function normalizeConfig(config, regionId) {
        const base = defaultConfig(regionId);
        const source = config && typeof config === "object" ? config : {};
        const presetName = PRESETS[source.preset] ? source.preset : base.preset;
        return {
            version: 1,
            enabled: source.enabled === undefined ? base.enabled : Boolean(source.enabled),
            preset: presetName,
            movement: percent(source.movement, base.movement),
            speed: percent(source.speed, base.speed),
            shine: percent(source.shine, base.shine),
            foam: percent(source.foam, base.foam),
            ripples: source.ripples === undefined ? base.ripples : Boolean(source.ripples),
            shipWake: source.shipWake === undefined ? base.shipWake : Boolean(source.shipWake),
            quality: ["economy", "balanced", "high"].includes(source.quality)
                ? source.quality
                : base.quality,
            area: normalizeArea(source.area),
            regionId: Number(regionId || source.regionId) || null
        };
    }

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            return {
                version: 1,
                scopes: parsed?.scopes && typeof parsed.scopes === "object"
                    ? parsed.scopes
                    : {}
            };
        } catch (_) {
            return { version: 1, scopes: {} };
        }
    }

    function readConfig(scopeId, regionId) {
        const scope = String(scopeId || "");
        const store = readStore();
        if (scope && store.scopes[scope]) {
            return normalizeConfig(store.scopes[scope], regionId);
        }
        if (scope && PUBLISHED_CONFIGS[scope]) {
            return normalizeConfig(PUBLISHED_CONFIGS[scope], regionId);
        }
        return defaultConfig(regionId);
    }

    function saveConfig(scopeId, config, regionId) {
        const scope = String(scopeId || "");
        if (!scope) return normalizeConfig(config, regionId);
        const normalized = normalizeConfig(config, regionId);
        const store = readStore();
        store.scopes[scope] = normalized;
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        return normalized;
    }

    function clearConfig(scopeId) {
        const scope = String(scopeId || "");
        if (!scope) return;
        const store = readStore();
        delete store.scopes[scope];
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    function applyPreset(config, presetName) {
        const preset = PRESETS[presetName] || PRESETS.adventure;
        return normalizeConfig({
            ...config,
            preset: PRESETS[presetName] ? presetName : "adventure",
            movement: preset.movement,
            speed: preset.speed,
            shine: preset.shine,
            foam: preset.foam
        }, config?.regionId);
    }

    function polygonCss(area) {
        return "polygon(" + normalizeArea(area)
            .map((point) => (point.x * 100).toFixed(3) + "% " + (point.y * 100).toFixed(3) + "%")
            .join(",") + ")";
    }

    function pointInPolygon(point, area) {
        const polygon = normalizeArea(area);
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            const intersects = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || 0.000001) + xi);
            if (intersects) inside = !inside;
        }
        return inside;
    }

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const message = gl.getShaderInfoLog(shader) || "Falha ao compilar shader";
            gl.deleteShader(shader);
            throw new Error(message);
        }
        return shader;
    }

    function createProgram(gl) {
        const vertexSource = [
            "attribute vec2 a_position;",
            "varying vec2 v_uv;",
            "void main() {",
            "  v_uv = a_position * 0.5 + 0.5;",
            "  gl_Position = vec4(a_position, 0.0, 1.0);",
            "}"
        ].join("\n");

        const fragmentSource = [
            "precision mediump float;",
            "uniform sampler2D u_texture;",
            "uniform float u_time;",
            "uniform float u_movement;",
            "uniform float u_speed;",
            "uniform float u_shine;",
            "uniform float u_foam;",
            "uniform vec3 u_tint;",
            "uniform vec2 u_ripple;",
            "uniform float u_ripple_age;",
            "uniform vec2 u_ship;",
            "uniform float u_ship_wake;",
            "varying vec2 v_uv;",
            "void main() {",
            "  vec2 uv = v_uv;",
            "  float t = u_time * (0.35 + u_speed * 1.65);",
            "  float w1 = sin(uv.y * 34.0 + uv.x * 8.0 + t * 1.45);",
            "  float w2 = sin(uv.y * 19.0 - uv.x * 13.0 - t * 1.05);",
            "  float w3 = sin((uv.x + uv.y) * 27.0 + t * 0.72);",
            "  float waves = w1 * 0.50 + w2 * 0.31 + w3 * 0.19;",
            "  vec2 offset = vec2(",
            "    (w1 * 0.0036 + w3 * 0.0019) * u_movement,",
            "    (w2 * 0.0024 + w3 * 0.0012) * u_movement",
            "  );",
            "  if (u_ripple_age >= 0.0 && u_ripple_age < 2.8) {",
            "    vec2 delta = uv - u_ripple;",
            "    float d = length(delta);",
            "    float ring = sin(d * 92.0 - u_ripple_age * 12.0);",
            "    float decay = exp(-d * 10.0) * (1.0 - u_ripple_age / 2.8);",
            "    vec2 dir = d > 0.0001 ? delta / d : vec2(0.0);",
            "    offset += dir * ring * decay * 0.0045 * u_movement;",
            "  }",
            "  if (u_ship_wake > 0.5 && u_ship.x >= 0.0) {",
            "    vec2 sd = uv - u_ship;",
            "    float behind = smoothstep(0.01, 0.23, -sd.y) * (1.0 - smoothstep(0.23, 0.48, -sd.y));",
            "    float arm = abs(abs(sd.x) - max(0.0, -sd.y) * 0.34);",
            "    float wake = exp(-arm * 92.0) * behind;",
            "    offset.x += sign(sd.x) * wake * 0.0055;",
            "  }",
            "  vec2 sampleUv = clamp(uv + offset, vec2(0.002), vec2(0.998));",
            "  vec4 color = texture2D(u_texture, sampleUv);",
            "  color.rgb *= mix(vec3(1.0), u_tint, 0.18);",
            "  float crest = pow(max(0.0, waves * 0.5 + 0.5), 9.0);",
            "  float sparkle = pow(max(0.0, sin((uv.x * 53.0 - uv.y * 31.0) + t * 1.9)), 18.0);",
            "  color.rgb += vec3(0.15, 0.20, 0.22) * crest * u_shine;",
            "  color.rgb += vec3(0.16, 0.22, 0.24) * sparkle * u_shine;",
            "  float foam = smoothstep(0.72, 0.98, crest + sparkle * 0.7) * u_foam;",
            "  if (u_ship_wake > 0.5 && u_ship.x >= 0.0) {",
            "    vec2 fd = uv - u_ship;",
            "    float fbehind = smoothstep(0.01, 0.22, -fd.y) * (1.0 - smoothstep(0.22, 0.48, -fd.y));",
            "    float farm = abs(abs(fd.x) - max(0.0, -fd.y) * 0.34);",
            "    foam += exp(-farm * 115.0) * fbehind * 0.75;",
            "  }",
            "  color.rgb = mix(color.rgb, vec3(0.92, 0.98, 1.0), clamp(foam, 0.0, 0.72));",
            "  gl_FragColor = vec4(color.rgb, 1.0);",
            "}"
        ].join("\n");

        const program = gl.createProgram();
        const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program) || "Falha ao iniciar oceano WebGL";
            gl.deleteProgram(program);
            throw new Error(message);
        }
        return program;
    }

    function noopController(config, reason) {
        let current = clone(config);
        return {
            webgl: false,
            reason: reason || "indisponível",
            getConfig: () => clone(current),
            update(next) {
                current = normalizeConfig(next, current.regionId);
                return clone(current);
            },
            addRipple() {},
            destroy() {}
        };
    }

    function mount(options = {}) {
        const screenRoot = options.screenRoot instanceof Element ? options.screenRoot : null;
        const stage = screenRoot?.querySelector(".tq-canonical-stage")
            || screenRoot?.querySelector(".tq-safe-visual-area")
            || screenRoot;
        const compositionActive = Boolean(screenRoot?.dataset?.tqCompositionScreen);
        const semanticHost = compositionActive
            ? stage?.querySelector('[data-tq-semantic-type="ocean"]')
            : null;
        const source = compositionActive
            ? (
                semanticHost instanceof HTMLImageElement
                    ? semanticHost
                    : semanticHost?.querySelector?.("img")
            )
            : stage?.querySelector(".region-islands-background");
        const regionId = Number(options.regionId || screenRoot?.dataset?.regionId) || null;
        const scopeId = String(options.scopeId || (regionId ? "islands.region-" + regionId : ""));

        if (!stage || !(source instanceof HTMLImageElement) || !scopeId) {
            return noopController(defaultConfig(regionId), "tela sem oceano");
        }

        stage.querySelectorAll(".region-ocean-motion[data-tq-ocean-scene]").forEach((node) => node.remove());

        let config = normalizeConfig(options.config || readConfig(scopeId, regionId), regionId);
        const canvas = document.createElement("canvas");
        canvas.className = "region-ocean-motion";
        canvas.dataset.tqOceanScene = "true";
        canvas.setAttribute("aria-hidden", "true");
        const canvasHost = compositionActive && semanticHost instanceof HTMLElement
            ? semanticHost
            : stage;
        if (canvasHost instanceof HTMLElement) {
            canvasHost.style.overflow = "hidden";
        }
        canvasHost.appendChild(canvas);

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        if (!gl) {
            canvas.remove();
            return noopController(config, "WebGL não disponível");
        }

        let program;
        try {
            program = createProgram(gl);
        } catch (error) {
            console.warn("Oceano WebGL indisponível:", error);
            canvas.remove();
            return noopController(config, "WebGL não iniciou");
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1, -1,  1,
            -1,  1,  1, -1,  1,  1
        ]), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, "a_position");
        const uniforms = {
            texture: gl.getUniformLocation(program, "u_texture"),
            time: gl.getUniformLocation(program, "u_time"),
            movement: gl.getUniformLocation(program, "u_movement"),
            speed: gl.getUniformLocation(program, "u_speed"),
            shine: gl.getUniformLocation(program, "u_shine"),
            foam: gl.getUniformLocation(program, "u_foam"),
            tint: gl.getUniformLocation(program, "u_tint"),
            ripple: gl.getUniformLocation(program, "u_ripple"),
            rippleAge: gl.getUniformLocation(program, "u_ripple_age"),
            ship: gl.getUniformLocation(program, "u_ship"),
            shipWake: gl.getUniformLocation(program, "u_ship_wake")
        };

        const texture = gl.createTexture();
        let textureReady = false;
        let raf = 0;
        let startedAt = 0;
        let rippleStartedAt = -1;
        let ripplePoint = { x: -1, y: -1 };
        let destroyed = false;

        function presetTint() {
            return PRESETS[config.preset]?.tint || PRESETS.adventure.tint;
        }

        function qualityScale() {
            if (config.quality === "economy") return 0.55;
            if (config.quality === "high") return 1;
            return 0.78;
        }

        function resize() {
            const dpr = Math.min(Math.max(root.devicePixelRatio || 1, 1), config.quality === "high" ? 1.6 : 1.25);
            const scale = qualityScale();
            const hostRect = canvasHost.getBoundingClientRect();
            const cssWidth = hostRect.width || DESIGN_WIDTH;
            const cssHeight = hostRect.height || DESIGN_HEIGHT;
            const width = Math.max(1, Math.round(cssWidth * dpr * scale));
            const height = Math.max(1, Math.round(cssHeight * dpr * scale));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            gl.viewport(0, 0, width, height);
        }

        function uploadTexture() {
            if (!source.complete || !source.naturalWidth) return false;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            try {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
                textureReady = true;
            } catch (error) {
                console.warn("Falha ao carregar textura do oceano:", error);
                textureReady = false;
            }
            return textureReady;
        }

        function applyVisualState() {
            canvas.hidden = !config.enabled;
            const clip = polygonCss(config.area);
            canvas.style.clipPath = clip;
            canvas.style.webkitClipPath = clip;
        }

        function shipPosition() {
            if (!config.shipWake) return { x: -1, y: -1 };
            const ship = stage.querySelector('[data-tq-semantic-type="ship"]')
                || stage.querySelector(".region-ruby-shop-button:not(.is-locked)");
            if (!(ship instanceof Element)) return { x: -1, y: -1 };
            const oceanRect = canvasHost.getBoundingClientRect();
            const shipRect = ship.getBoundingClientRect();
            if (!oceanRect.width || !oceanRect.height || !shipRect.width || !shipRect.height) {
                return { x: -1, y: -1 };
            }
            return {
                x: clamp((shipRect.left + shipRect.width * 0.5 - oceanRect.left) / oceanRect.width, 0, 1),
                y: clamp(1 - ((shipRect.top + shipRect.height * 0.68 - oceanRect.top) / oceanRect.height), 0, 1)
            };
        }

        function draw(now) {
            raf = 0;
            if (destroyed || !canvas.isConnected || !config.enabled) return;
            if (!textureReady && !uploadTexture()) return;

            resize();
            if (!startedAt) startedAt = now;
            const seconds = (now - startedAt) / 1000;
            const rippleAge = rippleStartedAt < 0 ? -1 : (now - rippleStartedAt) / 1000;
            const ship = shipPosition();
            const tint = presetTint();

            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniforms.texture, 0);
            gl.uniform1f(uniforms.time, seconds);
            gl.uniform1f(uniforms.movement, config.movement / 100);
            gl.uniform1f(uniforms.speed, config.speed / 100);
            gl.uniform1f(uniforms.shine, config.shine / 100);
            gl.uniform1f(uniforms.foam, config.foam / 100);
            gl.uniform3f(uniforms.tint, tint[0], tint[1], tint[2]);
            gl.uniform2f(uniforms.ripple, ripplePoint.x, ripplePoint.y);
            gl.uniform1f(uniforms.rippleAge, config.ripples ? rippleAge : -1);
            gl.uniform2f(uniforms.ship, ship.x, ship.y);
            gl.uniform1f(uniforms.shipWake, config.shipWake ? 1 : 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            if (!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
                raf = root.requestAnimationFrame(draw);
            }
        }

        function start() {
            if (destroyed || !config.enabled || raf) return;
            applyVisualState();
            if (!textureReady && !uploadTexture()) return;
            raf = root.requestAnimationFrame(draw);
        }

        function stop() {
            if (raf) root.cancelAnimationFrame(raf);
            raf = 0;
        }

        function addRipple(point) {
            if (!config.enabled || !config.ripples || !pointInPolygon(point, config.area)) return;
            ripplePoint = {
                x: clamp(point.x, 0, 1),
                y: clamp(1 - point.y, 0, 1)
            };
            rippleStartedAt = root.performance?.now?.() || Date.now();
            start();
        }

        function onPointerDown(event) {
            if (!config.enabled || !config.ripples) return;
            const rect = canvasHost.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            if (
                event.clientX < rect.left || event.clientX > rect.right
                || event.clientY < rect.top || event.clientY > rect.bottom
            ) return;
            const point = {
                x: (event.clientX - rect.left) / rect.width,
                y: (event.clientY - rect.top) / rect.height
            };
            addRipple(point);
        }

        function update(nextConfig) {
            const wasEnabled = config.enabled;
            config = normalizeConfig(nextConfig, regionId);
            applyVisualState();
            resize();
            if (!wasEnabled && config.enabled) startedAt = 0;
            if (config.enabled) start();
            else stop();
            return clone(config);
        }

        function destroy() {
            destroyed = true;
            stop();
            stage.removeEventListener("pointerdown", onPointerDown, true);
            source.removeEventListener("load", onSourceLoad);
            root.removeEventListener("resize", resize);
            gl.deleteTexture(texture);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            canvas.remove();
        }

        function onSourceLoad() {
            textureReady = false;
            uploadTexture();
            start();
        }

        stage.addEventListener("pointerdown", onPointerDown, true);
        source.addEventListener("load", onSourceLoad);
        root.addEventListener("resize", resize);
        applyVisualState();
        resize();
        if (source.complete && source.naturalWidth) uploadTexture();
        if (config.enabled) start();

        return {
            webgl: true,
            reason: "",
            getConfig: () => clone(config),
            update,
            addRipple,
            destroy
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.oceanScene = Object.freeze({
        STORAGE_KEY,
        PRESETS,
        PUBLISHED_CONFIGS,
        defaultConfig,
        normalizeConfig,
        readConfig,
        saveConfig,
        clearConfig,
        applyPreset,
        pointInPolygon,
        mount
    });
})(globalThis);
