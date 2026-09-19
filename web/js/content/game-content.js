(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const homeBackgrounds = Object.freeze([
        Object.freeze({
            id: "pirate-main",
            label: "Aventura no mar",
            src: "./assets/ui/home-pirata-fundo-principal.webp",
            isDefault: true
        })
    ]);

    const profileFrames = Object.freeze([
        Object.freeze({
            id: "pirate-treasure",
            label: "Tesouro pirata",
            src: "./assets/frames/profile-frame-pirate-treasure.webp",
            isDefault: true
        })
    ]);

    TQ.content = Object.freeze({
        campaignTotals: Object.freeze({
            regions: 10,
            islands: 100,
            pets: 30,
            chests: 30,
            specialMaps: 5,
            fragmentsPerMap: 4,
            diamondsPerMapMission: 1000
        }),
        homeBackgrounds,
        profileFrames,
        defaultHomeBackgroundId: "pirate-main",
        defaultProfileFrameId: "pirate-treasure",
        assets: Object.freeze({
            avatars: Object.freeze({
                luna: "./assets/avatars/avatar-luna-visual-base.webp",
                maya: "./assets/avatars/avatar-maya-visual-base.webp",
                sofia: "./assets/avatars/avatar-sofia-visual-base.webp"
            }),
            compass: "./assets/ui/icone-mapa-bussola.webp",
            chest: "./assets/ui/icone-bau-tesouro.webp",
            reward: "./assets/ui/icone-recompensa-magica.webp"
        })
    });
})(globalThis);
