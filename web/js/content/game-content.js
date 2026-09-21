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

    const gameplayRewards = Object.freeze({
        xpPerCompletedMatch: 20
    });

    const crewMembers = Object.freeze([
        Object.freeze({ id: "atirador", label: "Atirador", asset: "./assets/crew/atirador.webp", cost: 250, bonusType: "xp", bonusPercent: 3 }),
        Object.freeze({ id: "carpinteiro", label: "Carpinteiro", asset: "./assets/crew/carpinteiro.webp", cost: 300, bonusType: "coins", bonusPercent: 3 }),
        Object.freeze({ id: "cozinheiro", label: "Cozinheiro", asset: "./assets/crew/cozinheiro.webp", cost: 350, bonusType: "gems", bonusPercent: 3 }),
        Object.freeze({ id: "espadachim", label: "Espadachim", asset: "./assets/crew/espadachim.webp", cost: 650, bonusType: "xp", bonusPercent: 5 }),
        Object.freeze({ id: "explorador", label: "Explorador", asset: "./assets/crew/explorador.webp", cost: 750, bonusType: "coins", bonusPercent: 5 }),
        Object.freeze({ id: "inventor", label: "Inventor", asset: "./assets/crew/inventor.webp", cost: 850, bonusType: "gems", bonusPercent: 5 }),
        Object.freeze({ id: "medico", label: "Médico", asset: "./assets/crew/medico.webp", cost: 1200, bonusType: "xp", bonusPercent: 8 }),
        Object.freeze({ id: "musico", label: "Músico", asset: "./assets/crew/musico.webp", cost: 1400, bonusType: "coins", bonusPercent: 8 }),
        Object.freeze({ id: "navegador", label: "Navegador", asset: "./assets/crew/navegador.webp", cost: 1600, bonusType: "gems", bonusPercent: 8 })
    ]);

    const worldRegions = Object.freeze([
        Object.freeze({ id: 1, label: "CORSÁRIO" }),
        Object.freeze({ id: 2, label: "BIRADES" }),
        Object.freeze({ id: 3, label: "ZONA OURO" }),
        Object.freeze({ id: 4, label: "VALE ESMERALDA" }),
        Object.freeze({ id: 5, label: "ZONA SAFIRA" }),
        Object.freeze({ id: 6, label: "TERRAS GÉLIDAS" }),
        Object.freeze({ id: 7, label: "FANTASMAS" }),
        Object.freeze({ id: 8, label: "MARÉ SOMBRIA" }),
        Object.freeze({ id: 9, label: "TEMPESTÁRIA" }),
        Object.freeze({ id: 10, label: "MAR DE FERRO" }),
        Object.freeze({ id: 11, label: "ZONA KRAKEN" }),
        Object.freeze({ id: 12, label: "TERRAS DE CINZA" }),
        Object.freeze({ id: 13, label: "OBSIDIANA" }),
        Object.freeze({ id: 14, label: "ZONA RUBI" }),
        Object.freeze({ id: 15, label: "ESCARLATE" }),
        Object.freeze({ id: 16, label: "ZONA DO DRAGÃO" }),
        Object.freeze({ id: 17, label: "TERRAS DO TITÃ" }),
        Object.freeze({ id: 18, label: "CRISTÁLIA" }),
        Object.freeze({ id: 19, label: "ILHAS CELESTES" }),
        Object.freeze({ id: 20, label: "COROA DO MAR" }),
        Object.freeze({ id: 21, label: "ZONA FÊNIX" }),
        Object.freeze({ id: 22, label: "REINO DAS MARÉS" })
    ]);

    function getWorldRegion(regionId) {
        return worldRegions.find((region) => region.id === Number(regionId)) || null;
    }

    const regions = Object.freeze(worldRegions.map((region) => Object.freeze({
        id: region.id,
        label: region.label,
        islandsTotal: 5,
        isFinalRegion: region.id === 22
    })));

    const regionIdentities = Object.freeze([]);

    const canonicalIslandNameOverrides = Object.freeze({
        "13": Object.freeze([
            "Rocha Negra",
            "Cinzas",
            "Fogo Obsidiano",
            "Cratera",
            "Coração de Obsidiana"
        ])
    });

    const islandIdentitySources = canonicalIslandNameOverrides;

    const islandIdentities = Object.freeze(
        Object.fromEntries(Object.entries(islandIdentitySources).map(([regionId, names]) => [
            regionId,
            Object.freeze(names.map((label, index) => Object.freeze({
                id: index + 1,
                regionId: Number(regionId),
                label,
                sceneKey: `r${regionId}-i${index + 1}`,
                challengeIdentity: "mixed"
            })))
        ]))
    );

    const TEMP_ISLAND_WORDS = Object.freeze([
        "Bruma",
        "Âncora",
        "Coral",
        "Maré",
        "Vela",
        "Rochedo",
        "Farol",
        "Concha",
        "Timão",
        "Pérola",
        "Névoa",
        "Estrela",
        "Baía",
        "Vento",
        "Onda",
        "Tesouro"
    ]);

    function createTemporaryIslandIdentity(regionId, islandId) {
        const normalizedRegionId = Number(regionId);
        const normalizedIslandId = Number(islandId);

        if (!Number.isInteger(normalizedRegionId)
            || normalizedRegionId < 1
            || normalizedRegionId > 22
            || !Number.isInteger(normalizedIslandId)
            || normalizedIslandId < 1
            || normalizedIslandId > 5) {
            return null;
        }

        const wordIndex = Math.abs((normalizedRegionId * 31) + (normalizedIslandId * 17))
            % TEMP_ISLAND_WORDS.length;
        const suffix = (((normalizedRegionId * 43) + (normalizedIslandId * 29)) % 90) + 10;

        return Object.freeze({
            id: normalizedIslandId,
            regionId: normalizedRegionId,
            label: `Ilha ${TEMP_ISLAND_WORDS[wordIndex]} ${String(suffix).padStart(2, "0")}`,
            sceneKey: `r${normalizedRegionId}-i${normalizedIslandId}`,
            challengeIdentity: "mixed",
            isPlaceholder: true
        });
    }

    function getRegionIdentity(regionId) {
        return regionIdentities.find((item) => item.regionId === Number(regionId)) || null;
    }

    function getIslandIdentity(regionId, islandId) {
        const existing = islandIdentities[String(regionId)]?.[Number(islandId) - 1] || null;
        return existing || createTemporaryIslandIdentity(regionId, islandId);
    }

    const regionTextMaps = Object.freeze({
        "1": Object.freeze({
            regionId: 1,
            regionLabel: "CORSÁRIO",
            maps: Object.freeze([
                Object.freeze({ id: "r1-map-1", label: "Mapa da Bandeira Corsária", representation: "text", asset: null }),
                Object.freeze({ id: "r1-map-2", label: "Mapa do Saque Perdido", representation: "text", asset: null }),
                Object.freeze({ id: "r1-map-3", label: "Mapa da Rota dos Corsários", representation: "text", asset: null }),
                Object.freeze({ id: "r1-map-4", label: "Mapa do Tesouro do Capitão", representation: "text", asset: null }),
                Object.freeze({ id: "r1-map-5", label: "Mapa da Âncora Dourada", representation: "text", asset: null })
            ])
        }),
        "13": Object.freeze({
            regionId: 13,
            regionLabel: "OBSIDIANA",
            maps: Object.freeze([
                Object.freeze({ id: "r13-map-1", label: "Mapa da Rocha Negra", representation: "text", asset: null }),
                Object.freeze({ id: "r13-map-2", label: "Mapa das Cinzas Eternas", representation: "text", asset: null }),
                Object.freeze({ id: "r13-map-3", label: "Mapa do Fogo Obsidiano", representation: "text", asset: null }),
                Object.freeze({ id: "r13-map-4", label: "Mapa da Cratera Sombria", representation: "text", asset: null }),
                Object.freeze({ id: "r13-map-5", label: "Mapa do Coração de Obsidiana", representation: "text", asset: null })
            ])
        }),
        "14": Object.freeze({
            regionId: 14,
            regionLabel: "ZONA RUBI",
            maps: Object.freeze([
                Object.freeze({ id: "r14-map-1", label: "Mapa do Rubi Sangrento", representation: "text", asset: null }),
                Object.freeze({ id: "r14-map-2", label: "Mapa da Gruta Carmesim", representation: "text", asset: null }),
                Object.freeze({ id: "r14-map-3", label: "Mapa das Pedras Rubras", representation: "text", asset: null }),
                Object.freeze({ id: "r14-map-4", label: "Mapa do Coração Rubi", representation: "text", asset: null }),
                Object.freeze({ id: "r14-map-5", label: "Mapa da Coroa Escarlate", representation: "text", asset: null })
            ])
        }),
        "15": Object.freeze({
            regionId: 15,
            regionLabel: "ESCARLATE",
            maps: Object.freeze([
                Object.freeze({ id: "r15-map-1", label: "Mapa do Mar Escarlate", representation: "text", asset: null }),
                Object.freeze({ id: "r15-map-2", label: "Mapa das Falésias Vermelhas", representation: "text", asset: null }),
                Object.freeze({ id: "r15-map-3", label: "Mapa da Lua Carmesim", representation: "text", asset: null }),
                Object.freeze({ id: "r15-map-4", label: "Mapa da Maré Rubra", representation: "text", asset: null }),
                Object.freeze({ id: "r15-map-5", label: "Mapa do Horizonte Escarlate", representation: "text", asset: null })
            ])
        })
    });

    function getRegionTextMaps(regionId) {
        return regionTextMaps[String(Number(regionId))]?.maps || Object.freeze([]);
    }

    const regionRewards = Object.freeze({
        "1": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 2 })])
        }),
        "2": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i6" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i7" })]),
            "3": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 3 })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i9" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 4 })])
        }),
        "3": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r3-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r3-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r3-i5" })])
        }),
        "4": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r4-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r4-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        }),
        "5": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r5-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 2, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r5-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r5-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 2, fragment: 2 })])
        }),
        "6": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r6-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r6-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 2, fragment: 3 })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r6-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 2, fragment: 4 })])
        }),
        "7": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r7-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r7-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r7-i5" })])
        }),
        "8": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r8-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r8-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        }),
        "9": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r9-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 3, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r9-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r9-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 3, fragment: 2 })])
        }),
        "10": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r10-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r10-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 3, fragment: 3 })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r10-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 3, fragment: 4 })])
        }),
        "11": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r11-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r11-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r11-i5" })])
        }),
        "12": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r12-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r12-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        }),
        "13": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r13-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 4, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r13-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r13-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 4, fragment: 2 })])
        }),
        "14": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r14-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r14-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 4, fragment: 3 })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r14-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 4, fragment: 4 })])
        }),
        "15": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r15-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r15-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r15-i5" })])
        }),
        "16": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r16-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r16-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        }),
        "17": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r17-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r17-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r17-i5" })])
        }),
        "18": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r18-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r18-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        }),
        "19": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r19-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 5, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r19-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r19-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 5, fragment: 2 })])
        }),
        "20": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r20-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r20-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 5, fragment: 3 })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r20-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 5, fragment: 4 })])
        }),
        "21": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r21-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r21-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r21-i5" })])
        }),
        "22": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "ruby" })]),
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r22-i2" })]),
            "3": Object.freeze([Object.freeze({ type: "ruby" })]),
            "4": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r22-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "ruby" })])
        })
    });

    function getIslandRewards(regionId, islandId) {
        return regionRewards[String(regionId)]?.[String(islandId)] || Object.freeze([]);
    }

    function getIslandPrimaryReward(regionId, islandId) {
        return getIslandRewards(regionId, islandId)[0] || null;
    }

    const chestKits = Object.freeze(
        Object.fromEntries(
            Object.values(regionRewards)
                .flatMap((region) => Object.values(region))
                .flat()
                .filter((reward) => reward?.type === "chest" && typeof reward.chestId === "string")
                .map((reward) => [
                    reward.chestId,
                    Object.freeze({
                        id: reward.chestId,
                        items: Object.freeze([])
                    })
                ])
        )
    );

    function getChestKit(chestId) {
        return typeof chestId === "string" ? chestKits[chestId] || null : null;
    }

    TQ.content = Object.freeze({
        campaignTotals: Object.freeze({
            regions: 22,
            islands: 110,
            islandsPerRegion: 5,
            pets: 30,
            chests: 30,
            specialMaps: 5,
            fragmentsPerMap: 4,
            finalMapFragments: 9,
            diamondsPerMapMission: 1000
        }),
        worldRegions,
        getWorldRegion,
        regions,
        regionIdentities,
        islandIdentities,
        getRegionIdentity,
        getIslandIdentity,
        createTemporaryIslandIdentity,
        regionTextMaps,
        getRegionTextMaps,
        regionRewards,
        getIslandRewards,
        getIslandPrimaryReward,
        homeBackgrounds,
        profileFrames,
        gameplayRewards,
        crewMembers,
        chestKits,
        getChestKit,
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
            global: Object.freeze({
                worldMap: "./assets/global/mapa-mundo.png?v=20260920-1808"
            }),
            islandTravel: "./assets/transitions/island-travel.mp4?v=20260920-1335",
            pet: "./assets/pets/axolotl-captain.webp",
            playButton: "./assets/ui/home-pirata-botao-aventura.webp",
            homeOverlay: "./assets/ui/home-art-overlay.webp?v=20260919-2228",
            regionsMap: "./assets/regions/regions-map-base.webp?v=20260920-0318",
            regionsMapStatic: "./assets/regions/regions-map-static.png?v=20260920-0318",
            region1IslandsMapStatic: "./assets/regions/region-1-islands-static.webp?v=20260920-1130",
            region1Modular: Object.freeze({
                background: "./assets/regions/region-1/mapa_marítimo_do_corsário.png?v=20260920-1727",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-1/mapa_marítimo_do_corsário.png?v=20260920-1727"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-01-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-01-locked.png?v=20260920-1628"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-02-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-02-locked.png?v=20260920-1628"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-03-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-03-locked.png?v=20260920-1628"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-04-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-04-locked.png?v=20260920-1628"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-05-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-05-locked.png?v=20260920-1628"
                    })
                })
            }),
            region13Modular: Object.freeze({
                background: "./assets/regions/region-13/background.png?v=20260921-0118",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-13/background.png?v=20260921-0118"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-01-unlocked.png?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-01-locked.png?v=20260921-0102"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-02-unlocked.png?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-02-locked.png?v=20260921-0102"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-03-unlocked.png?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-03-locked.png?v=20260921-0102"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-04-unlocked.png?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-04-locked.png?v=20260921-0102"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-05-unlocked.png?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-05-locked.png?v=20260921-0102"
                    })
                })
            })
        })
    });
})(globalThis);
