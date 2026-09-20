const test = require("node:test");
const assert = require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/screens/regions-screen.js");

const regions = globalThis.TabuadaQuest.screens.regions;
const layout = regions.REGIONS_LAYOUT;

test("regions layout keeps canonical 941x1672 geometry", () => {
    assert.deepEqual(layout.viewport, { width: 941, height: 1672 });
    assert.deepEqual(layout.back, { x: 8, y: 8, width: 112, height: 112 });
    assert.equal(Object.keys(layout.regions).length, 11);
});

test("documented pixel slots are preserved", () => {
    assert.deepEqual(layout.regions[1].number, { x: 135, y: 310, width: 48, height: 50 });
    assert.deepEqual(layout.regions[10].status, { x: 105, y: 1271, width: 160, height: 35 });
    assert.deepEqual(layout.regions[11].fragments, { x: 702, y: 1264, width: 86, height: 22 });
    assert.deepEqual(layout.regions[11].finalChest, { x: 558, y: 1487, width: 268, height: 35 });
});

test("cover geometry uses one scale for artwork and overlays", () => {
    const portrait = regions.computeStageGeometry(394, 699);
    const expected = Math.max(394 / 941, 699 / 1672);
    assert.equal(portrait.scale, expected);
    assert.equal(portrait.renderWidth, 941 * expected);
    assert.equal(portrait.renderHeight, 1672 * expected);
    assert.equal(portrait.offsetX, (394 - portrait.renderWidth) / 2);
    assert.equal(portrait.offsetY, (699 - portrait.renderHeight) / 2);
});

test("region state labels are derived deterministically", () => {
    assert.equal(regions.formatRegionStatus("locked", 0, 10), "BLOQUEADA 🔒");
    assert.equal(regions.formatRegionStatus("available", 0, 10), "0/10 • EXPLORAR");
    assert.equal(regions.formatRegionStatus("in_progress", 4, 10), "4/10 • CONTINUAR");
    assert.equal(regions.formatRegionStatus("completed", 10, 10), "10/10 • CONCLUÍDA ✓");
});

test("final journey labels reflect unlock and claim states", () => {
    assert.equal(regions.formatIsland10State({
        island10Completed: false,
        island10Unlocked: false
    }), "BLOQUEADA 🔒");
    assert.equal(regions.formatIsland10State({
        island10Completed: false,
        island10Unlocked: true
    }), "DISPONÍVEL");
    assert.equal(regions.formatFinalChestState({
        finalGrandChestClaimed: false,
        finalGrandChestUnlocked: true
    }), "ABRIR BAÚ");
    assert.equal(regions.formatFinalChestState({
        finalGrandChestClaimed: true,
        finalGrandChestUnlocked: true
    }), "RESGATADO ✓");
});
