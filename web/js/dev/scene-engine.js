(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    TQ.dev = TQ.dev || {};

    const geometryTargetCache = new WeakMap();

    function number(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function positive(value, fallback = 1) {
        const parsed = number(value, fallback);
        return parsed > 0 ? parsed : fallback;
    }

    function computedGeometry(element) {
        if (!(element instanceof Element)) {
            return { x: 0, y: 0, sx: 1, sy: 1 };
        }

        const style = root.getComputedStyle(element);
        const translate = String(style.translate || "").trim();
        const scale = String(style.scale || "").trim();

        let x = 0;
        let y = 0;
        if (translate && translate !== "none") {
            const parts = translate.split(/\s+/);
            const parsedX = Number.parseFloat(parts[0]);
            const parsedY = Number.parseFloat(parts[1] || "0");
            if (Number.isFinite(parsedX)) x = parsedX;
            if (Number.isFinite(parsedY)) y = parsedY;
        }

        let sx = 1;
        let sy = 1;
        if (scale && scale !== "none") {
            const parts = scale.split(/\s+/);
            sx = positive(parts[0], 1);
            sy = positive(parts[1], sx);
        }

        return { x, y, sx, sy };
    }

    function readGeometry(element) {
        if (!(element instanceof Element)) {
            return { x: 0, y: 0, sx: 1, sy: 1 };
        }

        if (!element.hasAttribute("data-tq-dev-adjusted")) {
            return computedGeometry(element);
        }

        const x = Number.parseFloat(element.style.getPropertyValue("--tq-dev-x"));
        const y = Number.parseFloat(element.style.getPropertyValue("--tq-dev-y"));
        return {
            x: Number.isFinite(x) ? x : 0,
            y: Number.isFinite(y) ? y : 0,
            sx: Math.max(.05, positive(element.style.getPropertyValue("--tq-dev-sx"), 1)),
            sy: Math.max(.05, positive(element.style.getPropertyValue("--tq-dev-sy"), 1))
        };
    }

    function applyGeometry(element, geometry) {
        if (!(element instanceof Element)) return false;

        const x = number(geometry?.x, 0);
        const y = number(geometry?.y, 0);
        const sx = Math.max(.05, positive(geometry?.sx, 1));
        const sy = Math.max(.05, positive(geometry?.sy, 1));

        element.style.setProperty("--tq-dev-x", x + "px");
        element.style.setProperty("--tq-dev-y", y + "px");
        element.style.setProperty("--tq-dev-sx", String(sx));
        element.style.setProperty("--tq-dev-sy", String(sy));
        element.setAttribute("data-tq-dev-adjusted", "true");
        return true;
    }

    function clearGeometry(element) {
        if (!(element instanceof Element)) return;
        element.style.removeProperty("--tq-dev-x");
        element.style.removeProperty("--tq-dev-y");
        element.style.removeProperty("--tq-dev-sx");
        element.style.removeProperty("--tq-dev-sy");
        element.removeAttribute("data-tq-dev-adjusted");
    }

    function isGeometryBoundary(element, screenRoot) {
        if (!(element instanceof Element)) return true;
        if (element === screenRoot) return true;
        return element.matches(
            ".tq-canonical-stage, .tq-safe-visual-area, "
            + "[data-tq-composition-screen], .tq-engine-canvas, "
            + ".tq-engine-asset-layer, .tq-engine-function-layer"
        );
    }

    function isInteractiveBoundary(element) {
        if (!(element instanceof Element)) return false;
        return element.matches(
            "button, a, input, select, textarea, [role='button'], "
            + "[data-action], [data-tq-composition-function]"
        );
    }

    function explicitGeometryTarget(element, screenRoot) {
        if (!(element instanceof Element)) return null;

        const targetId = String(element.dataset.tqGeometryTarget || "").trim();
        if (targetId) {
            const target = screenRoot?.querySelector?.(
                '[data-tq-geometry-id="' + CSS.escape(targetId) + '"]'
            );
            if (target instanceof Element) return target;
        }

        const owner = element.closest("[data-tq-geometry-owner]");
        if (owner instanceof Element && !isGeometryBoundary(owner, screenRoot)) {
            return owner;
        }

        return null;
    }

    function resolveGeometryElement(element, screenRoot) {
        if (!(element instanceof Element)) return element;

        const cached = geometryTargetCache.get(element);
        if (cached?.isConnected) return cached;

        const explicit = explicitGeometryTarget(element, screenRoot);
        if (explicit) {
            geometryTargetCache.set(element, explicit);
            return explicit;
        }

        if (element.hasAttribute("data-tq-composition-slot")) {
            geometryTargetCache.set(element, element);
            return element;
        }

        if (!element.matches("img, picture, svg, canvas, video")) {
            geometryTargetCache.set(element, element);
            return element;
        }

        const visualRect = element.getBoundingClientRect();
        if (!visualRect.width || !visualRect.height) {
            geometryTargetCache.set(element, element);
            return element;
        }

        let parent = element.parentElement;
        while (parent && !isGeometryBoundary(parent, screenRoot)) {
            if (isInteractiveBoundary(parent)) break;

            const style = root.getComputedStyle(parent);
            const rect = parent.getBoundingClientRect();
            const positioned = ["absolute", "fixed", "relative", "sticky"].includes(style.position);
            const sameVisualBox = (
                rect.width > 0
                && rect.height > 0
                && Math.abs(rect.width - visualRect.width) <= Math.max(3, rect.width * .06)
                && Math.abs(rect.height - visualRect.height) <= Math.max(3, rect.height * .06)
            );

            if (positioned && sameVisualBox) {
                geometryTargetCache.set(element, parent);
                return parent;
            }

            parent = parent.parentElement;
        }

        geometryTargetCache.set(element, element);
        return element;
    }

    function invalidateGeometryTarget(element) {
        if (element instanceof Element) geometryTargetCache.delete(element);
    }

    function resolveStage(element, screenRoot) {
        if (!(element instanceof Element)) return screenRoot || null;
        return element.closest(
            ".tq-canonical-stage, .tq-safe-visual-area, [data-tq-composition-screen], [class*='-stage']"
        ) || screenRoot || element.parentElement;
    }

    function stageCoordinateSpace(element, screenRoot) {
        const stage = resolveStage(element, screenRoot);
        if (!(stage instanceof Element)) {
            return {
                stage: null,
                scaleX: 1,
                scaleY: 1,
                clientDeltaToLocal(dx, dy) { return { x: dx, y: dy }; },
                clientPointToLocal(x, y) { return { x, y }; }
            };
        }

        const logicalWidth = Math.max(1, stage.offsetWidth || stage.clientWidth || 1);
        const logicalHeight = Math.max(1, stage.offsetHeight || stage.clientHeight || 1);
        const rect = stage.getBoundingClientRect();

        let originX = rect.left;
        let originY = rect.top;
        let axisXX = rect.width / logicalWidth;
        let axisXY = 0;
        let axisYX = 0;
        let axisYY = rect.height / logicalHeight;

        try {
            const quad = stage.getBoxQuads?.({ box: "border" })?.[0];
            if (quad) {
                originX = quad.p1.x;
                originY = quad.p1.y;
                axisXX = (quad.p2.x - quad.p1.x) / logicalWidth;
                axisXY = (quad.p2.y - quad.p1.y) / logicalWidth;
                axisYX = (quad.p4.x - quad.p1.x) / logicalHeight;
                axisYY = (quad.p4.y - quad.p1.y) / logicalHeight;
            }
        } catch (_) {}

        let determinant = axisXX * axisYY - axisXY * axisYX;
        if (Math.abs(determinant) < 1e-8) {
            axisXX = rect.width / logicalWidth || 1;
            axisXY = 0;
            axisYX = 0;
            axisYY = rect.height / logicalHeight || 1;
            determinant = axisXX * axisYY;
        }

        const inverseXX = axisYY / determinant;
        const inverseXY = -axisYX / determinant;
        const inverseYX = -axisXY / determinant;
        const inverseYY = axisXX / determinant;

        const scaleX = Math.hypot(axisXX, axisXY) || 1;
        const scaleY = Math.hypot(axisYX, axisYY) || 1;

        return {
            stage,
            rect,
            logicalWidth,
            logicalHeight,
            scaleX,
            scaleY,
            clientDeltaToLocal(dx, dy) {
                return {
                    x: inverseXX * dx + inverseXY * dy,
                    y: inverseYX * dx + inverseYY * dy
                };
            },
            clientPointToLocal(clientX, clientY) {
                const dx = clientX - originX;
                const dy = clientY - originY;
                return {
                    x: inverseXX * dx + inverseXY * dy,
                    y: inverseYX * dx + inverseYY * dy
                };
            }
        };
    }

    function pointerDistance(a, b) {
        if (!a || !b) return 0;
        return Math.hypot(Number(b.x) - Number(a.x), Number(b.y) - Number(a.y));
    }

    function pointerCenter(a, b) {
        if (!a || !b) return { x: 0, y: 0 };
        return {
            x: (Number(a.x) + Number(b.x)) / 2,
            y: (Number(a.y) + Number(b.y)) / 2
        };
    }

    function createNode(spec = {}) {
        const element = spec.element instanceof Element ? spec.element : null;
        const screenRoot = spec.screenRoot instanceof Element ? spec.screenRoot : element?.closest("section") || null;
        const geometryElement = resolveGeometryElement(element, screenRoot);

        return Object.freeze({
            id: String(spec.id || element?.dataset?.tqDevId || ""),
            kind: String(spec.kind || element?.dataset?.tqDevKind || "asset"),
            label: String(spec.label || element?.dataset?.tqDevLabel || "Asset"),
            role: String(spec.role || element?.dataset?.tqSemanticType || ""),
            action: String(spec.action || element?.dataset?.tqCompositionFunction || element?.dataset?.action || ""),
            element,
            geometryElement,
            screenRoot
        });
    }

    function hitTest(nodes, clientX, clientY, options = {}) {
        const includeFunctions = options.includeFunctions !== false;
        const list = Array.isArray(nodes) ? nodes : [];
        return list
            .filter((node) => {
                if (!node?.element?.isConnected) return false;
                if (!includeFunctions && node.kind === "function") return false;
                if (node.element.getAttribute("data-tq-dev-deleted") === "true") return false;
                if (node.element.getAttribute("data-tq-dev-hidden") === "true") return false;
                const target = node.geometryElement || resolveGeometryElement(node.element, node.screenRoot);
                const rect = target?.getBoundingClientRect?.();
                return Boolean(
                    rect
                    && rect.width > 0
                    && rect.height > 0
                    && clientX >= rect.left
                    && clientX <= rect.right
                    && clientY >= rect.top
                    && clientY <= rect.bottom
                );
            })
            .sort((a, b) => {
                const targetA = a.geometryElement || resolveGeometryElement(a.element, a.screenRoot);
                const targetB = b.geometryElement || resolveGeometryElement(b.element, b.screenRoot);
                const zA = number(root.getComputedStyle(targetA).zIndex, 0);
                const zB = number(root.getComputedStyle(targetB).zIndex, 0);
                if (zA !== zB) return zB - zA;
                const rectA = targetA.getBoundingClientRect();
                const rectB = targetB.getBoundingClientRect();
                return rectA.width * rectA.height - rectB.width * rectB.height;
            });
    }

    TQ.dev.sceneEngine = Object.freeze({
        computedGeometry,
        readGeometry,
        applyGeometry,
        clearGeometry,
        resolveGeometryElement,
        invalidateGeometryTarget,
        resolveStage,
        stageCoordinateSpace,
        pointerDistance,
        pointerCenter,
        createNode,
        hitTest
    });
})(globalThis);
