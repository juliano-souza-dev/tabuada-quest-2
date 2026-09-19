(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STATE_VERSION = 3;
    const DEFAULT_HOME_BACKGROUND_ID = "pirate-main";
    const DEFAULT_PROFILE_FRAME_ID = "pirate-treasure";

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
                avatarId: "luna",
                profileFrameId: DEFAULT_PROFILE_FRAME_ID
            },
            progression: {
                level: 1,
                xpCurrent: 0,
                xpRequired: 100
            },
            wallet: {
                coins: 0,
                gems: 0
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
                lastScreen: "home",
                homeBackgroundId: DEFAULT_HOME_BACKGROUND_ID
            }
        };
    }

    function isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function migrateState(value) {
        if (!isPlainObject(value)) {
            return value;
        }

        let migrated = value;

        if (migrated.schemaVersion === 1) {
            const oldUi = isPlainObject(migrated.ui) ? migrated.ui : {};
            migrated = {
                ...migrated,
                schemaVersion: 2,
                ui: {
                    ...oldUi,
                    lastScreen: typeof oldUi.lastScreen === "string" ? oldUi.lastScreen : "home",
                    homeBackgroundId: DEFAULT_HOME_BACKGROUND_ID
                }
            };
        }

        if (migrated.schemaVersion === 2) {
            const oldPlayer = isPlainObject(migrated.player) ? migrated.player : {};
            migrated = {
                ...migrated,
                schemaVersion: STATE_VERSION,
                player: {
                    ...oldPlayer,
                    profileFrameId: DEFAULT_PROFILE_FRAME_ID
                },
                progression: {
                    level: 1,
                    xpCurrent: 0,
                    xpRequired: 100
                },
                wallet: {
                    coins: 0,
                    gems: 0
                }
            };
        }

        return migrated;
    }

    function isValidState(value) {
        return Boolean(
            isPlainObject(value) &&
            value.schemaVersion === STATE_VERSION &&
            isPlainObject(value.player) &&
            typeof value.player.displayName === "string" &&
            typeof value.player.avatarId === "string" &&
            typeof value.player.profileFrameId === "string" &&
            value.player.profileFrameId.length > 0 &&
            isPlainObject(value.progression) &&
            Number.isInteger(value.progression.level) &&
            value.progression.level >= 1 &&
            Number.isInteger(value.progression.xpCurrent) &&
            value.progression.xpCurrent >= 0 &&
            Number.isInteger(value.progression.xpRequired) &&
            value.progression.xpRequired > 0 &&
            isPlainObject(value.wallet) &&
            Number.isInteger(value.wallet.coins) &&
            value.wallet.coins >= 0 &&
            Number.isInteger(value.wallet.gems) &&
            value.wallet.gems >= 0 &&
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
            typeof value.ui.lastScreen === "string" &&
            typeof value.ui.homeBackgroundId === "string" &&
            value.ui.homeBackgroundId.length > 0
        );
    }

    function normalizeState(value) {
        const migrated = migrateState(value);
        if (!isValidState(migrated)) {
            return createInitialState();
        }

        return migrated;
    }

    function withHomeBackground(state, backgroundId, allowedIds) {
        const normalized = normalizeState(state);
        if (!Array.isArray(allowedIds) || !allowedIds.includes(backgroundId)) {
            return normalized;
        }

        return {
            ...normalized,
            ui: {
                ...normalized.ui,
                homeBackgroundId: backgroundId
            }
        };
    }

    function withProfileFrame(state, frameId, allowedIds) {
        const normalized = normalizeState(state);
        if (!Array.isArray(allowedIds) || !allowedIds.includes(frameId)) {
            return normalized;
        }

        return {
            ...normalized,
            player: {
                ...normalized.player,
                profileFrameId: frameId
            }
        };
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.playerState = Object.freeze({
        STATE_VERSION,
        DEFAULT_HOME_BACKGROUND_ID,
        DEFAULT_PROFILE_FRAME_ID,
        createInitialState,
        migrateState,
        isValidState,
        normalizeState,
        withHomeBackground,
        withProfileFrame
    });
})(globalThis);
