const test = require('node:test');
const assert = require('node:assert/strict');

test('横向叙事画廊选择最接近视口中心的作品', async () => {
    const { findClosestItemIndex } = await import('../../src/utils/HorizontalRail.mjs');

    assert.equal(findClosestItemIndex([200, 700, 1200], 760), 1);
    assert.equal(findClosestItemIndex([200, 700, 1200], 1100), 2);
    assert.equal(findClosestItemIndex([], 500), 0);
});
