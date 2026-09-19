(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STATE_VERSION = 1;

    function createSpecialMaps() {
        return {
            "1": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
            "2": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
            "3": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
            "4": { fragments: 0, missionStatus: "collecting", rewardClaimed: false },
            "5": { fragments: 0, missionStatus: "collecting", rewardClaimed: false }
        };
    }

    function createInitialState() {
        return {
            schemaVersion: STATE_VERSION,
            player: {
                id: "local-player",
                displayName: "Explorador",
                avatarId: "luna"
            },
            campaign: {
                currentRegionId: 1,
                currentIslandId: 1,
                unlockedRegionIds: [1],
                completedIslandIds: [],
                petsRescuedIds: [],
                claimedChestIds: [],
                specialMaps: createSpecialMaps(),
                diamonds: 0
            },
            ui: {
                lastScreen: "home"
            }
        };
    }

    function isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function isValidState(value) {
        return Boolean(
            isPlainObject(value) &&
            value.schemaVersion === STATE_VERSION &&
            isPlainObject(value.player) &&
            typeof value.player.displayName === "string" &&
            typeof value.player.avatarId === "string" &&
            isPlainObject(value.campaign) &&
            Number.isInteger(value.campaign.currentRegionId) &&
            Number.isInteger(value.campaign.currentIslandId) &&
            Array.isArray(value.campaign.unlockedRegionIds) &&
            Array.isArray(value.campaign.completedIslandIds) &&
            Array.isArray(value.campaign.petsRescuedIds) &&
            Array.isArray(value.campaign.claimedChestIds) &&
            isPlainObject(value.campaign.specialMaps) &&
            Number.isInteger(value.campaign.diamonds) &&
            value.campaign.diamonds >= 0 &&
            isPlainObject(value.ui) &&
            typeof value.ui.lastScreen === "string"
        );
    }

    function normalizeState(value) {
        if (!isValidState(value)) {
            return createInitialState();
        }

        return value;
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.playerState = Object.freeze({
        STATE_VERSION,
        createInitialState,
        isValidState,
        normalizeState
    });
})(globalThis);
