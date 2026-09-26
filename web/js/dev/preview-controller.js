(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    TQ.dev = TQ.dev || {};

    const STORAGE_KEY = "tq2.dev.preview-profile.v2";
    const CHILD_PARAM = "tq_simulator_child";
    const DEFAULT_PROFILE_ID = "br-412x915";

    function profile(spec) {
        return Object.freeze({
            type: "mobile",
            category: "mobile",
            dpr: 1,
            radius: 24,
            source: "",
            ...spec
        });
    }

    /*
     * Mobile presets deliberately mix two useful concepts:
     * 1) the most common CSS screen-size families measured in Brazil;
     * 2) named reference devices with official/documented logical dimensions.
     *
     * The iframe is resized to these logical dimensions, so CSS media queries
     * and JS window.innerWidth/innerHeight inside the app react to the selected
     * profile instead of the desktop browser that hosts the simulator.
     */
    const PROFILES = Object.freeze({
        "br-414x896": profile({
            id: "br-414x896",
            label: "BR popular · 414 × 896",
            group: "Brasil · mais usadas",
            width: 414,
            height: 896,
            dpr: 2,
            radius: 28,
            source: "Statcounter Brasil · ago/2026 · 11,62%"
        }),
        "br-412x915": profile({
            id: "br-412x915",
            label: "BR popular · 412 × 915",
            group: "Brasil · mais usadas",
            width: 412,
            height: 915,
            dpr: 2.625,
            radius: 26,
            source: "Statcounter Brasil · ago/2026 · 7,36%"
        }),
        "br-384x832": profile({
            id: "br-384x832",
            label: "BR popular · 384 × 832",
            group: "Brasil · mais usadas",
            width: 384,
            height: 832,
            dpr: 2.8,
            radius: 25,
            source: "Statcounter Brasil · ago/2026 · 7,25%"
        }),
        "br-393x873": profile({
            id: "br-393x873",
            label: "BR popular · 393 × 873",
            group: "Brasil · mais usadas",
            width: 393,
            height: 873,
            dpr: 3,
            radius: 27,
            source: "Statcounter Brasil · ago/2026 · 6,34%"
        }),
        "br-390x844": profile({
            id: "br-390x844",
            label: "BR popular · 390 × 844",
            group: "Brasil · mais usadas",
            width: 390,
            height: 844,
            dpr: 3,
            radius: 27,
            source: "Statcounter Brasil · ago/2026 · 6,15%"
        }),
        "br-432x960": profile({
            id: "br-432x960",
            label: "BR popular · 432 × 960",
            group: "Brasil · mais usadas",
            width: 432,
            height: 960,
            dpr: 2.5,
            radius: 28,
            source: "Statcounter Brasil · ago/2026 · 5,53%"
        }),

        "iphone-16-15": profile({
            id: "iphone-16-15",
            label: "iPhone 16 / 15 · 393 × 852",
            group: "iPhone",
            width: 393,
            height: 852,
            dpr: 3,
            radius: 34,
            source: "Apple HIG"
        }),
        "iphone-16-pro": profile({
            id: "iphone-16-pro",
            label: "iPhone 16 Pro / 17 · 402 × 874",
            group: "iPhone",
            width: 402,
            height: 874,
            dpr: 3,
            radius: 34,
            source: "Apple HIG"
        }),
        "iphone-15-pro-max": profile({
            id: "iphone-15-pro-max",
            label: "iPhone 15 Pro Max · 430 × 932",
            group: "iPhone",
            width: 430,
            height: 932,
            dpr: 3,
            radius: 36,
            source: "Apple HIG"
        }),
        "iphone-16-pro-max": profile({
            id: "iphone-16-pro-max",
            label: "iPhone 16 Pro Max · 440 × 956",
            group: "iPhone",
            width: 440,
            height: 956,
            dpr: 3,
            radius: 38,
            source: "Apple HIG"
        }),
        "iphone-13-14": profile({
            id: "iphone-13-14",
            label: "iPhone 13 / 14 · 390 × 844",
            group: "iPhone",
            width: 390,
            height: 844,
            dpr: 3,
            radius: 32,
            source: "Apple HIG"
        }),
        "iphone-11-xr": profile({
            id: "iphone-11-xr",
            label: "iPhone 11 / XR · 414 × 896",
            group: "iPhone",
            width: 414,
            height: 896,
            dpr: 2,
            radius: 31,
            source: "Apple HIG"
        }),

        "galaxy-a15-a16": profile({
            id: "galaxy-a15-a16",
            label: "Galaxy A15 / A16 · 412 × 893",
            group: "Android de referência",
            width: 412,
            height: 892.6667,
            dpr: 2.621,
            radius: 24,
            source: "Preset histórico medido no projeto"
        }),
        "galaxy-s24": profile({
            id: "galaxy-s24",
            label: "Galaxy S24 · ~360 × 800",
            group: "Android de referência",
            width: 360,
            height: 800,
            dpr: 3,
            radius: 27,
            source: "BrowserStack"
        }),
        "galaxy-s24-ultra": profile({
            id: "galaxy-s24-ultra",
            label: "Galaxy S24 Ultra · ~390 × 850",
            group: "Android de referência",
            width: 390,
            height: 850,
            dpr: 3.75,
            radius: 22,
            source: "BrowserStack"
        }),
        "android-common-360x800": profile({
            id: "android-common-360x800",
            label: "Android comum · 360 × 800",
            group: "Android de referência",
            width: 360,
            height: 800,
            dpr: 2.5,
            radius: 24,
            source: "BrowserStack · resolução móvel comum"
        }),

        "small-320x568": profile({
            id: "small-320x568",
            label: "Stress pequeno · 320 × 568",
            group: "Stress responsivo",
            width: 320,
            height: 568,
            dpr: 2,
            radius: 20,
            source: "BrowserStack · small mobile"
        }),
        "small-360x640": profile({
            id: "small-360x640",
            label: "Stress compacto · 360 × 640",
            group: "Stress responsivo",
            width: 360,
            height: 640,
            dpr: 2,
            radius: 22,
            source: "BrowserStack · mobile"
        }),

        "tablet-768x1024": Object.freeze({
            id: "tablet-768x1024",
            label: "Tablet · 768 × 1024",
            group: "Outras telas",
            type: "tablet",
            category: "tablet",
            width: 768,
            height: 1024,
            dpr: 2,
            radius: 18,
            source: "BrowserStack"
        }),
        "desktop-1366x768": Object.freeze({
            id: "desktop-1366x768",
            label: "Desktop · 1366 × 768",
            group: "Outras telas",
            type: "desktop",
            category: "desktop",
            width: 1366,
            height: 768,
            dpr: 1,
            radius: 2,
            source: "BrowserStack"
        }),
        "desktop-1920x1080": Object.freeze({
            id: "desktop-1920x1080",
            label: "Desktop · 1920 × 1080",
            group: "Outras telas",
            type: "desktop",
            category: "desktop",
            width: 1920,
            height: 1080,
            dpr: 1,
            radius: 2,
            source: "BrowserStack"
        })
    });

    let activeCleanup = null;
    let hostMode = false;
    let currentProfile = null;
    let currentOrientation = "portrait";
    let simulatorRefs = null;

    function isNativeRuntime() {
        return document.documentElement.classList.contains("tq-native-runtime");
    }

    function isPwaRuntime() {
        return document.documentElement.classList.contains("tq-pwa-runtime");
    }

    function isChildRuntime() {
        try {
            return new URL(root.location.href).searchParams.get(CHILD_PARAM) === "1";
        } catch (_) {
            return false;
        }
    }

    function canHostSimulator() {
        // Desktop browser AND desktop-installed PWA may host the simulator.
        // A narrow mobile PWA is already the real target viewport and should
        // render the game directly instead of nesting a simulator.
        return !isNativeRuntime()
            && !isChildRuntime()
            && root.matchMedia?.("(min-width: 700px)")?.matches;
    }

    function normalizeCustom(raw) {
        const width = Math.max(240, Math.min(2560, Number(raw?.width) || 412));
        const height = Math.max(320, Math.min(2560, Number(raw?.height) || 915));
        return Object.freeze({
            id: "custom",
            label: "Custom",
            group: "Custom",
            type: width > height ? "desktop" : "mobile",
            category: "custom",
            width,
            height,
            dpr: Math.max(1, Math.min(4, Number(raw?.dpr) || 1)),
            radius: width > height ? 4 : 24,
            source: "Definido manualmente"
        });
    }

    function oriented(profileValue, orientation = currentOrientation) {
        const profile = profileValue || PROFILES[DEFAULT_PROFILE_ID];
        const landscape = orientation === "landscape";
        const alreadyLandscape = profile.width > profile.height;
        const shouldSwap = landscape !== alreadyLandscape;
        return Object.freeze({
            ...profile,
            width: shouldSwap ? profile.height : profile.width,
            height: shouldSwap ? profile.width : profile.height,
            orientation: landscape ? "landscape" : "portrait"
        });
    }

    function readSavedProfile() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            const orientation = parsed.orientation === "landscape" ? "landscape" : "portrait";
            currentOrientation = orientation;
            if (parsed.id === "custom") {
                return normalizeCustom(parsed);
            }
            return PROFILES[parsed.id] || PROFILES[DEFAULT_PROFILE_ID];
        } catch (_) {
            currentOrientation = "portrait";
            return PROFILES[DEFAULT_PROFILE_ID];
        }
    }

    function writeSavedProfile(profileValue) {
        try {
            root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                id: profileValue.id,
                width: profileValue.width,
                height: profileValue.height,
                dpr: profileValue.dpr,
                orientation: currentOrientation
            }));
        } catch (_) {}
    }

    function computePreviewFit(profileValue, viewportWidth, viewportHeight) {
        // Keep the original DEV scale contract so existing tooling/tests remain
        // stable. Only the iframe viewport changed; logical dimensions are still
        // scaled uniformly to fit inside the host browser.
        const horizontalPadding = 32;
        const verticalPadding = 86;
        const availableWidth = Math.max(1, viewportWidth - horizontalPadding);
        const availableHeight = Math.max(1, viewportHeight - verticalPadding);
        const scale = Math.min(
            1,
            availableWidth / profileValue.width,
            availableHeight / profileValue.height
        );

        return Object.freeze({
            scale,
            renderWidth: profileValue.width * scale,
            renderHeight: profileValue.height * scale,
            aspectRatio: profileValue.width / profileValue.height
        });
    }

    function childUrl() {
        const url = new URL(root.location.href);
        url.searchParams.set(CHILD_PARAM, "1");
        return url.href;
    }

    function groupedProfileOptions() {
        const groups = new Map();
        Object.values(PROFILES).forEach((item) => {
            if (!groups.has(item.group)) groups.set(item.group, []);
            groups.get(item.group).push(item);
        });

        return [...groups.entries()].map(([label, items]) =>
            '<optgroup label="' + label + '">'
            + items.map((item) =>
                '<option value="' + item.id + '">' + item.label + '</option>'
            ).join("")
            + '</optgroup>'
        ).join("");
    }

    function applyProfile(profileValue) {
        currentProfile = profileValue || currentProfile || PROFILES[DEFAULT_PROFILE_ID];
        const logical = oriented(currentProfile);
        const viewportWidth = root.innerWidth || logical.width;
        const viewportHeight = root.innerHeight || logical.height;
        const fit = computePreviewFit(logical, viewportWidth, viewportHeight);

        document.documentElement.dataset.tqPreviewProfile = currentProfile.id;
        document.documentElement.dataset.tqPreviewOrientation = currentOrientation;
        document.documentElement.style.setProperty("--tq-preview-panel-width", logical.width + "px");
        document.documentElement.style.setProperty("--tq-preview-panel-height", logical.height + "px");
        document.documentElement.style.setProperty("--tq-preview-scale", String(fit.scale));
        document.documentElement.style.setProperty("--tq-preview-radius", logical.radius + "px");

        if (simulatorRefs) {
            const { shell, frame, iframe, metrics, source, rotate } = simulatorRefs;
            const bezel = 18;
            shell.style.width = (fit.renderWidth + bezel * fit.scale) + "px";
            shell.style.height = (fit.renderHeight + bezel * fit.scale) + "px";
            frame.style.width = logical.width + "px";
            frame.style.height = logical.height + "px";
            frame.style.borderRadius = logical.radius + "px";
            iframe.style.width = logical.width + "px";
            iframe.style.height = logical.height + "px";
            metrics.textContent = logical.width + " × " + logical.height
                + " · " + Math.round(fit.scale * 100) + "%"
                + " · DPR ref. " + logical.dpr;
            source.textContent = logical.source || "";
            rotate.textContent = currentOrientation === "portrait"
                ? "↻ Paisagem"
                : "↺ Retrato";
            rotate.setAttribute(
                "aria-label",
                currentOrientation === "portrait"
                    ? "Simular orientação paisagem"
                    : "Simular orientação retrato"
            );
        }

        root.dispatchEvent(new CustomEvent("tq:dev-preview-changed", {
            detail: {
                profile: logical,
                fit,
                appWidth: logical.width,
                appHeight: logical.height,
                exactViewport: true
            }
        }));

        return { profile: logical, fit, appHeight: logical.height };
    }

    function clearProfile() {
        hostMode = false;
        document.documentElement.classList.remove("tq-dev-preview-active");
        document.documentElement.classList.remove("tq-dev-simulator-host");
        delete document.documentElement.dataset.tqPreviewProfile;
        delete document.documentElement.dataset.tqPreviewOrientation;
        [
            "--tq-preview-panel-width",
            "--tq-preview-panel-height",
            "--tq-preview-scale",
            "--tq-preview-radius"
        ].forEach((property) => document.documentElement.style.removeProperty(property));
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;
        simulatorRefs = null;

        const enabled = options.enabled !== false;

        if (!enabled || isNativeRuntime()) {
            clearProfile();
            return () => {};
        }

        if (isChildRuntime()) {
            hostMode = false;
            document.documentElement.classList.add("tq-dev-simulator-child");
            document.documentElement.classList.remove("tq-dev-simulator-host");
            return () => {
                document.documentElement.classList.remove("tq-dev-simulator-child");
            };
        }

        if (!canHostSimulator()) {
            clearProfile();
            return () => {};
        }

        hostMode = true;
        document.documentElement.classList.add("tq-dev-preview-active");
        document.documentElement.classList.add("tq-dev-simulator-host");

        currentProfile = readSavedProfile();

        const host = document.createElement("aside");
        host.className = "tq-preview-dev";
        host.innerHTML = `
            <div class="tq-preview-dev-toolbar">
                <strong>SIMULADOR</strong>
                <select data-preview-profile aria-label="Tela simulada">
                    ${groupedProfileOptions()}
                    <option value="custom">Custom</option>
                </select>
                <button type="button" data-preview-rotate>↻ Paisagem</button>
                <label data-preview-custom hidden>
                    <input type="number" min="240" max="2560" step="1" data-preview-width aria-label="Largura lógica">
                    <span>×</span>
                    <input type="number" min="320" max="2560" step="1" data-preview-height aria-label="Altura lógica">
                </label>
                <small data-preview-metrics></small>
                <small class="tq-preview-dev-source" data-preview-source></small>
            </div>
            <div class="tq-preview-simulator-stage" data-preview-stage>
                <div class="tq-preview-device-scale" data-preview-shell>
                    <div class="tq-preview-device-frame" data-preview-frame>
                        <iframe
                            data-preview-iframe
                            title="Tabuada Quest · viewport simulado"
                            src="${childUrl()}"
                            loading="eager"></iframe>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(host);

        const select = host.querySelector("[data-preview-profile]");
        const custom = host.querySelector("[data-preview-custom]");
        const widthInput = host.querySelector("[data-preview-width]");
        const heightInput = host.querySelector("[data-preview-height]");
        const rotate = host.querySelector("[data-preview-rotate]");
        const metrics = host.querySelector("[data-preview-metrics]");
        const source = host.querySelector("[data-preview-source]");
        const shell = host.querySelector("[data-preview-shell]");
        const frame = host.querySelector("[data-preview-frame]");
        const iframe = host.querySelector("[data-preview-iframe]");

        simulatorRefs = { host, select, custom, widthInput, heightInput, rotate, metrics, source, shell, frame, iframe };

        function syncUi() {
            select.value = currentProfile.id;
            custom.hidden = currentProfile.id !== "custom";
            widthInput.value = Math.round(currentProfile.width);
            heightInput.value = Math.round(currentProfile.height);
            applyProfile(currentProfile);
        }

        function chooseProfile(id) {
            if (id === "custom") {
                currentProfile = normalizeCustom({
                    width: widthInput.value || currentProfile.width,
                    height: heightInput.value || currentProfile.height,
                    dpr: currentProfile.dpr
                });
            } else {
                currentProfile = PROFILES[id] || PROFILES[DEFAULT_PROFILE_ID];
            }
            writeSavedProfile(currentProfile);
            syncUi();
        }

        function applyCustom() {
            currentProfile = normalizeCustom({
                width: widthInput.value,
                height: heightInput.value,
                dpr: currentProfile.dpr
            });
            writeSavedProfile(currentProfile);
            syncUi();
        }

        function toggleOrientation() {
            currentOrientation = currentOrientation === "portrait"
                ? "landscape"
                : "portrait";
            writeSavedProfile(currentProfile);
            applyProfile(currentProfile);
        }

        function onResize() {
            applyProfile(currentProfile);
        }

        select.addEventListener("change", () => chooseProfile(select.value));
        widthInput.addEventListener("change", applyCustom);
        heightInput.addEventListener("change", applyCustom);
        rotate.addEventListener("click", toggleOrientation);
        root.addEventListener("resize", onResize, { passive: true });
        root.visualViewport?.addEventListener("resize", onResize, { passive: true });

        syncUi();

        activeCleanup = () => {
            root.removeEventListener("resize", onResize);
            root.visualViewport?.removeEventListener("resize", onResize);
            host.remove();
            simulatorRefs = null;
            clearProfile();
        };
        return activeCleanup;
    }

    TQ.dev.previewController = Object.freeze({
        PROFILES,
        DEFAULT_PROFILE_ID,
        computePreviewFit,
        normalizeCustom,
        mount,
        applyProfile,
        clearProfile,
        isHostMode: () => hostMode,
        isChildRuntime,
        isNativeRuntime,
        isPwaRuntime
    });
})(globalThis);
