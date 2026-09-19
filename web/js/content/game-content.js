(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

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
