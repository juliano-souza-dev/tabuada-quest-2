const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");

const content = globalThis.TabuadaQuest.content;

test("Região 1 possui exatamente um marco por Ilha", () => {
    for (let islandId = 1; islandId <= 10; islandId += 1) {
        assert.equal(content.getIslandRewards(1, islandId).length, 1);
    }
});

test("Região 1 distribui 4 fragmentos, 3 baús e 3 PETs", () => {
    const rewards = Array.from({ length: 10 }, (_, i) => content.getIslandRewards(1, i + 1)).flat();
    assert.equal(rewards.filter((item) => item.type === "map_fragment").length, 4);
    assert.equal(rewards.filter((item) => item.type === "chest").length, 3);
    assert.equal(rewards.filter((item) => item.type === "pet").length, 3);
});

test("Mapa 1 fecha com o quarto fragmento na Ilha 10", () => {
    const fragments = Array.from({ length: 10 }, (_, i) => content.getIslandRewards(1, i + 1))
        .flat()
        .filter((item) => item.type === "map_fragment");
    assert.deepEqual(fragments.map((item) => item.fragment), [1, 2, 3, 4]);
    assert.deepEqual(content.getIslandRewards(1, 10)[0], {
        type: "map_fragment",
        mapId: 1,
        fragment: 4
    });
});

test("baús ficam nas Ilhas 3, 6 e 9; PETs nas Ilhas 1, 4 e 7", () => {
    const chestIslands = [];
    const petIslands = [];
    for (let islandId = 1; islandId <= 10; islandId += 1) {
        const reward = content.getIslandRewards(1, islandId)[0];
        if (reward.type === "chest") chestIslands.push(islandId);
        if (reward.type === "pet") petIslands.push(islandId);
    }
    assert.deepEqual(chestIslands, [3, 6, 9]);
    assert.deepEqual(petIslands, [1, 4, 7]);
});
