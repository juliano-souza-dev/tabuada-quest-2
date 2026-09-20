(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const REGION_SLOTS = Object.freeze({
        1:{left:5,top:15.5,width:25}, 2:{left:37.5,top:15.5,width:25}, 3:{left:70,top:15.5,width:25},
        4:{left:5,top:32.5,width:25}, 5:{left:37.5,top:32.5,width:25}, 6:{left:70,top:32.5,width:25},
        7:{left:5,top:49.5,width:25}, 8:{left:37.5,top:49.5,width:25}, 9:{left:70,top:49.5,width:25},
        10:{left:5.5,top:66.5,width:25}
    });

    function safeAvatarId(id) {
        return TQ.content.assets.avatars[id] ? id : "luna";
    }

    function resolveProfileFrame(id) {
        return TQ.content.profileFrames.find((item) => item.id === id)
            || TQ.content.profileFrames[0];
    }

    function label(status) {
        return ({locked:"BLOQUEADA",available:"EXPLORAR",in_progress:"CONTINUAR",completed:"CONCLUÍDA"})[status] || "";
    }

    function renderRegion(state, region) {
        const slot = REGION_SLOTS[region.id];
        const progress = state.campaign.regionProgress[String(region.id)];
        const status = TQ.domain.playerState.getRegionStatus(state, region.id);
        const current = state.campaign.currentRegionId === region.id ? " is-current" : "";
        return `
            <button class="region-node is-${status}${current}" type="button" data-region-id="${region.id}"
                style="left:${slot.left}%;top:${slot.top}%;width:${slot.width}%"
                aria-label="${region.label}, ${progress.islandsCompleted} de 10 ilhas, ${label(status)}">
                <span class="region-number">${region.id}</span>
                <span class="region-title">${region.label.toUpperCase()}</span>
                <span class="region-progress">${progress.islandsCompleted}/10</span>
                <span class="region-action">${label(status)}${status==="locked"?" 🔒":status==="completed"?" ✓":""}</span>
            </button>`;
    }

    function renderFinal(state) {
        const status = TQ.domain.playerState.getRegionStatus(state, 11);
        const progress = state.campaign.regionProgress["11"];
        const j = state.campaign.finalJourney;
        const fragments = Array.from({length:9},(_,i) =>
            `<span class="final-fragment ${i<j.finalMapFragments?"is-collected":""}">${i<j.finalMapFragments?"✓":""}</span>`
        ).join("");
        return `
            <button class="final-region-hitbox" type="button" data-region-id="11" aria-label="Região 11, ${progress.islandsCompleted} de 10 ilhas"></button>
            <div class="final-region-ui is-${status}">
                <span class="final-region-number">11</span>
                <span class="final-region-title">REGIÃO 11</span>
                <span class="final-region-progress">${progress.islandsCompleted}/10 ILHAS</span>
                <div class="final-fragment-row">${fragments}</div>
                <span class="final-map-count">${j.finalMapFragments}/9</span>
                <span class="final-island10">${j.island10Completed?"ILHA 10 ✓":j.island10Unlocked?"ILHA 10":"ILHA 10 🔒"}</span>
                <span class="final-chest-state">${j.finalGrandChestClaimed?"GRANDE BAÚ RESGATADO":j.finalGrandChestUnlocked?"GRANDE BAÚ DISPONÍVEL":"GRANDE BAÚ FINAL 🔒"}</span>
            </div>`;
    }

    function renderRegionsScreen({ state, onStateChange, onNavigate }) {
        const avatarId = safeAvatarId(state.player.avatarId);
        const avatarSrc = TQ.content.assets.avatars[avatarId];
        const frame = resolveProfileFrame(state.player.profileFrameId);
        const xp = Math.max(0,Math.min(100,(state.progression.xpCurrent/state.progression.xpRequired)*100));

        const screen = document.createElement("section");
        screen.className = "regions-screen";
        screen.setAttribute("aria-label","Mapa de Regiões");
        screen.innerHTML = `
            <div class="regions-design-stage">
                <img class="regions-map-base" src="${TQ.content.assets.regionsMap}" alt="" aria-hidden="true">
                <div class="regions-hud">
                    <div class="regions-hud-profile ${frame.src?"has-frame":"is-simple"}">
                        <img class="regions-hud-avatar" src="${avatarSrc}" alt="">
                        ${frame.src?`<img class="regions-hud-frame" src="${frame.src}" alt="">`:""}
                    </div>
                    <div class="regions-hud-name">${state.player.displayName}</div>
                    <div class="regions-hud-level">${state.progression.level}</div>
                    <div class="regions-hud-xp"><span style="width:${xp}%"></span><b>${state.progression.xpCurrent}/${state.progression.xpRequired}</b></div>
                    <div class="regions-hud-wallet coins">${state.wallet.coins}</div>
                    <div class="regions-hud-wallet gems">${state.wallet.gems}</div>
                </div>
                <button class="regions-back" type="button" data-action="back" aria-label="Voltar">‹</button>
                ${TQ.content.regions.filter((r)=>r.id<=10).map((r)=>renderRegion(state,r)).join("")}
                ${renderFinal(state)}
                <div class="regions-toast" role="status" aria-live="polite"></div>
            </div>`;

        const toast = screen.querySelector(".regions-toast");
        let timer = null;
        function show(message) {
            toast.textContent = message;
            toast.classList.add("is-visible");
            clearTimeout(timer);
            timer = setTimeout(()=>toast.classList.remove("is-visible"),1800);
        }

        screen.addEventListener("click",(event)=>{
            if (event.target.closest('[data-action="back"]')) {
                onNavigate("home");
                return;
            }
            const node = event.target.closest("[data-region-id]");
            if (!node) return;
            const regionId = Number(node.dataset.regionId);
            const status = TQ.domain.playerState.getRegionStatus(state,regionId);
            if (status === "locked") {
                show(`Conclua a Região ${regionId-1} para seguir viagem.`);
                return;
            }
            onStateChange(TQ.domain.playerState.selectRegion(state,regionId));
        });
        return screen;
    }

    TQ.screens = TQ.screens || {};
    TQ.screens.regions = Object.freeze({ renderRegionsScreen, REGION_SLOTS });
})(globalThis);
