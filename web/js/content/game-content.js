(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const homeBackgrounds = Object.freeze([
        Object.freeze({ id: "pirate-main", label: "Baía encantada", src: "./assets/ui/home-pirata-fundo-principal.webp", isDefault: true }),
        Object.freeze({ id: "pirate-bay", label: "Baía pirata", src: "./assets/backgrounds/home-pirate-bay.webp" }),
        Object.freeze({ id: "pirate-port", label: "Porto pirata", src: "./assets/backgrounds/home-pirate-port.webp" })
    ]);

    const profileFrames = Object.freeze([
        Object.freeze({ id: "simple", label: "Simples", src: null, isDefault: true }),
        Object.freeze({ id: "pirate-treasure", label: "Tesouro pirata", src: "./assets/frames/profile-frame-pirate-treasure.webp" }),
        Object.freeze({ id: "tide-wheel", label: "Timão das marés", src: "./assets/frames/profile-frame-tide-wheel.webp" })
    ]);

    const regions = Object.freeze(Array.from({ length: 11 }, (_, i) => Object.freeze({
        id: i + 1,
        label: `Região ${i + 1}`,
        islandsTotal: 10,
        isFinalRegion: i === 10
    })));

    TQ.content = Object.freeze({
        campaignTotals: Object.freeze({
            regions: 11,
            islands: 110,
            islandsPerRegion: 10,
            pets: 30,
            chests: 30,
            specialMaps: 5,
            fragmentsPerMap: 4,
            finalMapFragments: 9,
            diamondsPerMapMission: 1000
        }),
        regions,
        homeBackgrounds,
        profileFrames,
        defaultHomeBackgroundId: "pirate-main",
        defaultProfileFrameId: "simple",
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
            playButton: "./assets/ui/home-pirata-botao-aventura.webp",
            homeOverlay: "./assets/ui/home-art-overlay.webp?v=20260919-2228",
            regionsMap: "./assets/regions/regions-map-base.webp?v=20260920-0014"
        })
    });
})(globalThis);
