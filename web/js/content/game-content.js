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

    const regionNames = Object.freeze([
        "CORSÁRIO",
        "NEBLINAS",
        "CAVEIRAS",
        "NÁUFRAGO",
        "VULCÂNIA",
        "RELÍQUIA",
        "CORALINA",
        "VENTANIA",
        "MURALHAS",
        "ZONA RUBI",
        "FORTALEZA"
    ]);

    const regions = Object.freeze(regionNames.map((label, i) => Object.freeze({
        id: i + 1,
        label,
        islandsTotal: 10,
        isFinalRegion: i === 10
    })));

    const regionIdentities = Object.freeze([
        Object.freeze({
            regionId: 1,
            tagline: "O começo da rota pirata.",
            visualTheme: "portos de madeira, velas, cordas e águas azul-escuras",
            islandNames: Object.freeze(["Porto da Âncora","Enseada do Saque","Rochedo da Bandeira","Ilha do Vulcão","Ilha da Caveira Rosa","Atol do Timão","Ponta da Caravela","Praia das Cordas","Ilha do Canhão","Ilha Lamen"])
        }),
        Object.freeze({
            regionId: 2,
            tagline: "A rota some dentro da névoa.",
            visualTheme: "bruma, lanternas, silhuetas de mastros e luz difusa",
            islandNames: Object.freeze(["Véu de Bruma","Farol Velado","Ponta Cinzenta","Enseada Oculta","Banco de Névoa","Cais do Sussurro","Recife Nublado","Baía Silenciosa","Ilha da Lanterna","Passagem Velada"])
        }),
        Object.freeze({
            regionId: 3,
            tagline: "Pedras antigas vigiam o mar.",
            visualTheme: "rochedos em forma de caveira, cavernas e fósseis marítimos",
            islandNames: Object.freeze(["Pedra da Caveira","Gruta dos Ossos","Baía do Dente","Recife do Crânio","Cais Sombrio","Ponta do Fêmur","Ilha das Costelas","Praia do Eco","Morro da Mandíbula","Porto das Caveiras"])
        }),
        Object.freeze({
            regionId: 4,
            tagline: "Destroços contam histórias de antigas viagens.",
            visualTheme: "navios partidos, mastros quebrados, botes e praias de destroços",
            islandNames: Object.freeze(["Praia dos Destroços","Mastro Partido","Enseada do Bote","Recife Rasgado","Cais Abandonado","Baía dos Barris","Ponta do Casco","Ilha da Vela","Gruta do Náufrago","Porto Reerguido"])
        }),
        Object.freeze({
            regionId: 5,
            tagline: "O mar ferve ao redor das ilhas de fogo.",
            visualTheme: "lava, basalto, cinzas, vapor e praias escuras",
            islandNames: Object.freeze(["Cratera Rubra","Praia de Cinzas","Cais de Basalto","Baía Fumegante","Ponta de Lava","Ilha da Caldeira","Recife de Obsidiana","Gruta Ardente","Porto de Pedra","Coroa Vulcânica"])
        }),
        Object.freeze({
            regionId: 6,
            tagline: "Ruínas guardam tesouros esquecidos.",
            visualTheme: "templos costeiros, pedras douradas, inscrições e relíquias",
            islandNames: Object.freeze(["Templo da Maré","Cais Dourado","Praia das Runas","Arco Antigo","Baía do Ídolo","Ponta do Medalhão","Ilha do Selo","Recife das Colunas","Gruta do Cofre","Santuário das Marés"])
        }),
        Object.freeze({
            regionId: 7,
            tagline: "Um jardim de coral cresce sobre o oceano.",
            visualTheme: "corais coloridos, águas claras, conchas e recifes vivos",
            islandNames: Object.freeze(["Jardim de Coral","Recife Arco-Íris","Praia das Conchas","Baía Turquesa","Atol das Estrelas","Cais das Pérolas","Ponta Anêmona","Ilha do Cavalo-Marinho","Lagoa Cristalina","Coroa de Coral"])
        }),
        Object.freeze({
            regionId: 8,
            tagline: "As correntes de ar mudam a rota a cada instante.",
            visualTheme: "velas infladas, nuvens rápidas, moinhos náuticos e mar agitado",
            islandNames: Object.freeze(["Cabo dos Ventos","Baía da Rajada","Ilha do Catavento","Ponta do Vendaval","Cais das Velas","Recife do Sopro","Praia da Brisa","Canal dos Alísios","Morro do Assobio","Porto da Ventania"])
        }),
        Object.freeze({
            regionId: 9,
            tagline: "Pedra e mar formam uma defesa quase impenetrável.",
            visualTheme: "muros costeiros, torres, portões, pontes e rochedos fortificados",
            islandNames: Object.freeze(["Muralha do Mar","Torre da Maré","Portão de Pedra","Ponte do Vigia","Baía Murada","Cais da Sentinela","Ilha do Bastião","Recife da Guarda","Ponta da Torre","Porto das Muralhas"])
        }),
        Object.freeze({
            regionId: 10,
            tagline: "Cristais vermelhos brilham sob a água.",
            visualTheme: "rochas rubras, cristais, cavernas luminosas e reflexos vermelhos",
            islandNames: Object.freeze(["Costa Rubra","Ilha da Gema","Cais Escarlate","Baía Carmesim","Ponta do Cristal","Recife Granado","Gruta Vermelha","Praia da Faísca","Atol do Rubi","Coroa Escarlate"])
        }),
        Object.freeze({
            regionId: 11,
            tagline: "A última rota leva ao coração da Fortaleza.",
            visualTheme: "fortificação final, torres altas, mar profundo e arquitetura monumental",
            islandNames: Object.freeze(["Portão Exterior","Torre da Vigília","Bastião das Ondas","Ponte do Horizonte","Pátio da Maré","Torre do Farol","Muralha Interna","Cais do Guardião","Portão Final","Coração da Fortaleza"])
        })
    ]);

    const islandIdentities = Object.freeze(
        Object.fromEntries(regionIdentities.map((region) => [
            String(region.regionId),
            Object.freeze(region.islandNames.map((label, index) => Object.freeze({
                id: index + 1,
                regionId: region.regionId,
                label,
                sceneKey: `r${region.regionId}-i${index + 1}`,
                challengeIdentity: "mixed"
            })))
        ]))
    );

    function getRegionIdentity(regionId) {
        return regionIdentities.find((item) => item.regionId === Number(regionId)) || null;
    }

    function getIslandIdentity(regionId, islandId) {
        return islandIdentities[String(regionId)]?.[Number(islandId) - 1] || null;
    }

    const regionRewards = Object.freeze({
        "1": Object.freeze({
            "1": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i1" })]),
            "2": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 1 })]),
            "3": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i3" })]),
            "4": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i4" })]),
            "5": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 2 })]),
            "6": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i6" })]),
            "7": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r1-i7" })]),
            "8": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 3 })]),
            "9": Object.freeze([Object.freeze({ type: "chest", chestId: "chest-r1-i9" })]),
            "10": Object.freeze([Object.freeze({ type: "map_fragment", mapId: 1, fragment: 4 })])
        })
    });

    function getIslandRewards(regionId, islandId) {
        return regionRewards[String(regionId)]?.[String(islandId)] || Object.freeze([]);
    }

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
        regionIdentities,
        islandIdentities,
        getRegionIdentity,
        getIslandIdentity,
        regionRewards,
        getIslandRewards,
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
                    }),
                    6: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-06-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-06-locked.png?v=20260920-1628"
                    }),
                    7: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-07-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-07-locked.png?v=20260920-1628"
                    }),
                    8: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-08-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-08-locked.png?v=20260920-1628"
                    }),
                    9: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-09-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-09-locked.png?v=20260920-1628"
                    }),
                    10: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-10-unlocked.png?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-10-locked.png?v=20260920-1628"
                    })
                })
            })
        })
    });
})(globalThis);
