(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const CANONICAL_VIEWPORT = Object.freeze({ width: 941, height: 1672 });

    function computeFit(viewportWidth, viewportHeight, designWidth = 941, designHeight = 1672) {
        const width = Math.max(0, Number(viewportWidth) || 0);
        const height = Math.max(0, Number(viewportHeight) || 0);
        const sourceWidth = Math.max(1, Number(designWidth) || CANONICAL_VIEWPORT.width);
        const sourceHeight = Math.max(1, Number(designHeight) || CANONICAL_VIEWPORT.height);

        if (width === 0 || height === 0) {
            return Object.freeze({
                scale: 0,
                renderWidth: 0,
                renderHeight: 0,
                offsetX: 0,
                offsetY: 0
            });
        }

        const scale = Math.min(width / sourceWidth, height / sourceHeight);
        const renderWidth = sourceWidth * scale;
        const renderHeight = sourceHeight * scale;

        return Object.freeze({
            scale,
            renderWidth,
            renderHeight,
            offsetX: (width - renderWidth) / 2,
            offsetY: (height - renderHeight) / 2
        });
    }

    function bindCanonicalStage(safeArea, stage, options = {}) {
        if (!safeArea || !stage) return () => {};

        const designWidth = Number(options.designWidth) || CANONICAL_VIEWPORT.width;
        const designHeight = Number(options.designHeight) || CANONICAL_VIEWPORT.height;
        const mode = options.mode === "scale" ? "scale" : "size";
        let observer = null;
        let disposed = false;

        function apply() {
            if (disposed) return;
            if (!safeArea.isConnected) return;

            const geometry = computeFit(
                safeArea.clientWidth,
                safeArea.clientHeight,
                designWidth,
                designHeight
            );

            if (!geometry.scale) return;

            stage.style.left = geometry.offsetX + "px";
            stage.style.top = geometry.offsetY + "px";
            stage.dataset.safeViewportScale = String(geometry.scale);

            if (mode === "scale") {
                stage.style.width = designWidth + "px";
                stage.style.height = designHeight + "px";
                stage.style.transformOrigin = "0 0";
                stage.style.transform = "scale(" + geometry.scale + ")";
            } else {
                stage.style.width = geometry.renderWidth + "px";
                stage.style.height = geometry.renderHeight + "px";
                stage.style.transform = "none";
            }
        }

        if (typeof root.ResizeObserver === "function") {
            observer = new root.ResizeObserver(() => {
                if (!safeArea.isConnected) {
                    observer.disconnect();
                    observer = null;
                    return;
                }
                apply();
            });
            observer.observe(safeArea);
        } else if (typeof root.addEventListener === "function") {
            root.addEventListener("resize", apply, { passive: true });
        }

        if (typeof root.requestAnimationFrame === "function") {
            root.requestAnimationFrame(apply);
        } else {
            root.setTimeout?.(apply, 0);
        }

        return () => {
            disposed = true;
            if (observer) observer.disconnect();
            if (typeof root.removeEventListener === "function") {
                root.removeEventListener("resize", apply);
            }
        };
    }

    TQ.core = TQ.core || {};
    TQ.core.safeViewport = Object.freeze({
        CANONICAL_VIEWPORT,
        computeFit,
        bindCanonicalStage
    });
})(globalThis);
