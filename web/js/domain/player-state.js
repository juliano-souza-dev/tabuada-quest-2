(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STATE_VERSION = 6;
    const DEFAULT_HOME_BACKGROUND_ID = "pirate-main";
    const DEFAULT_PROFILE_FRAME_ID = "simple";
    const TOTAL_REGIONS = 11;
    const ISLANDS_PER_REGION = 10;

    function createSpecialMaps() {
        return Object.fromEntries(Array.from({ length: 5 }, (_, i) => [
            String(i + 1),
            { fragments: 0, missionStatus: "collecting", rewardClaimed: false }
        ]));
    }

    function createRegionProgress() {
        return Object.fromEntries(Array.from({ length: TOTAL_REGIONS }, (_, i) => [
            String(i + 1),
            { islandsCompleted: 0, islandsTotal: ISLANDS_PER_REGION }
        ]));
    }

    function createFinalJourney() {
        return {
            finalMapFragments: 0,
            finalMapCompleted: false,
            island10Unlocked: false,
            island10Completed: false,
            finalGrandChestUnlocked: false,
            finalGrandChestClaimed: false
        };
    }

    function createLearningState() {
        return {
            activeSession: null,
            regionStates: {},
            lastResult: null
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
            progression: { level: 1, xpCurrent: 0, xpRequired: 100 },
            wallet: { coins: 0, gems: 0 },
            campaign: {
                currentRegionId: 1,
                currentIslandId: 1,
                unlockedRegionIds: [1],
                completedRegionIds: [],
                completedIslandIds: [],
                regionProgress: createRegionProgress(),
                finalJourney: createFinalJourney(),
                petsRescuedIds: [],
                claimedChestIds: [],
                specialMaps: createSpecialMaps(),
                diamonds: 0
            },
            learning: createLearningState(),
            ui: { lastScreen: "home", homeBackgroundId: DEFAULT_HOME_BACKGROUND_ID }
        };
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function uniqueRegionIds(value) {
        return Array.from(new Set(
            Array.isArray(value)
                ? value.filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_REGIONS)
                : []
        ));
    }

    function migrateState(value) {
        if (!isObject(value)) return value;
        let migrated = value;

        if (migrated.schemaVersion === 1) {
            const ui = isObject(migrated.ui) ? migrated.ui : {};
            migrated = {
                ...migrated,
                schemaVersion: 2,
                ui: {
                    ...ui,
                    lastScreen: typeof ui.lastScreen === "string" ? ui.lastScreen : "home",
                    homeBackgroundId: DEFAULT_HOME_BACKGROUND_ID
                }
            };
        }

        if (migrated.schemaVersion === 2) {
            const player = isObject(migrated.player) ? migrated.player : {};
            migrated = {
                ...migrated,
                schemaVersion: 3,
                player: { ...player, profileFrameId: "pirate-treasure" },
                progression: { level: 1, xpCurrent: 0, xpRequired: 100 },
                wallet: { coins: 0, gems: 0 }
            };
        }

        if (migrated.schemaVersion === 3) {
            const player = isObject(migrated.player) ? migrated.player : {};
            migrated = {
                ...migrated,
                schemaVersion: 4,
                player: {
                    ...player,
                    profileFrameId: player.profileFrameId === "tide-wheel"
                        ? "tide-wheel"
                        : DEFAULT_PROFILE_FRAME_ID
                }
            };
        }

        if (migrated.schemaVersion === 4) {
            const campaign = isObject(migrated.campaign) ? migrated.campaign : {};
            const unlocked = uniqueRegionIds(campaign.unlockedRegionIds);
            migrated = {
                ...migrated,
                schemaVersion: 5,
                campaign: {
                    ...campaign,
                    unlockedRegionIds: unlocked.length ? unlocked : [1],
                    completedRegionIds: [],
                    regionProgress: createRegionProgress(),
                    finalJourney: createFinalJourney()
                }
            };
        }

        if (migrated.schemaVersion === 5) {
            migrated = {
                ...migrated,
                schemaVersion: STATE_VERSION,
                learning: createLearningState()
            };
        }

        return migrated;
    }

    function validRegionProgress(value) {
        if (!isObject(value)) return false;
        return Array.from({ length: TOTAL_REGIONS }, (_, i) => String(i + 1)).every((id) => {
            const item = value[id];
            return isObject(item)
                && Number.isInteger(item.islandsCompleted)
                && item.islandsCompleted >= 0
                && item.islandsCompleted <= ISLANDS_PER_REGION
                && item.islandsTotal === ISLANDS_PER_REGION;
        });
    }

    function validFinalJourney(value) {
        return Boolean(
            isObject(value)
            && Number.isInteger(value.finalMapFragments)
            && value.finalMapFragments >= 0
            && value.finalMapFragments <= 9
            && ["finalMapCompleted", "island10Unlocked", "island10Completed", "finalGrandChestUnlocked", "finalGrandChestClaimed"]
                .every((key) => typeof value[key] === "boolean")
        );
    }

    function validRegionLearningState(value) {
        return Boolean(
            isObject(value)
            && Number.isInteger(value.regionId)
            && value.regionId >= 1
            && value.regionId <= TOTAL_REGIONS
            && Number.isInteger(value.recoveryGap)
            && value.recoveryGap >= 0
            && isObject(value.mastery)
            && Array.isArray(value.recoveryQueue)
            && Number.isInteger(value.plannedExposureCount)
            && value.plannedExposureCount >= 0
            && Number.isInteger(value.recoveryAttemptCount)
            && value.recoveryAttemptCount >= 0
        );
    }

    function validActiveSession(value) {
        return value === null || Boolean(
            isObject(value)
            && value.version === 1
            && Number.isInteger(value.regionId)
            && value.regionId >= 1
            && value.regionId <= TOTAL_REGIONS
            && Number.isInteger(value.islandId)
            && value.islandId >= 1
            && value.islandId <= ISLANDS_PER_REGION
            && typeof value.seed === "string"
            && Number.isInteger(value.plannedCursor)
            && value.plannedCursor >= 0
            && value.plannedCursor <= 20
            && Number.isInteger(value.plannedAnswered)
            && value.plannedAnswered >= 0
            && value.plannedAnswered <= 20
            && Number.isInteger(value.correctAnswers)
            && value.correctAnswers >= 0
            && Number.isInteger(value.wrongAnswers)
            && value.wrongAnswers >= 0
            && Number.isInteger(value.recoveryAnswers)
            && value.recoveryAnswers >= 0
            && Number.isInteger(value.totalAttempts)
            && value.totalAttempts >= 0
            && ["question", "feedback", "complete"].includes(value.phase)
        );
    }

    function validLearning(value) {
        if (!isObject(value) || !validActiveSession(value.activeSession) || !isObject(value.regionStates)) return false;
        if (!Object.values(value.regionStates).every(validRegionLearningState)) return false;
        return value.lastResult === null || isObject(value.lastResult);
    }

    function isValidState(value) {
        return Boolean(
            isObject(value)
            && value.schemaVersion === STATE_VERSION
            && isObject(value.player)
            && typeof value.player.displayName === "string"
            && typeof value.player.avatarId === "string"
            && typeof value.player.profileFrameId === "string"
            && isObject(value.progression)
            && Number.isInteger(value.progression.level)
            && value.progression.level >= 1
            && Number.isInteger(value.progression.xpCurrent)
            && value.progression.xpCurrent >= 0
            && Number.isInteger(value.progression.xpRequired)
            && value.progression.xpRequired > 0
            && isObject(value.wallet)
            && Number.isInteger(value.wallet.coins)
            && value.wallet.coins >= 0
            && Number.isInteger(value.wallet.gems)
            && value.wallet.gems >= 0
            && isObject(value.campaign)
            && Number.isInteger(value.campaign.currentRegionId)
            && value.campaign.currentRegionId >= 1
            && value.campaign.currentRegionId <= TOTAL_REGIONS
            && Number.isInteger(value.campaign.currentIslandId)
            && Array.isArray(value.campaign.unlockedRegionIds)
            && value.campaign.unlockedRegionIds.includes(1)
            && Array.isArray(value.campaign.completedRegionIds)
            && Array.isArray(value.campaign.completedIslandIds)
            && validRegionProgress(value.campaign.regionProgress)
            && validFinalJourney(value.campaign.finalJourney)
            && Array.isArray(value.campaign.petsRescuedIds)
            && Array.isArray(value.campaign.claimedChestIds)
            && isObject(value.campaign.specialMaps)
            && Number.isInteger(value.campaign.diamonds)
            && value.campaign.diamonds >= 0
            && validLearning(value.learning)
            && isObject(value.ui)
            && typeof value.ui.lastScreen === "string"
            && typeof value.ui.homeBackgroundId === "string"
        );
    }

    function normalizeState(value) {
        const migrated = migrateState(value);
        return isValidState(migrated) ? migrated : createInitialState();
    }

    function withHomeBackground(state, backgroundId, allowedIds) {
        const s = normalizeState(state);
        return Array.isArray(allowedIds) && allowedIds.includes(backgroundId)
            ? { ...s, ui: { ...s.ui, homeBackgroundId: backgroundId } }
            : s;
    }

    function withProfileFrame(state, frameId, allowedIds) {
        const s = normalizeState(state);
        return Array.isArray(allowedIds) && allowedIds.includes(frameId)
            ? { ...s, player: { ...s.player, profileFrameId: frameId } }
            : s;
    }

    function withLastScreen(state, screenId) {
        const s = normalizeState(state);
        return ["home", "regions", "islands", "challenge", "result"].includes(screenId)
            ? { ...s, ui: { ...s.ui, lastScreen: screenId } }
            : s;
    }

    function hasPendingRecovery(state, regionId) {
        const s = normalizeState(state);
        const regionState = s.learning.regionStates[String(regionId)];
        return Boolean(regionState && Array.isArray(regionState.recoveryQueue) && regionState.recoveryQueue.length > 0);
    }

    function getIslandStatus(state, regionId, islandId) {
        const s = normalizeState(state);
        if (!Number.isInteger(regionId) || !Number.isInteger(islandId)) return "locked";
        if (regionId < 1 || regionId > TOTAL_REGIONS || islandId < 1 || islandId > ISLANDS_PER_REGION) return "locked";
        if (!s.campaign.unlockedRegionIds.includes(regionId)) return "locked";

        const key = `region-${regionId}-island-${islandId}`;
        if (s.campaign.completedIslandIds.includes(key)) return "completed";

        if (regionId === 11 && islandId === 10 && !s.campaign.finalJourney.island10Unlocked) {
            return "locked";
        }

        const completed = s.campaign.regionProgress[String(regionId)].islandsCompleted;
        if (islandId !== completed + 1) return "locked";
        return hasPendingRecovery(s, regionId) ? "review" : "available";
    }

    function getRegionStatus(state, regionId) {
        const s = normalizeState(state);
        if (!Number.isInteger(regionId) || regionId < 1 || regionId > TOTAL_REGIONS) return "locked";
        if (s.campaign.completedRegionIds.includes(regionId)) return "completed";
        if (!s.campaign.unlockedRegionIds.includes(regionId)) return "locked";
        return s.campaign.regionProgress[String(regionId)].islandsCompleted > 0
            ? "in_progress"
            : "available";
    }

    function selectRegion(state, regionId) {
        const s = normalizeState(state);
        if (!s.campaign.unlockedRegionIds.includes(regionId)) return s;
        return {
            ...s,
            campaign: { ...s.campaign, currentRegionId: regionId },
            ui: { ...s.ui, lastScreen: "regions" }
        };
    }

    function addUnique(list, value) {
        return list.includes(value) ? list : [...list, value];
    }

    function specialMapGateForRegion(regionId) {
        return ({ 1: "1", 3: "2", 5: "3", 7: "4", 10: "5" })[regionId] || null;
    }

    function specialMapBlocksProgress(campaign, regionId) {
        const mapId = specialMapGateForRegion(regionId);
        if (!mapId || !isObject(campaign.specialMaps[mapId])) return false;
        return ["map_complete_mission_pending", "mission_in_progress"]
            .includes(campaign.specialMaps[mapId].missionStatus);
    }

    function unlockNextRegionIfEligible(state, completedRegionId) {
        const s = normalizeState(state);
        if (!s.campaign.completedRegionIds.includes(completedRegionId)) return s;
        if (completedRegionId >= TOTAL_REGIONS || specialMapBlocksProgress(s.campaign, completedRegionId)) return s;
        return {
            ...s,
            campaign: {
                ...s.campaign,
                unlockedRegionIds: addUnique(s.campaign.unlockedRegionIds, completedRegionId + 1)
            }
        };
    }

    function completeIsland(state, regionId, islandId) {
        const s = normalizeState(state);
        if (!Number.isInteger(regionId) || !Number.isInteger(islandId)) return s;
        if (regionId < 1 || regionId > TOTAL_REGIONS || islandId < 1 || islandId > ISLANDS_PER_REGION) return s;
        if (!s.campaign.unlockedRegionIds.includes(regionId)) return s;
        if (regionId === 11 && islandId === 10 && !s.campaign.finalJourney.island10Unlocked) return s;

        const key = `region-${regionId}-island-${islandId}`;
        if (s.campaign.completedIslandIds.includes(key)) return s;

        const completedIslandIds = [...s.campaign.completedIslandIds, key];
        const previous = s.campaign.regionProgress[String(regionId)];
        const regionProgress = {
            ...s.campaign.regionProgress,
            [String(regionId)]: {
                ...previous,
                islandsCompleted: Math.min(ISLANDS_PER_REGION, previous.islandsCompleted + 1)
            }
        };

        const finalJourney = { ...s.campaign.finalJourney };
        if (regionId === 11 && islandId <= 9) {
            finalJourney.finalMapFragments = completedIslandIds
                .filter((id) => /^region-11-island-[1-9]$/.test(id)).length;
            finalJourney.finalMapCompleted = finalJourney.finalMapFragments === 9;
            finalJourney.island10Unlocked = finalJourney.finalMapCompleted;
        }
        if (regionId === 11 && islandId === 10) {
            finalJourney.island10Completed = true;
            finalJourney.finalGrandChestUnlocked = true;
        }

        const completedRegionIds = regionProgress[String(regionId)].islandsCompleted === ISLANDS_PER_REGION
            ? addUnique(s.campaign.completedRegionIds, regionId)
            : s.campaign.completedRegionIds;

        let next = {
            ...s,
            campaign: {
                ...s.campaign,
                currentRegionId: regionId,
                currentIslandId: Math.min(ISLANDS_PER_REGION, islandId + 1),
                completedIslandIds,
                completedRegionIds,
                regionProgress,
                finalJourney
            }
        };
        return completedRegionIds.includes(regionId)
            ? unlockNextRegionIfEligible(next, regionId)
            : next;
    }

    function applyIslandRewards(state, rewards) {
        const s = normalizeState(state);
        if (!Array.isArray(rewards) || rewards.length === 0) return s;

        let campaign = {
            ...s.campaign,
            petsRescuedIds: [...s.campaign.petsRescuedIds],
            claimedChestIds: [...s.campaign.claimedChestIds],
            specialMaps: { ...s.campaign.specialMaps }
        };

        for (const reward of rewards) {
            if (!isObject(reward) || typeof reward.type !== "string") continue;

            if (reward.type === "pet" && typeof reward.petId === "string") {
                campaign.petsRescuedIds = addUnique(campaign.petsRescuedIds, reward.petId);
                continue;
            }

            if (reward.type === "chest" && typeof reward.chestId === "string") {
                campaign.claimedChestIds = addUnique(campaign.claimedChestIds, reward.chestId);
                continue;
            }

            if (
                reward.type === "map_fragment"
                && Number.isInteger(reward.mapId)
                && reward.mapId >= 1
                && reward.mapId <= 5
            ) {
                const mapId = String(reward.mapId);
                const current = campaign.specialMaps[mapId];
                if (!isObject(current)) continue;

                const fragments = Math.min(4, current.fragments + 1);
                campaign.specialMaps = {
                    ...campaign.specialMaps,
                    [mapId]: {
                        ...current,
                        fragments,
                        missionStatus: fragments === 4
                            ? "map_complete_mission_pending"
                            : current.missionStatus
                    }
                };
            }
        }

        return { ...s, campaign };
    }

    function getRegionLearningState(state, regionId) {
        const s = normalizeState(state);
        return s.learning.regionStates[String(regionId)] || null;
    }

    function withGameplaySession(state, session, regionState) {
        const s = normalizeState(state);
        if (!validActiveSession(session) || !validRegionLearningState(regionState)) return s;
        return {
            ...s,
            campaign: {
                ...s.campaign,
                currentRegionId: session.regionId,
                currentIslandId: session.islandId
            },
            learning: {
                ...s.learning,
                activeSession: session,
                regionStates: {
                    ...s.learning.regionStates,
                    [String(session.regionId)]: regionState
                }
            },
            ui: { ...s.ui, lastScreen: "challenge" }
        };
    }

    function updateGameplaySession(state, session, regionState) {
        return withGameplaySession(state, session, regionState);
    }

    function completeGameplaySession(state, result, regionState, rewards) {
        let s = normalizeState(state);
        if (!isObject(result) || !validRegionLearningState(regionState)) return s;

        const islandKey = `region-${result.regionId}-island-${result.islandId}`;
        const alreadyCompleted = s.campaign.completedIslandIds.includes(islandKey);

        if (!alreadyCompleted) {
            s = applyIslandRewards(s, rewards);
        }

        s = completeIsland(s, result.regionId, result.islandId);

        return {
            ...s,
            learning: {
                ...s.learning,
                activeSession: null,
                lastResult: result,
                regionStates: {
                    ...s.learning.regionStates,
                    [String(result.regionId)]: regionState
                }
            },
            ui: { ...s.ui, lastScreen: "result" }
        };
    }

    function claimFinalGrandChest(state) {
        const s = normalizeState(state);
        if (!s.campaign.finalJourney.finalGrandChestUnlocked || s.campaign.finalJourney.finalGrandChestClaimed) return s;
        return {
            ...s,
            campaign: {
                ...s.campaign,
                finalJourney: {
                    ...s.campaign.finalJourney,
                    finalGrandChestClaimed: true
                }
            }
        };
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.playerState = Object.freeze({
        STATE_VERSION,
        TOTAL_REGIONS,
        ISLANDS_PER_REGION,
        DEFAULT_HOME_BACKGROUND_ID,
        DEFAULT_PROFILE_FRAME_ID,
        createLearningState,
        createInitialState,
        migrateState,
        isValidState,
        normalizeState,
        withHomeBackground,
        withProfileFrame,
        withLastScreen,
        hasPendingRecovery,
        getIslandStatus,
        getRegionStatus,
        selectRegion,
        completeIsland,
        unlockNextRegionIfEligible,
        applyIslandRewards,
        getRegionLearningState,
        withGameplaySession,
        updateGameplaySession,
        completeGameplaySession,
        claimFinalGrandChest
    });
})(globalThis);
