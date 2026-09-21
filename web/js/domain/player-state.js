(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const world = TQ.domain?.worldStructure;
    if (!world) throw new Error("world-structure module must be loaded before player-state");

    const STATE_VERSION = 9;
    const DEFAULT_HOME_BACKGROUND_ID = "pirate-main";
    const DEFAULT_PROFILE_FRAME_ID = "simple";
    const TOTAL_REGIONS = world.TOTAL_REGIONS;
    const ISLANDS_PER_REGION = world.ISLANDS_PER_REGION;
    const LEGACY_TOTAL_REGIONS = 11;
    const LEGACY_ISLANDS_PER_REGION = 10;

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

    function createLegacyRegionProgress() {
        return Object.fromEntries(Array.from({ length: LEGACY_TOTAL_REGIONS }, (_, i) => [
            String(i + 1),
            { islandsCompleted: 0, islandsTotal: LEGACY_ISLANDS_PER_REGION }
        ]));
    }

    function createFinalJourney() {
        return {
            finalMapFragments: 0,
            finalMapCompleted: false,
            finalIslandUnlocked: false,
            finalIslandCompleted: false,
            finalGrandChestUnlocked: false,
            finalGrandChestClaimed: false
        };
    }

    function createLegacyFinalJourney() {
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
            schedulerState: null,
            lastResult: null
        };
    }

    function createLegacyLearningState() {
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
            crew: { hiredIds: [] },
            campaign: {
                currentRegionId: 1,
                currentIslandId: 1,
                unlockedRegionIds: [1],
                completedRegionIds: [],
                completedIslandIds: [],
                travelPlayedIslandIds: [],
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

    function uniqueRegionIds(value, maxRegionId = TOTAL_REGIONS) {
        return Array.from(new Set(
            Array.isArray(value)
                ? value.filter((id) => Number.isInteger(id) && id >= 1 && id <= maxRegionId)
                : []
        ));
    }

    function parseIslandKey(value) {
        const match = /^region-(\d+)-island-(\d+)$/.exec(String(value));
        if (!match) return null;
        return { regionId: Number(match[1]), islandId: Number(match[2]) };
    }

    function newIslandKey(regionId, islandId) {
        return `region-${regionId}-island-${islandId}`;
    }

    function migrateLegacyLocation(regionId, islandId) {
        try {
            return world.fromLegacyLocation(regionId, islandId);
        } catch {
            return world.fromGlobalIslandIndex(1);
        }
    }

    function migrateLegacyIslandKey(value) {
        const parsed = parseIslandKey(value);
        if (!parsed
            || parsed.regionId < 1
            || parsed.regionId > LEGACY_TOTAL_REGIONS
            || parsed.islandId < 1
            || parsed.islandId > LEGACY_ISLANDS_PER_REGION) {
            return null;
        }
        const migrated = migrateLegacyLocation(parsed.regionId, parsed.islandId);
        return newIslandKey(migrated.regionId, migrated.islandId);
    }

    function buildMigratedCompletedIslandIds(campaign) {
        const migrated = new Set();
        for (const value of Array.isArray(campaign.completedIslandIds) ? campaign.completedIslandIds : []) {
            const key = migrateLegacyIslandKey(value);
            if (key) migrated.add(key);
        }

        const legacyProgress = isObject(campaign.regionProgress) ? campaign.regionProgress : {};
        for (let regionId = 1; regionId <= LEGACY_TOTAL_REGIONS; regionId += 1) {
            const progress = legacyProgress[String(regionId)];
            const byProgress = isObject(progress) && Number.isInteger(progress.islandsCompleted)
                ? Math.max(0, Math.min(LEGACY_ISLANDS_PER_REGION, progress.islandsCompleted))
                : 0;
            const byRegion = Array.isArray(campaign.completedRegionIds) && campaign.completedRegionIds.includes(regionId)
                ? LEGACY_ISLANDS_PER_REGION
                : 0;
            for (let islandId = 1; islandId <= Math.max(byProgress, byRegion); islandId += 1) {
                const loc = migrateLegacyLocation(regionId, islandId);
                migrated.add(newIslandKey(loc.regionId, loc.islandId));
            }
        }

        const legacyFinal = isObject(campaign.finalJourney) ? campaign.finalJourney : {};
        const fragments = Number.isInteger(legacyFinal.finalMapFragments)
            ? Math.max(0, Math.min(9, legacyFinal.finalMapFragments))
            : 0;
        for (let islandId = 1; islandId <= fragments; islandId += 1) {
            const loc = migrateLegacyLocation(11, islandId);
            migrated.add(newIslandKey(loc.regionId, loc.islandId));
        }
        if (legacyFinal.island10Completed) {
            const loc = migrateLegacyLocation(11, 10);
            migrated.add(newIslandKey(loc.regionId, loc.islandId));
        }

        return Array.from(migrated).sort((a, b) => {
            const pa = parseIslandKey(a);
            const pb = parseIslandKey(b);
            return world.toGlobalIslandIndex(pa.regionId, pa.islandId)
                - world.toGlobalIslandIndex(pb.regionId, pb.islandId);
        });
    }

    function buildRegionProgressFromCompleted(completedIslandIds) {
        const progress = createRegionProgress();
        for (const key of completedIslandIds) {
            const parsed = parseIslandKey(key);
            if (parsed && progress[String(parsed.regionId)]) {
                progress[String(parsed.regionId)].islandsCompleted += 1;
            }
        }
        return progress;
    }

    function migrateLegacyTravelIds(values) {
        return Array.from(new Set(
            (Array.isArray(values) ? values : [])
                .map(migrateLegacyIslandKey)
                .filter(Boolean)
        ));
    }

    function migrateLegacySession(session) {
        if (!isObject(session)) return null;
        const loc = migrateLegacyLocation(session.regionId, session.islandId);
        return {
            ...session,
            regionId: loc.regionId,
            islandId: loc.islandId,
            currentChallenge: isObject(session.currentChallenge)
                ? { ...session.currentChallenge, regionId: loc.regionId, islandId: loc.islandId }
                : session.currentChallenge
        };
    }

    function migrateLegacyResult(result) {
        if (!isObject(result) || !Number.isInteger(result.regionId) || !Number.isInteger(result.islandId)) {
            return result ?? null;
        }
        const loc = migrateLegacyLocation(result.regionId, result.islandId);
        return { ...result, regionId: loc.regionId, islandId: loc.islandId };
    }

    function migrateLegacyLearning(learning, fallbackRegionId) {
        const source = isObject(learning) ? learning : createLegacyLearningState();
        const oldStates = isObject(source.regionStates) ? Object.values(source.regionStates) : [];
        const mastery = {};
        const recoveryByKey = new Map();
        let plannedExposureCount = 0;
        let recoveryAttemptCount = 0;

        for (const state of oldStates) {
            if (!isObject(state)) continue;
            plannedExposureCount += Number.isInteger(state.plannedExposureCount) ? state.plannedExposureCount : 0;
            recoveryAttemptCount += Number.isInteger(state.recoveryAttemptCount) ? state.recoveryAttemptCount : 0;
            if (isObject(state.mastery)) {
                for (const [key, value] of Object.entries(state.mastery)) {
                    const streak = Number.isInteger(value?.correctStreak) ? Math.max(0, Math.min(2, value.correctStreak)) : 0;
                    mastery[key] = { correctStreak: Math.max(mastery[key]?.correctStreak || 0, streak) };
                }
            }
            if (Array.isArray(state.recoveryQueue)) {
                for (const item of state.recoveryQueue) {
                    if (!isObject(item) || typeof item.key !== "string") continue;
                    const remainingGap = Number.isInteger(item.remainingGap) ? Math.max(0, item.remainingGap) : 0;
                    const current = recoveryByKey.get(item.key);
                    if (!current || remainingGap < current.remainingGap) {
                        recoveryByKey.set(item.key, { ...item, remainingGap });
                    }
                }
            }
        }

        const migratedSession = migrateLegacySession(source.activeSession);
        const preferredLegacyRegionId = Number(source.activeSession?.regionId) || null;
        const preferred = preferredLegacyRegionId ? source.regionStates?.[String(preferredLegacyRegionId)] : null;
        const recoveryGap = Number.isInteger(preferred?.recoveryGap)
            ? preferred.recoveryGap
            : (Number.isInteger(oldStates[oldStates.length - 1]?.recoveryGap) ? oldStates[oldStates.length - 1].recoveryGap : 2);

        return {
            activeSession: migratedSession,
            schedulerState: oldStates.length ? {
                regionId: migratedSession?.regionId || fallbackRegionId,
                recoveryGap,
                mastery,
                recoveryQueue: Array.from(recoveryByKey.values()),
                plannedExposureCount,
                recoveryAttemptCount
            } : null,
            lastResult: migrateLegacyResult(source.lastResult)
        };
    }

    function migrateState(value) {
        if (!isObject(value)) return value;
        let migrated = value;

        if (migrated.schemaVersion === 1) {
            const ui = isObject(migrated.ui) ? migrated.ui : {};
            migrated = { ...migrated, schemaVersion: 2, ui: { ...ui, lastScreen: typeof ui.lastScreen === "string" ? ui.lastScreen : "home", homeBackgroundId: DEFAULT_HOME_BACKGROUND_ID } };
        }

        if (migrated.schemaVersion === 2) {
            const player = isObject(migrated.player) ? migrated.player : {};
            migrated = { ...migrated, schemaVersion: 3, player: { ...player, profileFrameId: "pirate-treasure" }, progression: { level: 1, xpCurrent: 0, xpRequired: 100 }, wallet: { coins: 0, gems: 0 } };
        }

        if (migrated.schemaVersion === 3) {
            const player = isObject(migrated.player) ? migrated.player : {};
            migrated = { ...migrated, schemaVersion: 4, player: { ...player, profileFrameId: player.profileFrameId === "tide-wheel" ? "tide-wheel" : DEFAULT_PROFILE_FRAME_ID } };
        }

        if (migrated.schemaVersion === 4) {
            const campaign = isObject(migrated.campaign) ? migrated.campaign : {};
            const unlocked = uniqueRegionIds(campaign.unlockedRegionIds, LEGACY_TOTAL_REGIONS);
            migrated = { ...migrated, schemaVersion: 5, campaign: { ...campaign, unlockedRegionIds: unlocked.length ? unlocked : [1], completedRegionIds: [], regionProgress: createLegacyRegionProgress(), finalJourney: createLegacyFinalJourney() } };
        }

        if (migrated.schemaVersion === 5) {
            migrated = { ...migrated, schemaVersion: 6, learning: createLegacyLearningState() };
        }

        if (migrated.schemaVersion === 6) {
            const campaign = isObject(migrated.campaign) ? migrated.campaign : {};
            const completed = Array.isArray(campaign.completedIslandIds) ? campaign.completedIslandIds.filter((id) => /^region-\d+-island-\d+$/.test(String(id))) : [];
            const active = isObject(migrated.learning?.activeSession) ? `region-${migrated.learning.activeSession.regionId}-island-${migrated.learning.activeSession.islandId}` : null;
            migrated = { ...migrated, schemaVersion: 7, campaign: { ...campaign, travelPlayedIslandIds: active && !completed.includes(active) ? [...completed, active] : completed } };
        }

        if (migrated.schemaVersion === 7) {
            migrated = { ...migrated, schemaVersion: 8, crew: { hiredIds: [] } };
        }

        if (migrated.schemaVersion === 8) {
            const campaign = isObject(migrated.campaign) ? migrated.campaign : {};
            const completedIslandIds = buildMigratedCompletedIslandIds(campaign);
            const regionProgress = buildRegionProgressFromCompleted(completedIslandIds);
            const completedRegionIds = Object.entries(regionProgress)
                .filter(([, progress]) => progress.islandsCompleted === ISLANDS_PER_REGION)
                .map(([regionId]) => Number(regionId));
            const unlocked = new Set([1]);

            for (const oldRegionId of uniqueRegionIds(campaign.unlockedRegionIds, LEGACY_TOTAL_REGIONS)) {
                const firstNewRegionId = ((oldRegionId - 1) * 2) + 1;
                unlocked.add(firstNewRegionId);
                const oldProgress = campaign.regionProgress?.[String(oldRegionId)];
                const oldCompleted = Array.isArray(campaign.completedRegionIds) && campaign.completedRegionIds.includes(oldRegionId);
                if (oldCompleted || (Number.isInteger(oldProgress?.islandsCompleted) && oldProgress.islandsCompleted >= 5)) unlocked.add(firstNewRegionId + 1);
            }
            for (const regionId of completedRegionIds) {
                if (regionId % 2 === 1 && regionId < TOTAL_REGIONS) unlocked.add(regionId + 1);
            }

            const oldRegionId = Number.isInteger(campaign.currentRegionId) && campaign.currentRegionId >= 1 && campaign.currentRegionId <= LEGACY_TOTAL_REGIONS ? campaign.currentRegionId : 1;
            const oldIslandId = Number.isInteger(campaign.currentIslandId) && campaign.currentIslandId >= 1 && campaign.currentIslandId <= LEGACY_ISLANDS_PER_REGION ? campaign.currentIslandId : 1;
            const current = migrateLegacyLocation(oldRegionId, oldIslandId);
            const finalGlobals = completedIslandIds.map(parseIslandKey).filter(Boolean).map((item) => world.toGlobalIslandIndex(item.regionId, item.islandId));
            const legacyFinal = isObject(campaign.finalJourney) ? campaign.finalJourney : {};
            const countedFragments = finalGlobals.filter((index) => index >= 101 && index <= 109).length;
            const finalMapFragments = Math.max(countedFragments, Number.isInteger(legacyFinal.finalMapFragments) ? Math.min(9, legacyFinal.finalMapFragments) : 0);
            const finalIslandCompleted = finalGlobals.includes(110) || Boolean(legacyFinal.island10Completed);
            const finalMapCompleted = finalMapFragments === 9 || Boolean(legacyFinal.finalMapCompleted);

            migrated = {
                ...migrated,
                schemaVersion: STATE_VERSION,
                campaign: {
                    ...campaign,
                    currentRegionId: current.regionId,
                    currentIslandId: current.islandId,
                    unlockedRegionIds: Array.from(unlocked).sort((a, b) => a - b),
                    completedRegionIds,
                    completedIslandIds,
                    travelPlayedIslandIds: migrateLegacyTravelIds(campaign.travelPlayedIslandIds),
                    regionProgress,
                    finalJourney: {
                        finalMapFragments,
                        finalMapCompleted,
                        finalIslandUnlocked: finalMapCompleted || Boolean(legacyFinal.island10Unlocked),
                        finalIslandCompleted,
                        finalGrandChestUnlocked: finalIslandCompleted || Boolean(legacyFinal.finalGrandChestUnlocked),
                        finalGrandChestClaimed: Boolean(legacyFinal.finalGrandChestClaimed)
                    }
                },
                learning: migrateLegacyLearning(migrated.learning, current.regionId)
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
            && ["finalMapCompleted", "finalIslandUnlocked", "finalIslandCompleted", "finalGrandChestUnlocked", "finalGrandChestClaimed"].every((key) => typeof value[key] === "boolean")
        );
    }

    function validSchedulerLearningState(value) {
        return value === null || Boolean(
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
            && Number.isInteger(value.plannedCursor) && value.plannedCursor >= 0 && value.plannedCursor <= 20
            && Number.isInteger(value.plannedAnswered) && value.plannedAnswered >= 0 && value.plannedAnswered <= 20
            && Number.isInteger(value.correctAnswers) && value.correctAnswers >= 0
            && Number.isInteger(value.wrongAnswers) && value.wrongAnswers >= 0
            && Number.isInteger(value.recoveryAnswers) && value.recoveryAnswers >= 0
            && Number.isInteger(value.totalAttempts) && value.totalAttempts >= 0
            && ["question", "feedback", "complete"].includes(value.phase)
        );
    }

    function validLearning(value) {
        return Boolean(
            isObject(value)
            && validActiveSession(value.activeSession)
            && validSchedulerLearningState(value.schedulerState)
            && (value.lastResult === null || isObject(value.lastResult))
        );
    }

    function validIslandKey(value) {
        const parsed = parseIslandKey(value);
        return Boolean(parsed && parsed.regionId >= 1 && parsed.regionId <= TOTAL_REGIONS && parsed.islandId >= 1 && parsed.islandId <= ISLANDS_PER_REGION);
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
            && Number.isInteger(value.progression.level) && value.progression.level >= 1
            && Number.isInteger(value.progression.xpCurrent) && value.progression.xpCurrent >= 0
            && Number.isInteger(value.progression.xpRequired) && value.progression.xpRequired > 0
            && isObject(value.wallet)
            && Number.isInteger(value.wallet.coins) && value.wallet.coins >= 0
            && Number.isInteger(value.wallet.gems) && value.wallet.gems >= 0
            && isObject(value.crew)
            && Array.isArray(value.crew.hiredIds)
            && value.crew.hiredIds.every((id) => typeof id === "string")
            && new Set(value.crew.hiredIds).size === value.crew.hiredIds.length
            && isObject(value.campaign)
            && Number.isInteger(value.campaign.currentRegionId) && value.campaign.currentRegionId >= 1 && value.campaign.currentRegionId <= TOTAL_REGIONS
            && Number.isInteger(value.campaign.currentIslandId) && value.campaign.currentIslandId >= 1 && value.campaign.currentIslandId <= ISLANDS_PER_REGION
            && Array.isArray(value.campaign.unlockedRegionIds) && value.campaign.unlockedRegionIds.includes(1)
            && value.campaign.unlockedRegionIds.every((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_REGIONS)
            && Array.isArray(value.campaign.completedRegionIds)
            && value.campaign.completedRegionIds.every((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_REGIONS)
            && Array.isArray(value.campaign.completedIslandIds) && value.campaign.completedIslandIds.every(validIslandKey)
            && Array.isArray(value.campaign.travelPlayedIslandIds) && value.campaign.travelPlayedIslandIds.every(validIslandKey)
            && validRegionProgress(value.campaign.regionProgress)
            && validFinalJourney(value.campaign.finalJourney)
            && Array.isArray(value.campaign.petsRescuedIds)
            && Array.isArray(value.campaign.claimedChestIds)
            && isObject(value.campaign.specialMaps)
            && Number.isInteger(value.campaign.diamonds) && value.campaign.diamonds >= 0
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
        return ["home", "crew", "world-map", "regions", "islands", "travel", "challenge", "chest", "result"].includes(screenId)
            ? { ...s, ui: { ...s.ui, lastScreen: screenId } }
            : s;
    }

    function hireCrewMember(state, crewMember) {
        const s = normalizeState(state);
        if (!isObject(crewMember) || typeof crewMember.id !== "string") return s;
        if (!Number.isInteger(crewMember.cost) || crewMember.cost < 0) return s;
        if (s.crew.hiredIds.includes(crewMember.id)) return s;
        if (s.wallet.coins < crewMember.cost) return s;

        return {
            ...s,
            wallet: { ...s.wallet, coins: s.wallet.coins - crewMember.cost },
            crew: { ...s.crew, hiredIds: [...s.crew.hiredIds, crewMember.id] }
        };
    }

    function getCrewBonusSummary(state, crewMembers) {
        const s = normalizeState(state);
        const summary = { xp: 0, coins: 0, gems: 0 };
        if (!Array.isArray(crewMembers)) return summary;
        for (const member of crewMembers) {
            if (!isObject(member) || !s.crew.hiredIds.includes(member.id)) continue;
            if (!Object.prototype.hasOwnProperty.call(summary, member.bonusType)) continue;
            if (!Number.isFinite(member.bonusPercent) || member.bonusPercent < 0) continue;
            summary[member.bonusType] += member.bonusPercent;
        }
        return summary;
    }

    function calculateCrewReward(state, crewMembers, reward) {
        const base = {
            xp: Number.isInteger(reward?.xp) && reward.xp > 0 ? reward.xp : 0,
            coins: Number.isInteger(reward?.coins) && reward.coins > 0 ? reward.coins : 0,
            gems: Number.isInteger(reward?.gems) && reward.gems > 0 ? reward.gems : 0
        };
        const percent = getCrewBonusSummary(state, crewMembers);
        const bonus = {
            xp: Math.floor(base.xp * percent.xp / 100),
            coins: Math.floor(base.coins * percent.coins / 100),
            gems: Math.floor(base.gems * percent.gems / 100)
        };
        return {
            base,
            percent,
            bonus,
            total: {
                xp: base.xp + bonus.xp,
                coins: base.coins + bonus.coins,
                gems: base.gems + bonus.gems
            }
        };
    }

    function grantXp(state, amount) {
        const s = normalizeState(state);
        if (!Number.isInteger(amount) || amount <= 0) return s;

        let level = s.progression.level;
        let xpCurrent = s.progression.xpCurrent + amount;
        const xpRequired = s.progression.xpRequired;

        while (xpCurrent >= xpRequired) {
            xpCurrent -= xpRequired;
            level += 1;
        }

        return {
            ...s,
            progression: {
                ...s.progression,
                level,
                xpCurrent
            }
        };
    }

    function applyNumericReward(state, reward) {
        let s = normalizeState(state);
        const xp = Number.isInteger(reward?.xp) && reward.xp > 0 ? reward.xp : 0;
        const coins = Number.isInteger(reward?.coins) && reward.coins > 0 ? reward.coins : 0;
        const gems = Number.isInteger(reward?.gems) && reward.gems > 0 ? reward.gems : 0;

        s = grantXp(s, xp);
        return {
            ...s,
            wallet: {
                ...s.wallet,
                coins: s.wallet.coins + coins,
                gems: s.wallet.gems + gems
            }
        };
    }

    function calculateRubyBaseAmount(result, rewards) {
        const hasRubyReward = Array.isArray(rewards)
            && rewards.some((reward) => isObject(reward) && reward.type === "ruby");
        if (!hasRubyReward) return 0;

        const correctAnswers = Number.isInteger(result?.correctAnswers)
            ? Math.max(0, result.correctAnswers)
            : 0;
        const wrongAnswers = Number.isInteger(result?.wrongAnswers)
            ? Math.max(0, result.wrongAnswers)
            : 0;

        return Math.max(0, correctAnswers - wrongAnswers);
    }

    function getIslandStatus(state, regionId, islandId) {
        const s = normalizeState(state);
        if (!Number.isInteger(regionId) || !Number.isInteger(islandId)) return "locked";
        if (regionId < 1 || regionId > TOTAL_REGIONS || islandId < 1 || islandId > ISLANDS_PER_REGION) return "locked";
        if (!s.campaign.unlockedRegionIds.includes(regionId)) return "locked";

        const key = `region-${regionId}-island-${islandId}`;
        if (s.campaign.completedIslandIds.includes(key)) return "completed";

        if (regionId === 22 && islandId === 5 && !s.campaign.finalJourney.finalIslandUnlocked) {
            return "locked";
        }

        const completed = s.campaign.regionProgress[String(regionId)].islandsCompleted;
        return islandId === completed + 1 ? "available" : "locked";
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
        return ({ 2: "1", 6: "2", 10: "3", 14: "4", 20: "5" })[regionId] || null;
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
        if (regionId === 22 && islandId === 5 && !s.campaign.finalJourney.finalIslandUnlocked) return s;

        const key = newIslandKey(regionId, islandId);
        if (s.campaign.completedIslandIds.includes(key)) return s;
        const completedIslandIds = [...s.campaign.completedIslandIds, key];
        const previous = s.campaign.regionProgress[String(regionId)];
        const regionProgress = {
            ...s.campaign.regionProgress,
            [String(regionId)]: { ...previous, islandsCompleted: Math.min(ISLANDS_PER_REGION, previous.islandsCompleted + 1) }
        };

        const finalJourney = { ...s.campaign.finalJourney };
        const globalIslandIndex = world.toGlobalIslandIndex(regionId, islandId);
        if (globalIslandIndex >= 101 && globalIslandIndex <= 109) {
            finalJourney.finalMapFragments = completedIslandIds
                .map(parseIslandKey).filter(Boolean)
                .map((item) => world.toGlobalIslandIndex(item.regionId, item.islandId))
                .filter((index) => index >= 101 && index <= 109).length;
            finalJourney.finalMapCompleted = finalJourney.finalMapFragments === 9;
            finalJourney.finalIslandUnlocked = finalJourney.finalMapCompleted;
        }
        if (globalIslandIndex === 110) {
            finalJourney.finalIslandCompleted = true;
            finalJourney.finalGrandChestUnlocked = true;
        }

        const completedRegionIds = regionProgress[String(regionId)].islandsCompleted === ISLANDS_PER_REGION
            ? addUnique(s.campaign.completedRegionIds, regionId)
            : s.campaign.completedRegionIds;

        const next = {
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
        return completedRegionIds.includes(regionId) ? unlockNextRegionIfEligible(next, regionId) : next;
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
        if (!s.learning.schedulerState) return null;
        return TQ.domain.scheduler?.retargetRecoveryState
            ? TQ.domain.scheduler.retargetRecoveryState(s.learning.schedulerState, regionId)
            : { ...s.learning.schedulerState, regionId };
    }

    function islandTravelKey(regionId, islandId) {
        if (!Number.isInteger(regionId) || !Number.isInteger(islandId)) return null;
        if (regionId < 1 || regionId > TOTAL_REGIONS || islandId < 1 || islandId > ISLANDS_PER_REGION) return null;
        return `region-${regionId}-island-${islandId}`;
    }

    function hasPlayedIslandTravel(state, regionId, islandId) {
        const s = normalizeState(state);
        const key = islandTravelKey(regionId, islandId);
        return Boolean(key && s.campaign.travelPlayedIslandIds.includes(key));
    }

    function withGameplaySessionTarget(state, session, regionState, screenId) {
        const s = normalizeState(state);
        if (!validActiveSession(session) || !validSchedulerLearningState(regionState) || regionState === null) return s;
        if (!["travel", "challenge"].includes(screenId)) return s;
        return {
            ...s,
            campaign: { ...s.campaign, currentRegionId: session.regionId, currentIslandId: session.islandId },
            learning: { ...s.learning, activeSession: session, schedulerState: regionState },
            ui: { ...s.ui, lastScreen: screenId }
        };
    }

    function withGameplaySession(state, session, regionState) {
        return withGameplaySessionTarget(state, session, regionState, "challenge");
    }

    function withIslandTravelSession(state, session, regionState) {
        return withGameplaySessionTarget(state, session, regionState, "travel");
    }

    function completeIslandTravel(state, regionId, islandId) {
        const s = normalizeState(state);
        const key = islandTravelKey(regionId, islandId);
        const active = s.learning.activeSession;
        if (!key || !active || active.regionId !== regionId || active.islandId !== islandId) return s;

        return {
            ...s,
            campaign: {
                ...s.campaign,
                travelPlayedIslandIds: addUnique(s.campaign.travelPlayedIslandIds, key)
            },
            ui: { ...s.ui, lastScreen: "challenge" }
        };
    }

    function updateGameplaySession(state, session, regionState) {
        return withGameplaySession(state, session, regionState);
    }

    function completeGameplaySession(state, result, regionState, rewards, crewMembers, rewardConfig) {
        let s = normalizeState(state);
        if (!isObject(result) || !validSchedulerLearningState(regionState) || regionState === null) return s;

        const islandKey = `region-${result.regionId}-island-${result.islandId}`;
        const alreadyCompleted = s.campaign.completedIslandIds.includes(islandKey);
        const configuredRewards = Array.isArray(rewards)
            ? rewards.filter((reward) => isObject(reward) && typeof reward.type === "string")
            : [];
        const structuralRewards = alreadyCompleted ? [] : configuredRewards;
        const xpPerCompletedMatch = Number.isInteger(rewardConfig?.xpPerCompletedMatch)
            && rewardConfig.xpPerCompletedMatch > 0
            ? rewardConfig.xpPerCompletedMatch
            : 20;

        const baseReward = {
            xp: xpPerCompletedMatch,
            coins: 0,
            gems: alreadyCompleted ? 0 : calculateRubyBaseAmount(result, structuralRewards)
        };
        const rewardBreakdown = calculateCrewReward(s, crewMembers, baseReward);

        s = applyNumericReward(s, rewardBreakdown.total);

        if (!alreadyCompleted) {
            s = applyIslandRewards(s, structuralRewards);
        }

        s = completeIsland(s, result.regionId, result.islandId);

        const storedResult = {
            ...result,
            reward: {
                base: rewardBreakdown.base,
                percent: rewardBreakdown.percent,
                bonus: rewardBreakdown.bonus,
                total: rewardBreakdown.total,
                structural: structuralRewards.map((reward) => ({ ...reward })),
                firstCompletion: !alreadyCompleted
            }
        };
        const earnedChest = structuralRewards.some((reward) => reward.type === "chest");

        return {
            ...s,
            learning: {
                ...s.learning,
                activeSession: null,
                lastResult: storedResult,
                schedulerState: regionState
            },
            ui: { ...s.ui, lastScreen: earnedChest ? "chest" : "result" }
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
        hireCrewMember,
        getCrewBonusSummary,
        calculateCrewReward,
        calculateRubyBaseAmount,
        grantXp,
        applyNumericReward,
        getIslandStatus,
        getRegionStatus,
        selectRegion,
        completeIsland,
        unlockNextRegionIfEligible,
        applyIslandRewards,
        getRegionLearningState,
        islandTravelKey,
        hasPlayedIslandTravel,
        withGameplaySession,
        withIslandTravelSession,
        completeIslandTravel,
        updateGameplaySession,
        completeGameplaySession,
        claimFinalGrandChest
    });
})(globalThis);
