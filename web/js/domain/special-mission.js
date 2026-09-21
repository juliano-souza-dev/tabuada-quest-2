(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};

    const VERSION = 1;
    const QUESTION_COUNT = 20;
    const MAP_GATE_GLOBALS = Object.freeze({
        1: 10,
        2: 30,
        3: 50,
        4: 70,
        5: 100
    });

    function requireMapId(mapId) {
        const normalized = Number(mapId);
        if (!Number.isInteger(normalized) || normalized < 1 || normalized > 5) {
            throw new RangeError("mapId must be between 1 and 5");
        }
        return normalized;
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

    function shuffled(values, seed) {
        const result = [...values];
        const random = createPrng(seed);
        for (let i = result.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function getIntroducedOperations(mapId) {
        const normalizedMapId = requireMapId(mapId);
        const gateGlobal = MAP_GATE_GLOBALS[normalizedMapId];
        const unique = new Map();

        for (let globalIndex = 1; globalIndex <= gateGlobal; globalIndex += 1) {
            const location = TQ.domain.worldStructure.fromGlobalIslandIndex(globalIndex);
            const plan = TQ.domain.scheduler.createIslandPlan(
                location.regionId,
                location.islandId,
                "special-mission-source"
            );
            for (const slot of plan.slots) {
                const key = TQ.domain.scheduler.operationKey(slot.table, slot.multiplier);
                if (!unique.has(key)) {
                    unique.set(key, Object.freeze({
                        key,
                        table: slot.table,
                        multiplier: slot.multiplier
                    }));
                }
            }
        }

        return Object.freeze(Array.from(unique.values()));
    }

    function createMission(mapId, seed) {
        const normalizedMapId = requireMapId(mapId);
        const operations = getIntroducedOperations(normalizedMapId);
        if (!operations.length) throw new Error("No introduced operations available");

        const ordered = shuffled(
            operations,
            seed || `special-map-${normalizedMapId}`
        );
        const questions = [];
        for (let i = 0; i < QUESTION_COUNT; i += 1) {
            const op = ordered[i % ordered.length];
            questions.push(Object.freeze({
                id: `special-map-${normalizedMapId}-q${i + 1}-${op.key}`,
                table: op.table,
                multiplier: op.multiplier
            }));
        }

        return Object.freeze({
            version: VERSION,
            mapId: normalizedMapId,
            seed: String(seed || `special-map-${normalizedMapId}`),
            questions: Object.freeze(questions),
            cursor: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            totalAnswered: 0,
            phase: "question",
            lastFeedback: null
        });
    }

    function currentQuestion(session) {
        if (!session || session.phase !== "question") return null;
        return session.questions?.[session.cursor] || null;
    }

    function answer(session, value) {
        const question = currentQuestion(session);
        if (!question) throw new Error("No active special mission question");

        const expected = question.table * question.multiplier;
        const received = Number(value);
        const isCorrect = Number.isFinite(received) && received === expected;

        return Object.freeze({
            ...session,
            cursor: session.cursor + 1,
            correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: session.wrongAnswers + (isCorrect ? 0 : 1),
            totalAnswered: session.totalAnswered + 1,
            phase: "feedback",
            lastFeedback: Object.freeze({
                table: question.table,
                multiplier: question.multiplier,
                expected,
                received,
                isCorrect
            })
        });
    }

    function continueAfterFeedback(session) {
        if (!session || session.phase !== "feedback") return session;
        return Object.freeze({
            ...session,
            phase: session.cursor >= QUESTION_COUNT ? "complete" : "question",
            lastFeedback: null
        });
    }

    function createAnswerOptions(session) {
        const question = currentQuestion(session);
        if (!question) return Object.freeze([]);

        const correct = question.table * question.multiplier;
        const candidates = [
            correct,
            correct + question.table,
            correct - question.table,
            correct + question.multiplier,
            correct - question.multiplier,
            correct + 1,
            correct - 1,
            correct + 10,
            correct - 10
        ].filter((value) => Number.isInteger(value) && value > 0);

        const unique = Array.from(new Set(candidates));
        let filler = 2;
        while (unique.length < 4) {
            if (!unique.includes(correct + filler)) unique.push(correct + filler);
            filler += 1;
        }

        return Object.freeze(
            shuffled(unique.slice(0, 4), `${session.seed}:${question.id}:${session.cursor}`)
        );
    }

    function buildResult(session) {
        if (!session || session.phase !== "complete") {
            throw new Error("Special mission is not complete");
        }
        return Object.freeze({
            mapId: session.mapId,
            totalQuestions: QUESTION_COUNT,
            correctAnswers: session.correctAnswers,
            wrongAnswers: session.wrongAnswers
        });
    }

    TQ.domain = TQ.domain || {};
    TQ.domain.specialMission = Object.freeze({
        VERSION,
        QUESTION_COUNT,
        MAP_GATE_GLOBALS,
        getIntroducedOperations,
        createMission,
        currentQuestion,
        answer,
        continueAfterFeedback,
        createAnswerOptions,
        buildResult
    });
})(globalThis);
