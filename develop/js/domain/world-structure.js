(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const TOTAL_REGIONS = 22;
    const ISLANDS_PER_REGION = 5;
    const TOTAL_ISLANDS = TOTAL_REGIONS * ISLANDS_PER_REGION;

    function requireInteger(value, min, max, name) {
        if (!Number.isInteger(value) || value < min || value > max) {
            throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
        }
        return value;
    }

    function toGlobalIslandIndex(regionId, islandId) {
        requireInteger(regionId, 1, TOTAL_REGIONS, "regionId");
        requireInteger(islandId, 1, ISLANDS_PER_REGION, "islandId");
        return ((regionId - 1) * ISLANDS_PER_REGION) + islandId;
    }

    function fromGlobalIslandIndex(globalIslandIndex) {
        requireInteger(globalIslandIndex, 1, TOTAL_ISLANDS, "globalIslandIndex");
        return Object.freeze({
            globalIslandIndex,
            regionId: Math.floor((globalIslandIndex - 1) / ISLANDS_PER_REGION) + 1,
            islandId: ((globalIslandIndex - 1) % ISLANDS_PER_REGION) + 1
        });
    }

    function fromLegacyLocation(regionId, islandId) {
        requireInteger(regionId, 1, 11, "legacyRegionId");
        requireInteger(islandId, 1, 10, "legacyIslandId");
        const globalIslandIndex = ((regionId - 1) * 10) + islandId;
        return fromGlobalIslandIndex(globalIslandIndex);
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.worldStructure = Object.freeze({
        TOTAL_REGIONS,
        ISLANDS_PER_REGION,
        TOTAL_ISLANDS,
        toGlobalIslandIndex,
        fromGlobalIslandIndex,
        fromLegacyLocation
    });
})(globalThis);
