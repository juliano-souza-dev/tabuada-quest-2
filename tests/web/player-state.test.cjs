const test = require("node:test");
const assert = require("node:assert/strict");

global.TabuadaQuest = {};
require("../../web/js/domain/player-state.js");

const domain = global.TabuadaQuest.domain.playerState;

test("estado inicial usa schema v4 com HUD dinâmico e moldura simples", () => {
    const state = domain.createInitialState();

    assert.equal(state.schemaVersion, 4);
    assert.equal(state.player.displayName, "Explorador");
    assert.equal(state.player.avatarId, "luna");
    assert.equal(state.player.profileFrameId, "simple");
    assert.equal(state.progression.level, 1);
    assert.equal(state.progression.xpCurrent, 0);
    assert.equal(state.progression.xpRequired, 100);
    assert.equal(state.wallet.coins, 0);
    assert.equal(state.wallet.gems, 0);
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});

test("migra estado v2 até v4 preservando HUD e adotando moldura simples", () => {
    const old = {
        schemaVersion: 2,
        player: {
            id: "local-player",
            displayName: "Marujo",
            avatarId: "maya"
        },
        campaign: {
            currentRegionId: 1,
            currentIslandId: 1,
            unlockedRegionIds: [1],
            completedIslandIds: [],
            petsRescuedIds: [],
            claimedChestIds: [],
            specialMaps: {
                "1": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
                "2": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
                "3": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
                "4": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
                "5": { fragments: 0, missionStatus: "collecting", rewardClaimed: false }
            },
            diamonds: 0
        },
        ui: {
            lastScreen: "home",
            homeBackgroundId: "pirate-main"
        }
    };

    const migrated = domain.normalizeState(old);

    assert.equal(migrated.schemaVersion, 4);
    assert.equal(migrated.player.displayName, "Marujo");
    assert.equal(migrated.player.avatarId, "maya");
    assert.equal(migrated.player.profileFrameId, "simple");
    assert.equal(migrated.ui.homeBackgroundId, "pirate-main");
    assert.equal(migrated.progression.level, 1);
    assert.equal(migrated.wallet.coins, 0);
    assert.equal(migrated.wallet.gems, 0);
});

test("migra antigo padrão pirate-treasure do schema v3 para simple", () => {
    const base = domain.createInitialState();
    const old = {
        ...base,
        schemaVersion: 3,
        player: {
            ...base.player,
            profileFrameId: "pirate-treasure"
        }
    };

    const migrated = domain.normalizeState(old);

    assert.equal(migrated.schemaVersion, 4);
    assert.equal(migrated.player.profileFrameId, "simple");
});

test("preserva moldura decorativa explicitamente diferente durante migração v3", () => {
    const base = domain.createInitialState();
    const old = {
        ...base,
        schemaVersion: 3,
        player: {
            ...base.player,
            profileFrameId: "tide-wheel"
        }
    };

    const migrated = domain.normalizeState(old);

    assert.equal(migrated.player.profileFrameId, "tide-wheel");
});

test("troca fundo somente quando o id pertence ao catálogo permitido", () => {
    const state = domain.createInitialState();
    const changed = domain.withHomeBackground(state, "sunset-bay", ["pirate-main", "sunset-bay"]);
    const rejected = domain.withHomeBackground(changed, "unknown", ["pirate-main", "sunset-bay"]);

    assert.equal(changed.ui.homeBackgroundId, "sunset-bay");
    assert.equal(rejected.ui.homeBackgroundId, "sunset-bay");
});

test("troca moldura somente quando o id pertence ao catálogo permitido", () => {
    const state = domain.createInitialState();
    const changed = domain.withProfileFrame(state, "tide-wheel", ["simple", "tide-wheel"]);
    const rejected = domain.withProfileFrame(changed, "unknown", ["simple", "tide-wheel"]);

    assert.equal(changed.player.profileFrameId, "tide-wheel");
    assert.equal(rejected.player.profileFrameId, "tide-wheel");
});

test("estado inválido volta para o inicial sem conceder recursos", () => {
    const state = domain.normalizeState({
        schemaVersion: 999,
        wallet: { coins: 9999, gems: 9999 }
    });

    assert.equal(state.schemaVersion, 4);
    assert.equal(state.wallet.coins, 0);
    assert.equal(state.wallet.gems, 0);
    assert.equal(state.campaign.diamonds, 0);
});
