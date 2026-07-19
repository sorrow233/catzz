const test = require('node:test');
const assert = require('node:assert/strict');

test('横向叙事画廊选择最接近视口中心的作品', async () => {
    const { findClosestItemIndex } = await import('../../src/utils/HorizontalRail.mjs');

    assert.equal(findClosestItemIndex([200, 700, 1200], 760), 1);
    assert.equal(findClosestItemIndex([200, 700, 1200], 1100), 2);
    assert.equal(findClosestItemIndex([], 500), 0);
});

test('视频拖动条与实际滚动距离保持连续映射', async () => {
    const {
        clampRailRatio,
        getScrollLeftFromScrubber,
        getScrubberValue
    } = await import('../../src/utils/HorizontalRail.mjs');

    assert.equal(clampRailRatio(-0.5), 0);
    assert.equal(clampRailRatio(1.5), 1);
    assert.equal(getScrollLeftFromScrubber(375, 1000, 4000), 1500);
    assert.equal(getScrubberValue(1500, 4000, 1000), 375);
    assert.equal(getScrollLeftFromScrubber(500, 0, 4000), 0);
    assert.equal(getScrubberValue(500, 0, 1000), 0);
});
