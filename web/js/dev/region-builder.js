(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tq2.dev.region-builder.v1";
    const SCENE_LAYOUT_KEY = "tq2.dev.scene-layout.v2";
    let activeCleanup = null;
    let panelOpen = false;

    function emptyStore() {
        return { version: 1, activeId: null, drafts: [] };
    }

    function readStore() {
        try {
            const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
            if (!parsed || typeof parsed !== "object") return emptyStore();
            return {
                version: 1,
                activeId: typeof parsed.activeId === "string" ? parsed.activeId : null,
                drafts: Array.isArray(parsed.drafts) ? parsed.drafts : []
            };
        } catch (_) {
            return emptyStore();
        }
    }

    function writeStore(store) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 1,
            activeId: store.activeId || null,
            drafts: Array.isArray(store.drafts) ? store.drafts : []
        }));
    }

    function existingRegionCount() {
        return Array.isArray(TQ.content?.regions) ? TQ.content.regions.length : 0;
    }

    function nextRegionOrder(store = readStore()) {
        const currentMax = Math.max(
            existingRegionCount(),
            ...store.drafts.map((draft) => Number(draft?.order) || 0)
        );
        return currentMax + 1;
    }

    function getActiveDraft() {
        const store = readStore();
        return store.drafts.find((draft) => draft.id === store.activeId) || null;
    }

    function getEditorScreenId(draft = getActiveDraft()) {
        return draft?.id ? "region-builder." + draft.id : "region-builder.empty";
    }

    function actionDevId(action, draft = getActiveDraft()) {
        return getEditorScreenId(draft) + ".action." + String(action?.id || "action");
    }

    function getSavedSceneLayout(draft = getActiveDraft()) {
        if (!draft) return {};
        try {
            const store = JSON.parse(root.localStorage.getItem(SCENE_LAYOUT_KEY) || "{}");
            return store?.screens?.[getEditorScreenId(draft)] || {};
        } catch (_) {
            return {};
        }
    }

    function withEditorLayout(draft) {
        const region = TQ.regionSchema.ensureRequiredActions(draft);
        const layout = getSavedSceneLayout(region);
        region.screen.actions = region.screen.actions.map((action) => {
            const geometry = layout[actionDevId(action, region)];
            if (!geometry) return action;
            return {
                ...action,
                layout: {
                    x: Number(geometry.x) || 0,
                    y: Number(geometry.y) || 0,
                    sx: Number(geometry.sx) || 1,
                    sy: Number(geometry.sy) || 1,
                    ...(Number.isFinite(Number(geometry.z)) ? { z: Number(geometry.z) } : {})
                }
            };
        });
        return region;
    }

    function createDraft() {
        const store = readStore();
        const order = nextRegionOrder(store);
        const draft = TQ.regionSchema.createRegionDefinition({
            order,
            contentVersion: order,
            label: "Nova Região " + order,
            id: "nova-regiao-" + order,
            unlockAfterRegionId: order > 1 ? order - 1 : null
        });
        store.drafts.push(draft);
        store.activeId = draft.id;
        writeStore(store);
        return draft;
    }

    function updateActive(mutator) {
        const store = readStore();
        const index = store.drafts.findIndex((draft) => draft.id === store.activeId);
        if (index < 0) return null;
        const current = TQ.regionSchema.clone(store.drafts[index]);
        const next = mutator(current) || current;
        store.drafts[index] = next;
        store.activeId = next.id;
        writeStore(store);
        return next;
    }

    function deleteActive() {
        const store = readStore();
        const index = store.drafts.findIndex((draft) => draft.id === store.activeId);
        if (index < 0) return;
        store.drafts.splice(index, 1);
        store.activeId = store.drafts[index]?.id || store.drafts[index - 1]?.id || null;
        writeStore(store);
    }

    function rewardDetail(reward) {
        if (!reward) return "";
        if (reward.type === "pet") return reward.petId || "";
        if (reward.type === "chest") return reward.chestId || "";
        if (reward.type === "map_fragment") return [reward.mapId || "", reward.fragment || ""].join(":");
        if (reward.type === "coins" || reward.type === "gems") return String(reward.amount ?? "");
        if (reward.type === "item") return reward.itemId || "";
        if (reward.type === "collectible") return reward.collectibleId || "";
        return "";
    }

    function rewardFromInputs(type, detail) {
        const value = String(detail || "").trim();
        if (type === "ruby") return { type: "ruby" };
        if (type === "pet") return { type: "pet", petId: value };
        if (type === "chest") return { type: "chest", chestId: value };
        if (type === "map_fragment") {
            const [mapId, fragment] = value.split(":").map((part) => Number(part));
            return { type: "map_fragment", mapId, fragment };
        }
        if (type === "coins" || type === "gems") {
            return { type, amount: Math.max(0, Math.trunc(Number(value) || 0)) };
        }
        if (type === "item") return { type: "item", itemId: value };
        if (type === "collectible") return { type: "collectible", collectibleId: value };
        return { type };
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function regionOptionsHtml(selected, activeDraftId = null) {
        const items = Array.isArray(TQ.content?.regions) ? TQ.content.regions : [];
        const drafts = readStore().drafts
            .filter((draft) => draft.id !== activeDraftId)
            .sort((a, b) => Number(a.order) - Number(b.order));

        return [
            '<option value="">Início / sem região anterior</option>',
            ...items.map((region) =>
                '<option value="' + region.id + '"' + (String(selected) === String(region.id) ? " selected" : "") + '>' +
                String(region.id).padStart(2, "0") + " · " + escapeHtml(region.label) +
                '</option>'
            ),
            ...drafts.map((draft) =>
                '<option value="' + escapeHtml(draft.id) + '"' + (String(selected) === String(draft.id) ? " selected" : "") + '>' +
                String(draft.order).padStart(2, "0") + " · " + escapeHtml(draft.label) + " · RASCUNHO" +
                '</option>'
            )
        ].join("");
    }

    function rewardRowsHtml(island, islandIndex) {
        const rewards = Array.isArray(island.rewards) ? island.rewards : [];
        if (!rewards.length) {
            return '<div class="tq-region-builder-empty">Sem recompensa estrutural.</div>';
        }

        return rewards.map((reward, rewardIndex) => {
            const typeOptions = TQ.regionSchema.REWARD_TYPES.map((type) =>
                '<option value="' + type + '"' + (reward.type === type ? " selected" : "") + '>' + type + '</option>'
            ).join("");
            return `
                <div class="tq-region-builder-reward" data-reward-index="${rewardIndex}">
                    <select data-builder-reward-type data-island-index="${islandIndex}" data-reward-index="${rewardIndex}">${typeOptions}</select>
                    <input
                        data-builder-reward-detail
                        data-island-index="${islandIndex}"
                        data-reward-index="${rewardIndex}"
                        value="${escapeHtml(rewardDetail(reward))}"
                        placeholder="id, quantidade ou mapa:fragmento">
                    <button type="button" data-builder-remove-reward data-island-index="${islandIndex}" data-reward-index="${rewardIndex}" aria-label="Remover recompensa">×</button>
                </div>
            `;
        }).join("");
    }

    function islandsHtml(draft) {
        return draft.islands.map((island, index) => `
            <details class="tq-region-builder-island" ${index === 0 ? "open" : ""}>
                <summary>Ilha ${island.order} · ${escapeHtml(island.label)}</summary>
                <label>Nome
                    <input data-builder-island-label data-island-index="${index}" value="${escapeHtml(island.label)}">
                </label>
                <div class="tq-region-builder-rewards">
                    ${rewardRowsHtml(island, index)}
                </div>
                <button type="button" data-builder-add-reward data-island-index="${index}">+ Recompensa</button>
            </details>
        `).join("");
    }

    function optionalActionsHtml(draft) {
        const actions = draft.screen?.actions || [];
        return TQ.regionSchema.OPTIONAL_ACTIONS.map((item) => {
            const checked = actions.some((action) => action.type === item.type);
            return `
                <label class="tq-region-builder-check">
                    <input type="checkbox" data-builder-optional-action="${item.type}" ${checked ? "checked" : ""}>
                    ${escapeHtml(item.label)}
                </label>
            `;
        }).join("");
    }


    function actionDisplayLabel(action, draft) {
        if (action.type === "open_island") {
            const island = draft.islands.find((item) => item.id === action.targetId);
            return "Acessar " + (island?.label || action.targetId);
        }
        return ({
            open_merchant: "Acessar navio mercador",
            go_home: "Ir para Home",
            go_back: "Voltar",
            open_world_map: "Abrir Mapa Mundo"
        })[action.type] || action.type;
    }

    function assetBindingsHtml(draft) {
        const assets = Array.isArray(draft.screen?.assets) ? draft.screen.assets : [];
        const actions = Array.isArray(draft.screen?.actions) ? draft.screen.actions : [];
        const bindings = Array.isArray(draft.screen?.bindings) ? draft.screen.bindings : [];

        if (!assets.length) {
            return '<div class="tq-region-builder-empty">Nenhum asset nesta região. Abra a tela vazia, use UP para adicionar e depois sincronize aqui.</div>';
        }

        return assets.map((asset) => {
            const binding = bindings.find((item) => item.assetId === asset.id);
            const options = [
                '<option value="">Sem função · decorativo</option>',
                ...actions.map((action) =>
                    '<option value="' + escapeHtml(action.id) + '"' +
                    (binding?.actionId === action.id ? ' selected' : '') + '>' +
                    escapeHtml(actionDisplayLabel(action, draft)) +
                    '</option>'
                )
            ].join("");

            return `
                <div class="tq-region-builder-binding">
                    <span>
                        <strong>${escapeHtml(asset.fileName || asset.id)}</strong>
                        <small>${escapeHtml(asset.id)}</small>
                    </span>
                    <select data-builder-bind-asset="${escapeHtml(asset.id)}">
                        ${options}
                    </select>
                </div>
            `;
        }).join("");
    }

    function buildExportEnvelope(draft) {
        const region = withEditorLayout(draft);
        const validation = TQ.regionSchema.validateRegionDefinition(region);
        const beforeRegions = existingRegionCount();
        const beforeIslands = beforeRegions * TQ.regionSchema.ISLANDS_PER_REGION;
        const afterRegions = Math.max(beforeRegions + 1, Number(region.order) || beforeRegions + 1);
        return {
            schemaVersion: 1,
            operation: "add_region",
            compatibility: {
                mode: "additive",
                previousRegionCount: beforeRegions,
                resultingRegionCount: afterRegions,
                previousIslandCount: beforeIslands,
                resultingIslandCount: beforeIslands + TQ.regionSchema.ISLANDS_PER_REGION,
                preservesExistingProgress: true
            },
            validation,
            region
        };
    }

    function mount(options = {}) {
        activeCleanup?.();
        activeCleanup = null;

        const onPreview = typeof options.onPreview === "function" ? options.onPreview : () => {};

        let store = readStore();
        if (!store.drafts.length) {
            createDraft();
            store = readStore();
        }

        const host = document.createElement("aside");
        host.className = "tq-region-builder-dev";
        host.innerHTML = `
            <button type="button" class="tq-region-builder-toggle">REG</button>
            <section class="tq-region-builder-panel" hidden>
                <header>
                    <strong>REG · Construtor de regiões</strong>
                    <span data-builder-status>Pronto</span>
                </header>
                <div class="tq-region-builder-toolbar">
                    <select data-builder-draft></select>
                    <button type="button" data-builder-new>+ Região</button>
                    <button type="button" class="is-danger" data-builder-delete>Excluir</button>
                </div>
                <div data-builder-body></div>
            </section>
        `;
        document.body.appendChild(host);

        const panel = host.querySelector(".tq-region-builder-panel");
        const body = host.querySelector("[data-builder-body]");
        const draftSelect = host.querySelector("[data-builder-draft]");
        const status = host.querySelector("[data-builder-status]");
        panel.hidden = !panelOpen;

        function closeOtherPanels() {
            document.querySelectorAll(
                ".tq-scene-dev-panel, .tq-settings-dev-panel, .tq-asset-upload-dev-panel, .tq-parallax-dev-panel, .tq-region-builder-panel"
            ).forEach((candidate) => {
                if (candidate !== panel) candidate.hidden = true;
            });
            root.dispatchEvent(new CustomEvent("tq:dev-tool-activate", {
                detail: { tool: "region-builder" }
            }));
        }

        function currentDraft() {
            return getActiveDraft();
        }

        async function syncLocalAssetsIntoDraft() {
            const draft = currentDraft();
            if (!draft || typeof TQ.dev?.assetUploader?.readLocalLayerRecords !== "function") {
                return draft;
            }

            try {
                const records = await TQ.dev.assetUploader.readLocalLayerRecords(getEditorScreenId(draft));
                const assetIds = new Set(records.map((record) => String(record.id)));

                return updateActive((current) => {
                    const previousById = new Map(
                        (current.screen.assets || []).map((asset) => [String(asset.id), asset])
                    );

                    current.screen.assets = records.map((record) => ({
                        ...(previousById.get(String(record.id)) || {}),
                        id: String(record.id),
                        fileName: String(record.fileName || "asset"),
                        source: "dev-local"
                    }));

                    current.screen.bindings = (current.screen.bindings || [])
                        .filter((binding) => assetIds.has(String(binding.assetId)));

                    return current;
                });
            } catch (error) {
                console.warn("Falha ao sincronizar assets da região:", error);
                status.textContent = "Falha ao sincronizar assets";
                return draft;
            }
        }

        function refreshDraftSelect() {
            const nextStore = readStore();
            draftSelect.replaceChildren(...nextStore.drafts.map((draft) => {
                const option = document.createElement("option");
                option.value = draft.id;
                option.textContent = String(draft.order).padStart(2, "0") + " · " + draft.label;
                return option;
            }));
            if (nextStore.activeId) draftSelect.value = nextStore.activeId;
        }

        function renderBody() {
            const draft = currentDraft();
            if (!draft) {
                body.innerHTML = '<p>Nenhuma região em construção.</p>';
                return;
            }

            const validation = TQ.regionSchema.validateRegionDefinition(withEditorLayout(draft));
            const requiredActions = draft.screen.actions.filter((action) => action.type === "open_island");
            const optionalActions = draft.screen.actions.filter((action) => action.type !== "open_island");

            body.innerHTML = `
                <fieldset>
                    <legend>Região</legend>
                    <div class="tq-region-builder-grid">
                        <label>Nome
                            <input data-builder-label value="${escapeHtml(draft.label)}">
                        </label>
                        <label>ID estável
                            <input data-builder-id value="${escapeHtml(draft.id)}">
                        </label>
                        <label>Ordem
                            <input data-builder-order type="number" min="1" value="${draft.order}">
                        </label>
                        <label>contentVersion
                            <input data-builder-content-version type="number" min="1" value="${draft.contentVersion}">
                        </label>
                    </div>
                    <label>Desbloquear após
                        <select data-builder-unlock-after>
                            ${regionOptionsHtml(draft.unlock?.regionId, draft.id)}
                        </select>
                    </label>
                    <small>Nova região é aditiva. IDs existentes não são renumerados.</small>
                </fieldset>

                <fieldset>
                    <legend>Ilhas · regra fixa 5</legend>
                    ${islandsHtml(draft)}
                </fieldset>

                <fieldset>
                    <legend>Funções da tela</legend>
                    <div class="tq-region-builder-summary">
                        <span><b>${requiredActions.length}</b> open_island obrigatórias</span>
                        <span><b>${optionalActions.length}</b> opcionais</span>
                        <span><b>${draft.screen.assets.length}</b> assets</span>
                        <span><b>${draft.screen.bindings.length}</b> bindings</span>
                    </div>
                    <div class="tq-region-builder-required">
                        ${requiredActions.map((action, index) =>
                            '<span>Ilha ' + (index + 1) + ' → ' + escapeHtml(action.targetId) + '</span>'
                        ).join("")}
                    </div>
                    <strong>Funções opcionais</strong>
                    <div class="tq-region-builder-options">
                        ${optionalActionsHtml(draft)}
                    </div>
                    <small>A tela nasce com 0 assets. As funções existem sem depender de PNG/WebP.</small>
                </fieldset>

                <fieldset>
                    <legend>Assets e vínculos</legend>
                    <div class="tq-region-builder-asset-tools">
                        <button type="button" data-builder-sync-assets>Sincronizar assets da tela</button>
                        <span>${draft.screen.assets.length} asset(s)</span>
                    </div>
                    <div class="tq-region-builder-bindings">
                        ${assetBindingsHtml(draft)}
                    </div>
                    <small>Asset sem vínculo é decoração. O comportamento existe na função, não na imagem.</small>
                </fieldset>

                <fieldset>
                    <legend>Validação e saída</legend>
                    <div class="tq-region-builder-validation ${validation.valid ? "is-valid" : "is-invalid"}">
                        <strong>${validation.valid ? "✓ Estrutura válida" : "✕ Estrutura inválida"}</strong>
                        ${validation.errors.map((message) => '<span>Erro: ' + escapeHtml(message) + '</span>').join("")}
                        ${validation.warnings.map((message) => '<span>Aviso: ' + escapeHtml(message) + '</span>').join("")}
                    </div>
                    <div class="tq-region-builder-actions">
                        <button type="button" data-builder-preview>Abrir tela vazia</button>
                        <button type="button" data-builder-copy>Copiar JSON</button>
                        <button type="button" data-builder-download>Baixar JSON</button>
                    </div>
                    <small>O JSON exportado incorpora também as posições das funções ajustadas no UX da tela vazia.</small>
                </fieldset>
            `;

            bindBodyEvents();
        }

        function saveField(mutator, message = "Salvo") {
            const next = updateActive(mutator);
            if (next) {
                status.textContent = message;
                refreshDraftSelect();
                renderBody();
            }
        }

        function bindBodyEvents() {
            body.querySelector("[data-builder-label]")?.addEventListener("change", (event) => {
                saveField((draft) => ({ ...draft, label: event.target.value.trim() || draft.label }));
            });

            body.querySelector("[data-builder-id]")?.addEventListener("change", (event) => {
                saveField((draft) => TQ.regionSchema.rebaseRegionId(draft, event.target.value), "ID atualizado");
            });

            body.querySelector("[data-builder-order]")?.addEventListener("change", (event) => {
                saveField((draft) => ({ ...draft, order: Math.max(1, Math.trunc(Number(event.target.value) || draft.order)) }));
            });

            body.querySelector("[data-builder-content-version]")?.addEventListener("change", (event) => {
                saveField((draft) => ({
                    ...draft,
                    contentVersion: Math.max(1, Math.trunc(Number(event.target.value) || draft.contentVersion))
                }));
            });

            body.querySelector("[data-builder-unlock-after]")?.addEventListener("change", (event) => {
                const raw = event.target.value;
                const numeric = Number(raw);
                const regionId = raw === ""
                    ? null
                    : (Number.isInteger(numeric) && String(numeric) === raw ? numeric : raw);
                saveField((draft) => ({
                    ...draft,
                    unlock: {
                        type: "after_region",
                        regionId
                    }
                }));
            });

            body.querySelectorAll("[data-builder-island-label]").forEach((input) => {
                input.addEventListener("change", () => {
                    const islandIndex = Number(input.dataset.islandIndex);
                    saveField((draft) => {
                        draft.islands[islandIndex].label = input.value.trim() || ("Ilha " + (islandIndex + 1));
                        return draft;
                    });
                });
            });

            body.querySelectorAll("[data-builder-add-reward]").forEach((button) => {
                button.addEventListener("click", () => {
                    const islandIndex = Number(button.dataset.islandIndex);
                    saveField((draft) => {
                        draft.islands[islandIndex].rewards.push({ type: "ruby" });
                        return draft;
                    }, "Recompensa adicionada");
                });
            });

            body.querySelectorAll("[data-builder-remove-reward]").forEach((button) => {
                button.addEventListener("click", () => {
                    const islandIndex = Number(button.dataset.islandIndex);
                    const rewardIndex = Number(button.dataset.rewardIndex);
                    saveField((draft) => {
                        draft.islands[islandIndex].rewards.splice(rewardIndex, 1);
                        return draft;
                    }, "Recompensa removida");
                });
            });

            body.querySelectorAll("[data-builder-reward-type], [data-builder-reward-detail]").forEach((control) => {
                control.addEventListener("change", () => {
                    const islandIndex = Number(control.dataset.islandIndex);
                    const rewardIndex = Number(control.dataset.rewardIndex);
                    const row = control.closest(".tq-region-builder-reward");
                    const type = row.querySelector("[data-builder-reward-type]").value;
                    const detail = row.querySelector("[data-builder-reward-detail]").value;
                    saveField((draft) => {
                        draft.islands[islandIndex].rewards[rewardIndex] = rewardFromInputs(type, detail);
                        return draft;
                    });
                });
            });

            body.querySelectorAll("[data-builder-optional-action]").forEach((checkbox) => {
                checkbox.addEventListener("change", () => {
                    saveField(
                        (draft) => TQ.regionSchema.setOptionalAction(draft, checkbox.dataset.builderOptionalAction, checkbox.checked),
                        checkbox.checked ? "Função adicionada" : "Função removida"
                    );
                });
            });

            body.querySelector("[data-builder-sync-assets]")?.addEventListener("click", async () => {
                await syncLocalAssetsIntoDraft();
                status.textContent = "Assets sincronizados";
                refreshDraftSelect();
                renderBody();
            });

            body.querySelectorAll("[data-builder-bind-asset]").forEach((select) => {
                select.addEventListener("change", () => {
                    const assetId = select.dataset.builderBindAsset;
                    const actionId = select.value;

                    saveField((draft) => {
                        draft.screen.bindings = (draft.screen.bindings || [])
                            .filter((binding) => binding.assetId !== assetId);

                        if (actionId) {
                            draft.screen.bindings.push({ assetId, actionId });
                        }
                        return draft;
                    }, actionId ? "Asset vinculado" : "Asset definido como decorativo");
                });
            });

            body.querySelector("[data-builder-preview]")?.addEventListener("click", () => {
                const draft = currentDraft();
                if (!draft) return;
                panelOpen = false;
                panel.hidden = true;
                onPreview(draft);
            });

            body.querySelector("[data-builder-copy]")?.addEventListener("click", async () => {
                await syncLocalAssetsIntoDraft();
                const draft = currentDraft();
                if (!draft) return;
                const payload = JSON.stringify(buildExportEnvelope(draft), null, 2);
                try {
                    await navigator.clipboard.writeText(payload);
                    status.textContent = "JSON copiado";
                } catch (_) {
                    const area = document.createElement("textarea");
                    area.value = payload;
                    document.body.appendChild(area);
                    area.select();
                    document.execCommand("copy");
                    area.remove();
                    status.textContent = "JSON copiado";
                }
            });

            body.querySelector("[data-builder-download]")?.addEventListener("click", async () => {
                await syncLocalAssetsIntoDraft();
                const draft = currentDraft();
                if (!draft) return;
                const payload = JSON.stringify(buildExportEnvelope(draft), null, 2);
                const blob = new Blob([payload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = draft.id + ".region.json";
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                setTimeout(() => URL.revokeObjectURL(url), 0);
                status.textContent = "JSON gerado";
            });
        }

        host.querySelector(".tq-region-builder-toggle").addEventListener("click", () => {
            panelOpen = panel.hidden;
            if (panelOpen) closeOtherPanels();
            panel.hidden = !panelOpen;
            if (panelOpen) {
                refreshDraftSelect();
                renderBody();
            }
        });

        host.querySelector("[data-builder-new]").addEventListener("click", () => {
            createDraft();
            refreshDraftSelect();
            renderBody();
            status.textContent = "Nova região criada";
        });

        host.querySelector("[data-builder-delete]").addEventListener("click", () => {
            deleteActive();
            if (!readStore().drafts.length) createDraft();
            refreshDraftSelect();
            renderBody();
            status.textContent = "Rascunho excluído";
        });

        draftSelect.addEventListener("change", () => {
            const nextStore = readStore();
            nextStore.activeId = draftSelect.value;
            writeStore(nextStore);
            renderBody();
        });

        refreshDraftSelect();
        renderBody();

        activeCleanup = () => host.remove();
        return activeCleanup;
    }

    TQ.dev = TQ.dev || {};
    TQ.dev.regionBuilder = Object.freeze({
        mount,
        createDraft,
        getActiveDraft,
        getEditorScreenId,
        actionDevId,
        withEditorLayout,
        buildExportEnvelope
    });
})(globalThis);
