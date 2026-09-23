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

    const shopCatalog = Object.freeze({
        tabs: Object.freeze([
            Object.freeze({ id: "frames", label: "Molduras" }),
            Object.freeze({ id: "backgrounds", label: "Fundos" }),
            Object.freeze({ id: "shipyard", label: "Estaleiro" }),
            Object.freeze({ id: "effects", label: "Efeitos" })
        ]),
        frames: Object.freeze([
            Object.freeze({ id: "frame-ancora-dourada", type: "frame", label: "Âncora Dourada", price: 250, asset: null }),
            Object.freeze({ id: "frame-coroa-corsaria", type: "frame", label: "Coroa Corsária", price: 450, asset: null }),
            Object.freeze({ id: "frame-mare-de-safira", type: "frame", label: "Maré de Safira", price: 700, asset: null }),
            Object.freeze({ id: "frame-rubi-do-capitao", type: "frame", label: "Rubi do Capitão", price: 1000, asset: null }),
            Object.freeze({ id: "frame-lenda-do-kraken", type: "frame", label: "Lenda do Kraken", price: 1400, asset: null })
        ]),
        backgrounds: Object.freeze([
            Object.freeze({ id: "background-enseada-dourada", type: "background", label: "Enseada Dourada", price: 400, asset: null }),
            Object.freeze({ id: "background-porto-esmeralda", type: "background", label: "Porto Esmeralda", price: 650, asset: null }),
            Object.freeze({ id: "background-mar-rubi", type: "background", label: "Mar Rubi", price: 900, asset: null }),
            Object.freeze({ id: "background-noite-do-kraken", type: "background", label: "Noite do Kraken", price: 1300, asset: null }),
            Object.freeze({ id: "background-horizonte-celeste", type: "background", label: "Horizonte Celeste", price: 1800, asset: null })
        ]),
        ships: Object.freeze([
            Object.freeze({ id: "ship-colombo", type: "ship", label: "El Colombo", price: 1000, asset: "./assets/transitions/el-colombo/images/el-colombo.webp", travelAnimation: "./assets/transitions/el-colombo/el-colombo-ocean-navigation.json", travelBackground: "./assets/transitions/el-colombo/images/ocean-background.webp" }),
            Object.freeze({ id: "ship-rosa-intenso", type: "ship", label: "Rosa Intenso", price: 3000, asset: null, travelAnimation: null }),
            Object.freeze({ id: "ship-cristal-queen", type: "ship", label: "Cristal Queen", price: 9000, asset: null, travelAnimation: null })
        ]),
        get effects() {
            return TQ.effects?.shopCatalog || [];
        }
    });

    function getShopItem(itemId) {
        const id = String(itemId);
        return [
            ...shopCatalog.frames,
            ...shopCatalog.backgrounds,
            ...shopCatalog.ships,
            ...shopCatalog.effects
        ].find((item) => item.id === id) || null;
    }

    const rubyShopDefaultUnlockRule = Object.freeze({
        type: "after_island",
        islandId: 1
    });

    const rubyShopUnlockRulesByRegion = Object.freeze({
        // Adicionar somente exceções aprovadas por Produto.
        // Ex.: "5": Object.freeze({ type: "after_island", islandId: 3 })
    });

    const rubyShopCatalog = Object.freeze({
        mode: "local",
        enabledRegionIds: Object.freeze([1, 5, 9, 13, 17, 21]),
        defaultUnlockRule: rubyShopDefaultUnlockRule,
        unlockRulesByRegion: rubyShopUnlockRulesByRegion,
        items: Object.freeze([
            Object.freeze({
                id: "ruby-physical-stickers-dev",
                label: "Kit de Adesivos Piratas",
                priceRubies: 20,
                fulfillment: "physical",
                asset: null,
                isDevelopmentItem: true,
                available: true
            }),
            Object.freeze({
                id: "ruby-physical-keychain-dev",
                label: "Chaveiro Rubi",
                priceRubies: 40,
                fulfillment: "physical",
                asset: null,
                isDevelopmentItem: true,
                available: true
            }),
            Object.freeze({
                id: "ruby-physical-shirt-dev",
                label: "Camiseta do Capitão",
                priceRubies: 80,
                fulfillment: "physical",
                asset: null,
                isDevelopmentItem: true,
                available: true
            })
        ])
    });

    function getRubyShopItem(itemId) {
        const id = String(itemId);
        return rubyShopCatalog.items.find((item) => item.id === id) || null;
    }

    function regionHasRubyShop(regionId) {
        return rubyShopCatalog.enabledRegionIds.includes(Number(regionId));
    }

    function getRubyShopUnlockRule(regionId) {
        const normalizedRegionId = Number(regionId);
        if (!Number.isInteger(normalizedRegionId)) return rubyShopCatalog.defaultUnlockRule;
        return rubyShopCatalog.unlockRulesByRegion[String(normalizedRegionId)]
            || rubyShopCatalog.defaultUnlockRule;
    }

    function describeRubyShopUnlockRule(rule) {
        if (!rule || typeof rule !== "object") return "Conclua a Ilha 1 desta Região.";
        if (rule.type === "after_island" && Number.isInteger(rule.islandId)) {
            return `Conclua a Ilha ${rule.islandId} desta Região.`;
        }
        if (rule.type === "after_completed_islands" && Number.isInteger(rule.count)) {
            return `Conclua ${rule.count} Ilha${rule.count === 1 ? "" : "s"} desta Região.`;
        }
        if (rule.type === "after_region_complete") {
            return "Conclua todas as Ilhas desta Região.";
        }
        return "Conclua a Ilha 1 desta Região.";
    }

    const gameplayRewards = Object.freeze({
        xpPerCompletedMatch: 20,
        coinsPerCorrectAnswer: 10,
        coinsPenaltyPerWrongAnswer: 2,
        finalChestRubies: 5000,
        specialMissionRubiesPerCorrect: 2,
        collectibles: Object.freeze({
            twoItemMaxErrorPercent: 20,
            pendingPerNormalChest: 1,
            bonusAtHalfCollectionPercent: 10,
            bonusAtFullCollectionPercent: 25
        })
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

    const collectibles = Object.freeze([
        Object.freeze({ id: "collectible-001", label: "Bússola do Corsário", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-002", label: "Bússola da Maré Azul", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-003", label: "Bússola do Capitão", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-004", label: "Bússola da Ilha Perdida", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-005", label: "Bússola de Bronze", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-006", label: "Bússola da Tempestade", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-007", label: "Bússola da Lua", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-008", label: "Bússola do Horizonte", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-009", label: "Bússola das Sete Rotas", category: "Bússola", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-010", label: "Pedra da Maré", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-011", label: "Pedra de Coral", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-012", label: "Pedra do Farol", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-013", label: "Pedra da Tempestade", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-014", label: "Pedra de Obsidiana", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-015", label: "Pedra Rubra", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-016", label: "Pedra de Safira", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-017", label: "Pedra Esmeralda", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-018", label: "Pedra da Lua", category: "Pedra", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-019", label: "Moeda do Porto", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-020", label: "Moeda do Corsário", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-021", label: "Moeda do Capitão", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-022", label: "Moeda da Coroa", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-023", label: "Moeda das Marés", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-024", label: "Moeda do Kraken", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-025", label: "Moeda da Fênix", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-026", label: "Moeda do Dragão", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-027", label: "Moeda Celeste", category: "Moeda", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-028", label: "Luneta do Navegador", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-029", label: "Luneta de Bronze", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-030", label: "Luneta do Horizonte", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-031", label: "Luneta da Tempestade", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-032", label: "Luneta do Farol", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-033", label: "Luneta das Estrelas", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-034", label: "Luneta da Lua", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-035", label: "Luneta do Corsário", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-036", label: "Luneta do Capitão", category: "Luneta", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-037", label: "Medalhão da Âncora", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-038", label: "Medalhão do Timão", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-039", label: "Medalhão do Kraken", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-040", label: "Medalhão da Fênix", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-041", label: "Medalhão do Dragão", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-042", label: "Medalhão da Coroa", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-043", label: "Medalhão das Marés", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-044", label: "Medalhão Celeste", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-045", label: "Medalhão do Corsário", category: "Medalhão", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-046", label: "Chave do Baú Antigo", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-047", label: "Chave do Porto", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-048", label: "Chave da Âncora", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-049", label: "Chave do Farol", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-050", label: "Chave do Capitão", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-051", label: "Chave Rubra", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-052", label: "Chave de Obsidiana", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-053", label: "Chave Celeste", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-054", label: "Chave das Marés", category: "Chave", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-055", label: "Astrolábio de Bronze", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-056", label: "Astrolábio do Capitão", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-057", label: "Astrolábio das Estrelas", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-058", label: "Astrolábio da Lua", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-059", label: "Astrolábio da Tempestade", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-060", label: "Astrolábio do Horizonte", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-061", label: "Astrolábio do Corsário", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-062", label: "Astrolábio Celeste", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-063", label: "Astrolábio das Marés", category: "Astrolábio", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-064", label: "Concha Pérola", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-065", label: "Concha Coral", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-066", label: "Concha da Lua", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-067", label: "Concha da Maré", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-068", label: "Concha Celeste", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-069", label: "Concha Rubra", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-070", label: "Concha Esmeralda", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-071", label: "Concha Safira", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-072", label: "Concha do Corsário", category: "Concha", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-073", label: "Relíquia do Timão", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-074", label: "Relíquia da Âncora", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-075", label: "Relíquia do Farol", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-076", label: "Relíquia do Porto", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-077", label: "Relíquia do Capitão", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-078", label: "Relíquia do Kraken", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-079", label: "Relíquia da Fênix", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-080", label: "Relíquia do Dragão", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-081", label: "Relíquia das Marés", category: "Relíquia", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-082", label: "Selo do Capitão", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-083", label: "Selo do Corsário", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-084", label: "Selo da Coroa", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-085", label: "Selo do Kraken", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-086", label: "Selo da Fênix", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-087", label: "Selo do Dragão", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-088", label: "Selo Celeste", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-089", label: "Selo da Maré", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null }),
        Object.freeze({ id: "collectible-090", label: "Selo da Tempestade", category: "Selo", bonusTypes: Object.freeze(["xp", "coins", "gems"]), asset: null })
    ]);

    function getCollectible(collectibleId) {
        return collectibles.find((item) => item.id === String(collectibleId)) || null;
    }

    const worldRegions = Object.freeze([
        Object.freeze({ id: 1, label: "CORSÁRIO" }),
        Object.freeze({ id: 2, label: "BIRADES" }),
        Object.freeze({ id: 3, label: "ZONA OURO" }),
        Object.freeze({ id: 4, label: "TERRAS GÉLIDAS" }),
        Object.freeze({ id: 5, label: "ZONA SAFIRA" }),
        Object.freeze({ id: 6, label: "VALE ESMERALDA" }),
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
        "1": Object.freeze([
            "Enseada da Bandeira",
            "Enseada do Saque",
            "Refúgio da Bandeira",
            "Ilha do Vulcão",
            "Ilha da Caveira Rosa"
        ]),
        "2": Object.freeze([
            "Porto Desengonçado",
            "Baía dos Bichos Piratas",
            "Farol Torto",
            "Fortaleza das Tralhas",
            "Cabo do Mapa Impossível"
        ]),
        "13": Object.freeze([
            "Rocha Negra",
            "Cinzas",
            "Fogo Obsidiano",
            "Cratera",
            "Coração de Obsidiana"
        ]),
        "14": Object.freeze([
            "Carmesim",
            "Coroa Rubi",
            "Pedras Rosada",
            "Pedras Rubras",
            "Rubi do Rei"
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
            "2": Object.freeze([Object.freeze({ type: "pet", petId: "pet-r2-i2" })]),
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
            "4": Object.freeze([Object.freeze({ type: "ruby" })]),
            "5": Object.freeze([Object.freeze({ type: "chest", chestId: "final-grand-chest", isFinalChest: true })])
        })
    });

    function getIslandRewards(regionId, islandId) {
        return regionRewards[String(regionId)]?.[String(islandId)] || Object.freeze([]);
    }

    function getIslandPrimaryReward(regionId, islandId) {
        return getIslandRewards(regionId, islandId)[0] || null;
    }

    const petRewards = Object.freeze(
        Object.values(regionRewards)
            .flatMap((region) => Object.values(region))
            .flat()
            .filter((reward) => reward?.type === "pet" && typeof reward.petId === "string")
    );

    const petBonusTotals = Object.freeze({
        xp: 100,
        coins: 50,
        gems: 10
    });

    // Os 30 PETs alternam entre três bônus permanentes.
    // Com a coleção completa: +100% XP, +50% Ouro e +10% Rubis.
    const petBonusRotation = Object.freeze([
        Object.freeze({ type: "xp", percent: 10, label: "⭐ +10% XP" }),
        Object.freeze({ type: "coins", percent: 5, label: "🪙 +5% Ouro" }),
        Object.freeze({ type: "gems", percent: 1, label: "💎 +1% Rubis" })
    ]);

    const petVisualCatalog = Object.freeze({
        "pet-r1-i1": Object.freeze({ label: "Capitão Axolote", asset: "./assets/pets/axolotl-captain.webp" }),
        "pet-r1-i4": Object.freeze({ label: "Pluma", asset: "./assets/pets/pluma.webp" }),
        "pet-r2-i2": Object.freeze({ label: "Faísca", asset: "./assets/pets/faisca.webp" }),
        "pet-r3-i2": Object.freeze({ label: "Marujo", asset: "./assets/pets/marujo.webp" }),
        "pet-r3-i5": Object.freeze({ label: "Coral", asset: "./assets/pets/coral.webp" }),
        "pet-r4-i4": Object.freeze({ label: "Pingo", asset: "./assets/pets/pingo.webp" }),
        "pet-r5-i1": Object.freeze({ label: "Trovão", asset: "./assets/pets/trovao.webp" }),
        "pet-r5-i4": Object.freeze({ label: "Rubi", asset: "./assets/pets/rubi.webp" }),
        "pet-r6-i2": Object.freeze({ label: "Pirilampo", asset: "./assets/pets/pirilampo.webp" }),
        "pet-r7-i3": Object.freeze({ label: "Bolota", asset: "./assets/pets/bolota.webp" }),
        "pet-r8-i2": Object.freeze({ label: "Brisa", asset: "./assets/pets/brisa.webp" }),
        "pet-r9-i1": Object.freeze({ label: "Dourado", asset: "./assets/pets/dourado.webp" }),
        "pet-r9-i4": Object.freeze({ label: "Pipoca", asset: "./assets/pets/pipoca.webp" }),
        "pet-r10-i2": Object.freeze({ label: "Cascalho", asset: "./assets/pets/cascalho.webp" }),
        "pet-r11-i2": Object.freeze({ label: "Estrela", asset: "./assets/pets/estrela.webp" }),
        "pet-r11-i5": Object.freeze({ label: "Fumaça", asset: "./assets/pets/fumaca.webp" }),
        "pet-r12-i4": Object.freeze({ label: "Pérola", asset: "./assets/pets/perola.webp" }),
        "pet-r13-i1": Object.freeze({ label: "Farofa", asset: "./assets/pets/farofa.webp" }),
        "pet-r13-i4": Object.freeze({ label: "Tempestade", asset: "./assets/pets/tempestade.webp" }),
        "pet-r14-i2": Object.freeze({ label: "Biscoito", asset: "./assets/pets/biscoito.webp" }),
        "pet-r15-i3": Object.freeze({ label: "Oceano", asset: "./assets/pets/oceano.webp" }),
        "pet-r16-i2": Object.freeze({ label: "Canela", asset: "./assets/pets/canela.webp" }),
        "pet-r17-i2": Object.freeze({ label: "Relâmpago", asset: "./assets/pets/relampago.webp" }),
        "pet-r17-i5": Object.freeze({ label: "Bambuzinho", asset: "./assets/pets/bambuzinho.webp" }),
        "pet-r18-i4": Object.freeze({ label: "Tesouro", asset: "./assets/pets/tesouro.webp" }),
        "pet-r19-i1": Object.freeze({ label: "Azulão", asset: "./assets/pets/azulao.webp" }),
        "pet-r19-i4": Object.freeze({ label: "Cacau", asset: "./assets/pets/cacau.webp" }),
        "pet-r20-i2": Object.freeze({ label: "Capitão", asset: "./assets/pets/capitao.webp" }),
        "pet-r21-i3": Object.freeze({ label: "Jujuba", asset: "./assets/pets/jujuba.webp" }),
        "pet-r22-i2": Object.freeze({ label: "Farol", asset: "./assets/pets/farol.webp" })
    });

    const pets = Object.freeze(
        petRewards.map((reward, index) => {
            const bonus = petBonusRotation[index % petBonusRotation.length];
            const visual = petVisualCatalog[reward.petId] || null;
            return Object.freeze({
                id: reward.petId,
                label: visual?.label || `Pet ${String(index + 1).padStart(2, "0")}`,
                asset: visual?.asset || null,
                bonus: Object.freeze({
                    type: bonus.type,
                    percent: bonus.percent,
                    label: bonus.label
                })
            });
        })
    );

    function getPet(petId) {
        return pets.find((pet) => pet.id === String(petId)) || null;
    }

    const chestRewards = Object.freeze(
        Object.values(regionRewards)
            .flatMap((region) => Object.values(region))
            .flat()
            .filter((reward) => reward?.type === "chest" && typeof reward.chestId === "string")
    );

    const chestKits = Object.freeze(
        Object.fromEntries(
            chestRewards.map((reward, index) => [
                reward.chestId,
                Object.freeze({
                    id: reward.chestId,
                    isFinalChest: Boolean(reward.isFinalChest),
                    items: Object.freeze(
                        collectibles
                            .slice(index * 3, (index * 3) + 3)
                            .map((item) => Object.freeze({
                                type: "collectible",
                                collectibleId: item.id,
                                label: item.label
                            }))
                    )
                })
            ])
        )
    );

    function getChestKit(chestId) {
        return typeof chestId === "string" ? chestKits[chestId] || null : null;
    }

    TQ.content = Object.freeze({
        development: Object.freeze({ shortcutsEnabled: true }),
        campaignTotals: Object.freeze({
            regions: 22,
            islands: 110,
            islandsPerRegion: 5,
            pets: 30,
            chests: 30,
            rubies: 30,
            collectibles: 90,
            specialMaps: 5,
            fragmentsPerMap: 4,
            finalMapFragments: 9,
            specialMissionRubiesPerCorrect: 2
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
        shopCatalog,
        getShopItem,
        rubyShopCatalog,
        getRubyShopItem,
        regionHasRubyShop,
        getRubyShopUnlockRule,
        describeRubyShopUnlockRule,
        gameplayRewards,
        crewMembers,
        petVisualCatalog,
        pets,
        petBonusTotals,
        getPet,
        collectibles,
        getCollectible,
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
                worldMap: "./assets/global/mapa-mundo.png?v=20260920-1808",
                worldMapVisual: "./assets/global/carta-nautica-01-regioes-01-04.webp?v=20260923-carta-nautica-pages-v1",
                worldMapCharts: Object.freeze([
                    Object.freeze({ id: 1, regionIds: Object.freeze([1, 2, 3, 4]), asset: "./assets/global/carta-nautica-01-regioes-01-04.webp?v=20260923-carta-nautica-pages-v1" }),
                    Object.freeze({ id: 2, regionIds: Object.freeze([5, 6, 7, 8]), asset: "./assets/global/carta-nautica-02-regioes-05-08.webp?v=20260923-carta-nautica-pages-v1" }),
                    Object.freeze({ id: 3, regionIds: Object.freeze([9, 10, 11, 12]), asset: "./assets/global/carta-nautica-03-regioes-09-12.webp?v=20260923-carta-nautica-pages-v1" }),
                    Object.freeze({ id: 4, regionIds: Object.freeze([13, 14, 15, 16]), asset: "./assets/global/carta-nautica-04-regioes-13-16.webp?v=20260923-carta-nautica-pages-v1" }),
                    Object.freeze({ id: 6, regionIds: Object.freeze([21, 22]), asset: "./assets/global/carta-nautica-06-regioes-21-22.webp?v=20260923-carta-nautica-pages-v1" })
                ]),
                rubyShopMerchantShip: "./assets/global/comercial_ship.webp?v=20260921-1720",
                victoryScreen: "./assets/global/gb_win.webp?v=20260921-2028",
                petRescueScreen: "./assets/global/pet_rescue_screen.webp?v=20260922-pet-rescue-v1"
            }),
            tavern: Object.freeze({
                background: "./assets/tavern/tavern-background.webp?v=20260923-tavern-art-v4"
            }),
            islandTravelAnimation: "./assets/transitions/el-colombo/el-colombo-ocean-navigation.json",
            pet: "./assets/pets/axolotl-captain.webp",
            playButton: "./assets/ui/home-pirata-botao-aventura.webp",
            homeOverlay: "./assets/ui/home-art-overlay.webp?v=20260923-home-overlay-v2",
            region1ChallengeArt: Object.freeze({
                1: "./assets/regions/region-1/challenges/corsario-enseada-da-bandeira-challenge-bg.webp?v=20260922-corsario-challenge-v4",
                2: "./assets/regions/region-1/challenges/corsario-enseada-do-saque-challenge-bg.webp?v=20260922-corsario-challenge-v4",
                3: "./assets/regions/region-1/challenges/corsario-refugio-da-bandeira-challenge-bg.webp?v=20260922-corsario-challenge-v4",
                4: "./assets/regions/region-1/challenges/corsario-ilha-do-vulcao-challenge-bg.webp?v=20260922-corsario-challenge-v4",
                5: "./assets/regions/region-1/challenges/ilha_da_caveira_rosa.webp?v=20260922-corsario-challenge-v4"
            }),
            region2ChallengeArt: Object.freeze({
                1: "./assets/regions/region-2/challenges/island-01-challenge.webp?v=20260922-birades-challenge",
                2: "./assets/regions/region-2/challenges/island-02-challenge.webp?v=20260922-birades-challenge",
                3: "./assets/regions/region-2/challenges/island-03-challenge.webp?v=20260922-birades-challenge",
                4: "./assets/regions/region-2/challenges/island-04-challenge.webp?v=20260922-birades-challenge",
                5: "./assets/regions/region-2/challenges/island-05-challenge.webp?v=20260922-birades-challenge"
            }),
            region1Modular: Object.freeze({
                background: "./assets/regions/region-1/background.webp?v=20260920-1727",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-1/background.webp?v=20260920-1727"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-01-unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-1/island-01-locked.webp?v=20260921-issue88"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-02-unlocked.webp?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-02-locked.webp?v=20260920-1628"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-03-unlocked.webp?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-03-locked.webp?v=20260920-1628"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-04-unlocked.webp?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-04-locked.webp?v=20260920-1628"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-1/island-05-unlocked.webp?v=20260920-1628",
                        locked: "./assets/regions/region-1/island-05-locked.webp?v=20260920-1628"
                    })
                })
            }),
            region2Modular: Object.freeze({
                background: "./assets/regions/region-2/background.webp?v=20260922-birades",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-2/background.webp?v=20260922-birades"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-2/porto_desengoncado_unlocked.webp?v=20260922-birades",
                        locked: "./assets/regions/region-2/porto_desengoncado_locked.webp?v=20260922-birades"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-2/baia_dos_bichos_piratas_unlocked.webp?v=20260922-birades",
                        locked: "./assets/regions/region-2/baia_dos_bichos_piratas_locked.webp?v=20260922-birades"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-2/farol_torto_unlocked.webp?v=20260922-birades",
                        locked: "./assets/regions/region-2/farol_torto_locked.webp?v=20260922-birades"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-2/fortaleza_das_tralhas_unlocked.webp?v=20260922-birades",
                        locked: "./assets/regions/region-2/fortaleza_das_tralhas_locked.webp?v=20260922-birades"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-2/cabo_do_mapa_impossivel_unlocked.webp?v=20260922-birades",
                        locked: "./assets/regions/region-2/cabo_do_mapa_impossivel_locked.webp?v=20260922-birades"
                    })
                })
            }),
            region3Modular: Object.freeze({
                background: "./assets/regions/region-3/background.webp?v=20260922-region3-gold",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-3/background.webp?v=20260922-region3-gold"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-3/costa_dourada_unlocked.webp?v=20260922-region3-gold",
                        locked: "./assets/regions/region-3/costa_dourada_locked.webp?v=20260922-region3-gold"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-3/minas_de_aurum_unlocked.webp?v=20260922-region3-gold",
                        locked: "./assets/regions/region-3/minas_de_aurum_locked.webp?v=20260922-region3-gold"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-3/coroa_solar_unlocked.webp?v=20260922-region3-gold",
                        locked: "./assets/regions/region-3/coroa_solar_locked.webp?v=20260922-region3-gold"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-3/templo_aureo_unlocked.webp?v=20260922-region3-gold",
                        locked: "./assets/regions/region-3/templo_aureo_locked.webp?v=20260922-region3-gold"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-3/ouro_do_rei_unlocked.webp?v=20260922-region3-gold",
                        locked: "./assets/regions/region-3/ouro_do_rei_locked.webp?v=20260922-region3-gold"
                    })
                })
            }),
            region4Modular: Object.freeze({
                background: "./assets/regions/region-4/region-04-background-v2.webp?v=20260923-terras-gelidas-bg-v2-corrected-1",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-4/region-04-background-v2.webp?v=20260923-terras-gelidas-bg-v2-corrected-1"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-4/porto-da-geada-unlocked.webp?v=20260922-terras-gelidas-porto-v2",
                        locked: "./assets/regions/region-4/porto-da-geada-locked.webp?v=20260922-terras-gelidas-porto-v2"
                    }),
                    2: Object.freeze({
              unlocked: "./assets/regions/region-4/baia-do-cristal-unlocked.webp?v=20260923-terras-gelidas-baia-v1",
              locked: "./assets/regions/region-4/baia-do-cristal-locked.webp?v=20260923-terras-gelidas-baia-v1"
          }),
                    3: Object.freeze({
              unlocked: "./assets/regions/region-4/rochedo-boreal-unlocked.webp?v=20260923-terras-gelidas-rochedo-v1",
              locked: "./assets/regions/region-4/rochedo-boreal-locked.webp?v=20260923-terras-gelidas-rochedo-v1"
          }),
                    5: Object.freeze({
              unlocked: "./assets/regions/region-4/coroa-do-inverno-locked.webp?v=20260923-terras-gelidas-ilha5-v2-swap",
              locked: "./assets/regions/region-4/coroa-do-inverno-unlocked.webp?v=20260923-terras-gelidas-ilha5-v2-swap"
          }),
                    4: Object.freeze({
              unlocked: "./assets/regions/region-4/island-04-unlocked.webp?v=20260923-terras-gelidas-ilha4-final",
              locked: "./assets/regions/region-4/island-04-locked.webp?v=20260923-terras-gelidas-ilha4-final"
          })
                })
            }),
            region13Modular: Object.freeze({
                background: "./assets/regions/region-13/background.webp?v=20260921-0118",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-13/background.webp?v=20260921-0118"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-01-unlocked.webp?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-01-locked.webp?v=20260921-0102"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-02-unlocked.webp?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-02-locked.webp?v=20260921-0102"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-03-unlocked.webp?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-03-locked.webp?v=20260921-0102"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-04-unlocked.webp?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-04-locked.webp?v=20260921-0102"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-13/island-05-unlocked.webp?v=20260921-0102",
                        locked: "./assets/regions/region-13/island-05-locked.webp?v=20260921-0102"
                    })
                })
            }),
            region14Modular: Object.freeze({
                background: "./assets/regions/region-14/background.webp?v=20260921-issue88",
                backgrounds: Object.freeze({
                    1: "./assets/regions/region-14/background.webp?v=20260921-issue88"
                }),
                islands: Object.freeze({
                    1: Object.freeze({
                        unlocked: "./assets/regions/region-14/carmesim_unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-14/carmesim_locked.webp?v=20260921-issue88"
                    }),
                    2: Object.freeze({
                        unlocked: "./assets/regions/region-14/coroa_rubi_unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-14/coroa_rubi_locked.webp?v=20260921-issue88"
                    }),
                    3: Object.freeze({
                        unlocked: "./assets/regions/region-14/pedras_rosada_unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-14/pedras_rosada_locked.webp?v=20260921-issue88"
                    }),
                    4: Object.freeze({
                        unlocked: "./assets/regions/region-14/pedras_rubras_unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-14/pedras_rubras_locked.webp?v=20260921-issue88"
                    }),
                    5: Object.freeze({
                        unlocked: "./assets/regions/region-14/rubi_do_rei_unlocked.webp?v=20260921-issue88",
                        locked: "./assets/regions/region-14/rubi_do_rei_locked.webp?v=20260921-issue88"
                    })
                })
            })
        })
    });
})(globalThis);
