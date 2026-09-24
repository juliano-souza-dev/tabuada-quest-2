(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const world = TQ.domain?.worldStructure;
    if (!world) throw new Error("world-structure module must be loaded before scheduler");

    const TOTAL_REGIONS = world.TOTAL_REGIONS;
    const ISLANDS_PER_REGION = world.ISLANDS_PER_REGION;
    const TABLES = 10;
    const MULTIPLIERS = 10;
    const PLANNED_PER_ISLAND = 20;
    const PLANNED_PER_REGION = PLANNED_PER_ISLAND * ISLANDS_PER_REGION;
    const PLANNED_PER_CAMPAIGN = PLANNED_PER_ISLAND * world.TOTAL_ISLANDS;

    const EXPOSURE_TYPE = Object.freeze({
        PLANNED: "PLANNED",
        RECOVERY: "RECOVERY"
    });

    function configForRegion(regionId) {
        if (regionId <= 4) return { k: 2, recoveryGap: 2 };
        if (regionId <= 8) return { k: 3, recoveryGap: 3 };
        if (regionId <= 12) return { k: 4, recoveryGap: 4 };
        if (regionId <= 16) return { k: 5, recoveryGap: 5 };
        return { k: 10, recoveryGap: 6 };
    }

    const REGION_CONFIG = Object.freeze(
        Object.fromEntries(
            Array.from({ length: TOTAL_REGIONS }, (_, index) => {
                const regionId = index + 1;
                return [regionId, Object.freeze(configForRegion(regionId))];
            })
        )
    );

    const ROLE_MULTIPLIERS = Object.freeze({
        2: Object.freeze([
            Object.freeze([1,2,3,4,5,6,7,8,9,10]),
            Object.freeze([1,2,3,4,5,6,7,8,9,10])
        ]),
        3: Object.freeze([
            Object.freeze([1,2,3,4,5,6,7]),
            Object.freeze([4,5,6,7,8,9,10]),
            Object.freeze([1,2,3,8,9,10])
        ]),
        4: Object.freeze([
            Object.freeze([1,2,3,4,5]),
            Object.freeze([6,7,8,9,10]),
            Object.freeze([1,2,3,4,5]),
            Object.freeze([6,7,8,9,10])
        ]),
        5: Object.freeze([
            Object.freeze([1,4,6,9]),
            Object.freeze([2,5,7,10]),
            Object.freeze([1,3,6,8]),
            Object.freeze([2,4,7,9]),
            Object.freeze([3,5,8,10])
        ]),
        10: Object.freeze([
            Object.freeze([1,6]),
            Object.freeze([2,7]),
            Object.freeze([3,8]),
            Object.freeze([4,9]),
            Object.freeze([5,10]),
            Object.freeze([1,6]),
            Object.freeze([2,7]),
            Object.freeze([3,8]),
            Object.freeze([4,9]),
            Object.freeze([5,10])
        ])
    });

    function requireInt(value, min, max, name) {
        if (!Number.isInteger(value) || value < min || value > max) {
            throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
        }
        return value;
    }

    function operationKey(table, multiplier) {
        return `${table}x${multiplier}`;
    }

    function getRegionConfig(regionId) {
        requireInt(regionId, 1, TOTAL_REGIONS, "regionId");
        return REGION_CONFIG[regionId];
    }

    function hashSeed(value) {
        const text = String(value);
        let hash = 2166136261;
        for (let i = 0; i < text.length; i += 1) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function createPrng(seed) {
        let state = hashSeed(seed) || 0x9e3779b9;
        return function random() {
            state += 0x6D2B79F5;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffled(values, random) {
        const result = [...values];
        for (let i = result.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function orderSlots(slots, seed) {
        const random = createPrng(seed);
        const groups = new Map();

        for (const slot of slots) {
            if (!groups.has(slot.table)) groups.set(slot.table, []);
            groups.get(slot.table).push(slot);
        }

        for (const [table, group] of groups.entries()) {
            groups.set(table, shuffled(group, random));
        }

        const ordered = [];
        let lastTable = null;

        while (ordered.length < slots.length) {
            const activeTables = Array.from(groups.entries())
                .filter(([, group]) => group.length > 0)
                .map(([table]) => table);

            let round = shuffled(activeTables, random);
            if (round.length > 1 && round[0] === lastTable) {
                round = [...round.slice(1), round[0]];
            }

            for (const table of round) {
                const group = groups.get(table);
                if (!group.length) continue;
                ordered.push(group.shift());
                lastTable = table;
            }
        }

        return ordered;
    }

    function createIslandPlan(regionId, islandId, seed) {
        requireInt(islandId, 1, ISLANDS_PER_REGION, "islandId");
        const config = getRegionConfig(regionId);
        const roleMultipliers = ROLE_MULTIPLIERS[config.k];
        const globalIslandIndex = world.toGlobalIslandIndex(regionId, islandId);
        const rotationPosition = (globalIslandIndex - 1) % 10;
        const slots = [];

        roleMultipliers.forEach((multipliers, role) => {
            const table = 1 + ((rotationPosition + role) % TABLES);
            multipliers.forEach((multiplier) => {
                slots.push(Object.freeze({
                    id: `g${globalIslandIndex}-r${regionId}-i${islandId}-t${table}-m${multiplier}-p${role}`,
                    globalIslandIndex,
                    regionId,
                    islandId,
                    role,
                    table,
                    multiplier,
                    exposureType: EXPOSURE_TYPE.PLANNED
                }));
            });
        });

        if (slots.length !== PLANNED_PER_ISLAND) {
            throw new Error(`Invalid matrix for K=${config.k}: expected ${PLANNED_PER_ISLAND} slots`);
        }

        const orderedSlots = orderSlots(slots, `${seed ?? "default"}:g${globalIslandIndex}`);

        return Object.freeze({
            globalIslandIndex,
            regionId,
            islandId,
            k: config.k,
            recoveryGap: config.recoveryGap,
            slots: Object.freeze(orderedSlots)
        });
    }

    function createRegionPlan(regionId, seed) {
        const config = getRegionConfig(regionId);
        const islands = Array.from(
            { length: ISLANDS_PER_REGION },
            (_, index) => createIslandPlan(regionId, index + 1, seed)
        );

        return Object.freeze({
            regionId,
            k: config.k,
            recoveryGap: config.recoveryGap,
            islands: Object.freeze(islands)
        });
    }

    function createCampaignPlan(seed) {
        return Object.freeze({
            regions: Object.freeze(
                Array.from({ length: TOTAL_REGIONS }, (_, index) =>
                    createRegionPlan(index + 1, seed)
                )
            )
        });
    }

    function flattenRegionPlan(regionPlan) {
        return regionPlan.islands.flatMap((island) => island.slots);
    }

    function flattenCampaignPlan(campaignPlan) {
        return campaignPlan.regions.flatMap(flattenRegionPlan);
    }

    function createOperationMasteryState() {
        const mastery = {};
        for (let table = 1; table <= TABLES; table += 1) {
            for (let multiplier = 1; multiplier <= MULTIPLIERS; multiplier += 1) {
                mastery[operationKey(table, multiplier)] = Object.freeze({ correctStreak: 0 });
            }
        }
        return Object.freeze(mastery);
    }

    function createRecoveryState(regionId) {
        const config = getRegionConfig(regionId);
        return Object.freeze({
            regionId,
            recoveryGap: config.recoveryGap,
            mastery: createOperationMasteryState(),
            recoveryQueue: Object.freeze([]),
            plannedExposureCount: 0,
            recoveryAttemptCount: 0
        });
    }

    function retargetRecoveryState(state, regionId) {
        if (!state) return createRecoveryState(regionId);
        const config = getRegionConfig(regionId);
        return Object.freeze({
            ...state,
            regionId,
            recoveryGap: config.recoveryGap
        });
    }

    function advanceRecoveryQueue(queue) {
        return queue.map((item) => Object.freeze({
            ...item,
            remainingGap: Math.max(0, item.remainingGap - 1)
        }));
    }

    function removeRecovery(queue, key) {
        return queue.filter((item) => item.key !== key);
    }

    function enqueueRecovery(queue, table, multiplier, recoveryGap) {
        const key = operationKey(table, multiplier);
        const withoutDuplicate = removeRecovery(queue, key);
        return [
            ...withoutDuplicate,
            Object.freeze({ key, table, multiplier, remainingGap: recoveryGap })
        ];
    }

    function recordAttempt(state, challenge, isCorrect) {
        if (!state || !challenge) throw new TypeError("state and challenge are required");
        requireInt(challenge.table, 1, TABLES, "challenge.table");
        requireInt(challenge.multiplier, 1, MULTIPLIERS, "challenge.multiplier");
        if (![EXPOSURE_TYPE.PLANNED, EXPOSURE_TYPE.RECOVERY].includes(challenge.exposureType)) {
            throw new TypeError("challenge.exposureType is invalid");
        }

        const key = operationKey(challenge.table, challenge.multiplier);
        const current = state.mastery[key] || { correctStreak: 0 };
        let queue = advanceRecoveryQueue(state.recoveryQueue);
        let correctStreak;

        if (isCorrect) {
            correctStreak = Math.min(2, current.correctStreak + 1);
            if (correctStreak === 2) {
                queue = removeRecovery(queue, key);
            } else if (challenge.exposureType === EXPOSURE_TYPE.RECOVERY) {
                queue = enqueueRecovery(
                    queue,
                    challenge.table,
                    challenge.multiplier,
                    state.recoveryGap
                );
            }
        } else {
            correctStreak = 0;
            queue = enqueueRecovery(
                queue,
                challenge.table,
                challenge.multiplier,
                state.recoveryGap
            );
        }

        const mastery = Object.freeze({
            ...state.mastery,
            [key]: Object.freeze({ correctStreak })
        });

        return Object.freeze({
            ...state,
            mastery,
            recoveryQueue: Object.freeze(queue),
            plannedExposureCount: state.plannedExposureCount
                + (challenge.exposureType === EXPOSURE_TYPE.PLANNED ? 1 : 0),
            recoveryAttemptCount: state.recoveryAttemptCount
                + (challenge.exposureType === EXPOSURE_TYPE.RECOVERY ? 1 : 0)
        });
    }

    function peekEligibleRecovery(state) {
        const item = state.recoveryQueue.find((candidate) => candidate.remainingGap === 0);
        return item
            ? Object.freeze({
                regionId: state.regionId,
                table: item.table,
                multiplier: item.multiplier,
                exposureType: EXPOSURE_TYPE.RECOVERY
            })
            : null;
    }

    function dequeueEligibleRecovery(state) {
        const index = state.recoveryQueue.findIndex((candidate) => candidate.remainingGap === 0);
        if (index < 0) return Object.freeze({ state, challenge: null });

        const item = state.recoveryQueue[index];
        const queue = [
            ...state.recoveryQueue.slice(0, index),
            ...state.recoveryQueue.slice(index + 1)
        ];

        return Object.freeze({
            state: Object.freeze({ ...state, recoveryQueue: Object.freeze(queue) }),
            challenge: Object.freeze({
                regionId: state.regionId,
                table: item.table,
                multiplier: item.multiplier,
                exposureType: EXPOSURE_TYPE.RECOVERY
            })
        });
    }

    function relaxRecoveryAtTerminal(state) {
        if (!state.recoveryQueue.length || peekEligibleRecovery(state)) return state;
        const minGap = Math.min(...state.recoveryQueue.map((item) => item.remainingGap));
        return Object.freeze({
            ...state,
            recoveryQueue: Object.freeze(
                state.recoveryQueue.map((item) => Object.freeze({
                    ...item,
                    remainingGap: Math.max(0, item.remainingGap - minGap)
                }))
            )
        });
    }

    function isCampaignPedagogicallyComplete(state) {
        if (state.plannedExposureCount !== PLANNED_PER_CAMPAIGN) return false;
        if (state.recoveryQueue.length !== 0) return false;
        return Object.values(state.mastery).every((item) => item.correctStreak === 2);
    }

    function summarizeSlots(slots) {
        const byTable = Object.fromEntries(
            Array.from({ length: TABLES }, (_, i) => [String(i + 1), 0])
        );
        const byOperation = {};

        for (const slot of slots) {
            byTable[String(slot.table)] += 1;
            const key = operationKey(slot.table, slot.multiplier);
            byOperation[key] = (byOperation[key] || 0) + 1;
        }

        return Object.freeze({
            total: slots.length,
            byTable: Object.freeze(byTable),
            byOperation: Object.freeze(byOperation)
        });
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.scheduler = Object.freeze({
        TOTAL_REGIONS,
        ISLANDS_PER_REGION,
        TABLES,
        MULTIPLIERS,
        PLANNED_PER_ISLAND,
        PLANNED_PER_REGION,
        PLANNED_PER_CAMPAIGN,
        EXPOSURE_TYPE,
        REGION_CONFIG,
        ROLE_MULTIPLIERS,
        operationKey,
        getRegionConfig,
        createIslandPlan,
        createRegionPlan,
        createCampaignPlan,
        flattenRegionPlan,
        flattenCampaignPlan,
        summarizeSlots,
        createOperationMasteryState,
        createRecoveryState,
        retargetRecoveryState,
        recordAttempt,
        peekEligibleRecovery,
        dequeueEligibleRecovery,
        relaxRecoveryAtTerminal,
        isCampaignPedagogicallyComplete
    });
})(globalThis);
