(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const homeBackgrounds = Object.freeze([
        Object.freeze({
            id: "pirate-main",
            label: "Baía encantada",
            src: "./assets/ui/home-pirata-fundo-principal.webp",
            isDefault: true
        }),
        Object.freeze({
            id: "pirate-bay",
            label: "Baía pirata",
            src: "./assets/backgrounds/home-pirate-bay.webp"
        }),
        Object.freeze({
            id: "pirate-port",
            label: "Porto pirata",
            src: "./assets/backgrounds/home-pirate-port.webp"
        })
    ]);

    const profileFrames = Object.freeze([
        Object.freeze({
            id: "pirate-treasure",
            label: "Tesouro pirata",
            src: "./assets/frames/profile-frame-pirate-treasure.webp",
            isDefault: true
        }),
        Object.freeze({
            id: "tide-wheel",
            label: "Timão das marés",
            src: "./assets/frames/profile-frame-tide-wheel.webp"
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
            homeHeroes: Object.freeze({
                luna: "./assets/avatars/avatar-luna-pirata.webp",
                maya: "./assets/avatars/avatar-maya-pirata.webp",
                sofia: "./assets/avatars/avatar-sofia-pirata.webp"
            }),
            compass: "./assets/ui/icone-mapa-bussola.webp",
            chest: "./assets/ui/icone-bau-tesouro.webp",
            reward: "./assets/ui/icone-recompensa-magica.webp",
            nauticalChest: "./assets/ui/chest-nautical.webp",
            itemChest: "./assets/ui/chest-items.webp",
            pet: "./assets/pets/axolotl-captain.webp",
            playButton: "./assets/ui/home-pirata-botao-aventura.webp",\n            homeOverlay: "./assets/ui/home-art-overlay.webp?v=20260919-2149"
        })
    });
})(globalThis);
