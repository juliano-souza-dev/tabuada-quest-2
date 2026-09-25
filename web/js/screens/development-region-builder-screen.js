(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const DEFAULT_ACTION_RECTS = Object.freeze([
        Object.freeze({ x: 105, y: 250, width: 220, height: 120 }),
        Object.freeze({ x: 615, y: 390, width: 220, height: 120 }),
        Object.freeze({ x: 130, y: 650, width: 220, height: 120 }),
        Object.freeze({ x: 585, y: 910, width: 220, height: 120 }),
        Object.freeze({ x: 350, y: 1220, width: 240, height: 130 })
    ]);

    const OPTIONAL_RECTS = Object.freeze({
        open_merchant: Object.freeze({ x: 645, y: 1240, width: 210, height: 110 }),
        go_home: Object.freeze({ x: 30, y: 35, width: 145, height: 78 }),
        go_back: Object.freeze({ x: 30, y: 135, width: 145, height: 78 }),
        open_world_map: Object.freeze({ x: 720, y: 35, width: 180, height: 78 })
    });

    function actionLabel(action, draft) {
        if (action.type === "open_island") {
            const island = draft.islands.find((item) => item.id === action.targetId);
            return "Acessar " + (island?.label || action.targetId);
        }
        if (action.type === "open_merchant") return "Acessar navio mercador";
        if (action.type === "go_home") return "Ir para Home";
        if (action.type === "go_back") return "Voltar";
        if (action.type === "open_world_map") return "Abrir Mapa Mundo";
        return action.type;
    }

    function baseRect(action, index) {
        if (action.type === "open_island") {
            return DEFAULT_ACTION_RECTS[index] || DEFAULT_ACTION_RECTS[0];
        }
        return OPTIONAL_RECTS[action.type] || { x: 350, y: 1450, width: 240, height: 90 };
    }

    function styleForRect(rect) {
        return [
            "left:" + rect.x + "px",
            "top:" + rect.y + "px",
            "width:" + rect.width + "px",
            "height:" + rect.height + "px"
        ].join(";");
    }

    function renderDevelopmentRegionBuilderScreen({ onExitRegionBuilder }) {
        const draft = TQ.dev?.regionBuilder?.getActiveDraft?.();

        const screen = document.createElement("section");
        screen.className = "region-builder-preview-screen";

        if (!draft) {
            screen.innerHTML = '<main class="region-builder-preview-empty"><h1>Nenhuma região em construção</h1></main>';
            return screen;
        }

        screen.dataset.tqDevScreenId = TQ.dev.regionBuilder.getEditorScreenId(draft);
        screen.dataset.regionDraftId = draft.id;
        screen.setAttribute("aria-label", "Construção visual da região " + draft.label);

        const actions = TQ.regionSchema.ensureRequiredActions(draft).screen.actions;
        let islandIndex = 0;

        const actionMarkup = actions.map((action) => {
            const rect = baseRect(action, action.type === "open_island" ? islandIndex++ : -1);
            const devId = TQ.dev.regionBuilder.actionDevId(action, draft);
            const label = actionLabel(action, draft);

            return `
                <button
                    type="button"
                    class="region-builder-function region-builder-function--${action.type}"
                    style="${styleForRect(rect)}"
                    data-tq-dev-id="${devId}"
                    data-tq-dev-kind="function"
                    data-tq-dev-role="action"
                    data-tq-dev-action="${action.type}"
                    data-tq-dev-label="${label}"
                    data-builder-action-id="${action.id}"
                    aria-label="${label}">
                    <small>FUNÇÃO</small>
                    <strong>${label}</strong>
                    ${action.targetId ? '<span>' + action.targetId + '</span>' : ""}
                </button>
            `;
        }).join("");

        screen.innerHTML = `
            <button
                type="button"
                class="region-builder-preview-exit"
                data-builder-exit
                data-tq-dev-ignore="true">
                ← REG
            </button>
            <div class="region-builder-preview-meta" data-tq-dev-ignore="true">
                <strong>${draft.label}</strong>
                <span>0 assets · ${actions.length} funções</span>
            </div>
            <div class="tq-safe-visual-area">
                <main class="region-builder-preview-stage tq-canonical-stage">
                    <div class="region-builder-preview-grid" aria-hidden="true"></div>
                    ${actionMarkup}
                </main>
            </div>
        `;

        TQ.core.safeViewport.bindCanonicalStage(
            screen.querySelector(".tq-safe-visual-area"),
            screen.querySelector(".region-builder-preview-stage"),
            { mode: "scale" }
        );

        screen.addEventListener("click", (event) => {
            if (event.target.closest("[data-builder-exit]")) {
                onExitRegionBuilder?.();
                return;
            }

            if (event.target.closest("[data-builder-action-id]")) {
                event.preventDefault();
            }
        });

        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.developmentRegionBuilder = Object.freeze({
        renderDevelopmentRegionBuilderScreen
    });
})(globalThis);
