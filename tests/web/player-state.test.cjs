const test = require("node:test");
const assert = require("node:assert/strict");

global.TabuadaQuest = {};
require("../../web/js/domain/player-state.js");

const domain = global.TabuadaQuest.domain.playerState;

test("estado inicial usa schema v3 com HUD dinâmico e personalização visual", () => {
    const state = domain.createInitialState();

    assert.equal(state.schemaVersion, 3);
    assert.equal(state.player.displayName, "Explorador");
    assert.equal(state.player.avatarId, "luna");
    assert.equal(state.player.profileFrameId, "pirate-treasure");
    assert.equal(state.progression.level, 1);
    assert.equal(state.progression.xpCurrent, 0);
    assert.equal(state.progression.xpRequired, 100);
    assert.equal(state.wallet.coins, 0);
    assert.equal(state.wallet.gems, 0);
    assert.equal(state.ui.homeBackgroundId, "pirate-main");
});

test("migra estado v2 preservando fundo e adicionando moldura/HUD", () => {
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

    assert.equal(migrated.schemaVersion, 3);
    assert.equal(migrated.player.displayName, "Marujo");
    assert.equal(migrated.player.avatarId, "maya");
    assert.equal(migrated.player.profileFrameId, "pirate-treasure");
    assert.equal(migrated.ui.homeBackgroundId, "pirate-main");
    assert.equal(migrated.progression.level, 1);
    assert.equal(migrated.wallet.coins, 0);
    assert.equal(migrated.wallet.gems, 0);
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
    const changed = domain.withProfileFrame(state, "royal-rope", ["pirate-treasure", "royal-rope"]);
    const rejected = domain.withProfileFrame(changed, "unknown", ["pirate-treasure", "royal-rope"]);

    assert.equal(changed.player.profileFrameId, "royal-rope");
    assert.equal(rejected.player.profileFrameId, "royal-rope");
});

test("estado inválido volta para o inicial sem conceder recursos", () => {
    const state = domain.normalizeState({
        schemaVersion: 999,
        wallet: { coins: 9999, gems: 9999 }
    });

    assert.equal(state.schemaVersion, 3);
    assert.equal(state.wallet.coins, 0);
    assert.equal(state.wallet.gems, 0);
    assert.equal(state.campaign.diamonds, 0);
});
