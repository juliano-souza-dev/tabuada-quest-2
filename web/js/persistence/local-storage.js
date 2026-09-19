(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const STORAGE_KEY = "tabuadaQuest.playerState";

    function resolveDomain() {
        if (!TQ.domain || !TQ.domain.playerState) {
            throw new Error("player-state module must be loaded before persistence");
        }
        return TQ.domain.playerState;
    }

    function loadState(storage) {
        const domain = resolveDomain();

        try {
            const raw = storage.getItem(STORAGE_KEY);
            if (!raw) {
                return domain.createInitialState();
            }

            const parsed = JSON.parse(raw);
            return domain.normalizeState(parsed);
        } catch {
            return domain.createInitialState();
        }
    }

    function saveState(storage, state) {
        const domain = resolveDomain();
        const normalized = domain.normalizeState(state);
        storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    TQ.persistence = TQ.persistence || {};
    TQ.persistence.localStorage = Object.freeze({
        STORAGE_KEY,
        loadState,
        saveState
    });
})(globalThis);
