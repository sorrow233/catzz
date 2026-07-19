const test = require('node:test');
const assert = require('node:assert/strict');

test('自动轮播索引循环且拖动点能映射到轨道位置', async () => {
    const { getNextAutoplayIndex, getScrubberPosition } = await import('../../src/utils/AutoplayRail.mjs');

    assert.equal(getNextAutoplayIndex(0, 12), 1);
    assert.equal(getNextAutoplayIndex(11, 12), 0);
    assert.equal(getNextAutoplayIndex(0, 0), 0);
    assert.equal(getScrubberPosition(0, 12), 0);
    assert.equal(getScrubberPosition(11, 12), 100);
    assert.equal(getScrubberPosition(5, 12), 5 / 11 * 100);
});
