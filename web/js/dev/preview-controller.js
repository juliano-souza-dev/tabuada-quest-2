(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    TQ.dev = TQ.dev || {};

    const STORAGE_KEY = "tq2.dev.preview-profile.v1";

    const PROFILES = Object.freeze({
        "galaxy-a15-a16": Object.freeze({
            id: "galaxy-a15-a16",
            label: "Galaxy A15 / A16",
            type: "mobile",
            width: 412,
            height: 892.6667,
            statusHeight: 24,
            navigationHeight: 24,
            dpr: 2.621,
            radius: 24
        }),
        "desktop-1280x720": Object.freeze({
            id: "desktop-1280x720",
            label: "Desktop 1280 × 720",
            type: "desktop",
            width: 1280,
            height: 720,
            statusHeight: 0,
            navigationHeight: 0,
            dpr: 1,
            radius: 0
        }),
        "desktop-1366x768": Object.freeze({
            id: "desktop-1366x768",
            label: "Desktop 1366 × 768",
            type: "desktop",
            width: 1366,
            height: 768,
            statusHeight: 0,
            navigationHeight: 0,
            dpr: 1,
            radius: 0
        }),
        "desktop-1536x864": Object.freeze({
            id: "desktop-1536x864",
            label: "Desktop 1536 × 864",
            type: "desktop",
            width: 1536,
            height: 864,
            statusHeight: 0,
            navigationHeight: 0,
            dpr: 1,
            radius: 0
        }),
        "desktop-1920x1080": Object.freeze({
            id: "desktop-1920x1080",
            label: "Desktop 1920 × 1080",
            type: "desktop",
            width: 1920,
            height: 1080,
            statusHeight: 0,
            navigationHeight: 0,
            dpr: 1,
            radius: 0
        })
    });

    let activeCleanup = null;

    function isNativeRuntime() {
        return document.documentElement.classList.contains("tq-native-runtime")
            || document.documentElement.classList.contains("tq-pwa-runtime");
    }

    function normalizeCustom(raw) {
        const width = Math.max(240, Math.min(3840, Number(raw?.width) || 412));
        const height = Math.max(320, Math.min(2160, Number(raw?.height) || 892.6667));
        return Object.freeze({
            id: "custom",
            label: "Custom",
            type: width > height ? "desktop" : "mobile",
            width,
            height,
            statusHeight: 0,
            navigationHeight: 0,
            dpr: 1,
            radius: width > height ? 0 : 20
        });
    }

    function readSavedProfile() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            if (parsed.id === "custom") return normalizeCustom(parsed);
            return PROFILES[parsed.id] || PROFILES["galaxy-a15-a16"];
        } catch (_) {
            return PROFILES["galaxy-a15-a16"];
        }
    }

    function writeSavedProfile(profile) {
        try {
            root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                id: profile.id,
                width: profile.width,
                height: profile.height
            }));
        } catch (_) {}
    }

    function computePreviewFit(profile, viewportWidth, viewportHeight) {
        const horizontalPadding = 32;
        const verticalPadding = 86;
        const availableWidth = Math.max(1, viewportWidth - horizontalPadding);
        const availableHeight = Math.max(1, viewportHeight - verticalPadding);
        const scale = Math.min(
            1,
            availableWidth / profile.width,
            availableHeight / profile.height
        );

        return Object.freeze({
            scale,
            renderWidth: profile.width * scale,
            renderHeight: profile.height * scale,
            aspectRatio: profile.width / profile.height
        });
    }

    function applyProfile(profile) {
        const stage = document.querySelector(".app-stage");
        const viewport = document.querySelector(".app-viewport");
        if (!(stage instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;

        const visualViewport = root.visualViewport;
        const browserWidth = visualViewport?.width || root.innerWidth || profile.width;
        const browserHeight = visualViewport?.height || root.innerHeight || profile.height;
        const fit = computePreviewFit(profile, browserWidth, browserHeight);

        const appHeight = Math.max(
            1,
            profile.height - profile.statusHeight - profile.navigationHeight
        );

        document.documentElement.classList.add("tq-dev-preview-active");
        document.documentElement.dataset.tqPreviewProfile = profile.id;
        document.documentElement.style.setProperty("--tq-preview-panel-width", profile.width + "px");
        document.documentElement.style.setProperty("--tq-preview-panel-height", profile.height + "px");
        document.documentElement.style.setProperty("--tq-preview-app-width", profile.width + "px");
        document.documentElement.style.setProperty("--tq-preview-app-height", appHeight + "px");
        document.documentElement.style.setProperty("--tq-preview-status-height", profile.statusHeight + "px");
        document.documentElement.style.setProperty("--tq-preview-navigation-height", profile.navigationHeight + "px");
        document.documentElement.style.setProperty("--tq-preview-scale", String(fit.scale));
        document.documentElement.style.setProperty("--tq-preview-radius", profile.radius + "px");
        document.documentElement.style.setProperty("--tq-preview-dpr", String(profile.dpr || 1));

        stage.dataset.tqPreviewWidth = String(profile.width);
        stage.dataset.tqPreviewHeight = String(profile.height);
        stage.dataset.tqPreviewScale = String(fit.scale);
        stage.dataset.tqPreviewAspect = String(fit.aspectRatio);
        viewport.dataset.tqPreviewLogicalWidth = String(profile.width);
        viewport.dataset.tqPreviewLogicalHeight = String(appHeight);

        root.dispatchEvent(new CustomEvent("tq:dev-preview-changed", {
            detail: {
                profile,
                fit,
                appWidth: profile.width,
                appHeight
            }
        }));

        return { profile, fit, appHeight };
    }

    function clearProfile() {
        document.documentElement.classList.remove("tq-dev-preview-active");
        delete document.documentElement.dataset.tqPreviewProfile;
        [
            "--tq-preview-panel-width",
            "--tq-preview-panel-height",
            "--tq-preview-app-width",
            "--tq-preview-app-height",
            "--tq-preview-status-height",
            "--tq-preview-navigation-height",
            "--tq-preview-scale",
            "--tq-preview-radius",
            "--tq-preview-dpr"
        ].forEach((property) => document.documentElement.style.removeProperty(property));
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        if (isNativeRuntime()) {
            clearProfile();
            return () => {};
        }

        const enabled = options.enabled !== false;
        if (!enabled) {
            clearProfile();
            return () => {};
        }

        let profile = readSavedProfile();
        const host = document.createElement("aside");
        host.className = "tq-preview-dev";
        host.innerHTML = `
            <strong>PREVIEW</strong>
            <select data-preview-profile aria-label="Dispositivo de preview">
                ${Object.values(PROFILES).map((item) =>
                    '<option value="' + item.id + '">' + item.label + '</option>'
                ).join("")}
                <option value="custom">Custom</option>
            </select>
            <label data-preview-custom hidden>
                <input type="number" min="240" max="3840" step="1" data-preview-width aria-label="Largura lógica">
                <span>×</span>
                <input type="number" min="320" max="2160" step="1" data-preview-height aria-label="Altura lógica">
            </label>
            <small data-preview-metrics></small>
        `;
        document.body.appendChild(host);

        const select = host.querySelector("[data-preview-profile]");
        const custom = host.querySelector("[data-preview-custom]");
        const widthInput = host.querySelector("[data-preview-width]");
        const heightInput = host.querySelector("[data-preview-height]");
        const metrics = host.querySelector("[data-preview-metrics]");

        function syncUi() {
            select.value = profile.id;
            custom.hidden = profile.id !== "custom";
            widthInput.value = Math.round(profile.width);
            heightInput.value = Math.round(profile.height * 100) / 100;
            const applied = applyProfile(profile);
            metrics.textContent = applied
                ? Math.round(profile.width) + " × " + Math.round(profile.height * 100) / 100
                    + " · " + Math.round(applied.fit.scale * 100) + "%"
                : "";
        }

        function chooseProfile(id) {
            if (id === "custom") {
                profile = normalizeCustom({
                    width: widthInput.value || profile.width,
                    height: heightInput.value || profile.height
                });
            } else {
                profile = PROFILES[id] || PROFILES["galaxy-a15-a16"];
            }
            writeSavedProfile(profile);
            syncUi();
        }

        function applyCustom() {
            profile = normalizeCustom({
                width: widthInput.value,
                height: heightInput.value
            });
            writeSavedProfile(profile);
            syncUi();
        }

        function onResize() {
            applyProfile(profile);
            const stage = document.querySelector(".app-stage");
            const scale = Number(stage?.dataset?.tqPreviewScale || 1);
            metrics.textContent = Math.round(profile.width) + " × " + Math.round(profile.height * 100) / 100
                + " · " + Math.round(scale * 100) + "%";
        }

        select.addEventListener("change", () => chooseProfile(select.value));
        widthInput.addEventListener("change", applyCustom);
        heightInput.addEventListener("change", applyCustom);
        root.addEventListener("resize", onResize, { passive: true });
        root.visualViewport?.addEventListener("resize", onResize, { passive: true });

        syncUi();

        activeCleanup = () => {
            root.removeEventListener("resize", onResize);
            root.visualViewport?.removeEventListener("resize", onResize);
            host.remove();
            clearProfile();
        };
        return activeCleanup;
    }

    TQ.dev.previewController = Object.freeze({
        PROFILES,
        computePreviewFit,
        mount,
        applyProfile,
        clearProfile
    });
})(globalThis);
