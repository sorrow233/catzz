const test = require('node:test');
const assert = require('node:assert/strict');

test('自动轮播索引循环且连续拖动值能映射到轨道位置', async () => {
    const {
        getScrubberIndex,
        getScrubberMaximum,
        getScrubberPosition
    } = await import('../../src/utils/ImpressionsProgress.mjs');

    const { getNextAutoplayIndex } = await import('../../src/utils/AutoplayRail.mjs');

    assert.equal(getNextAutoplayIndex(0, 12), 1);
    assert.equal(getNextAutoplayIndex(11, 12), 0);
    assert.equal(getNextAutoplayIndex(0, 0), 0);
    assert.equal(getScrubberPosition(0, 12), 0);
    assert.equal(getScrubberPosition(11, 12), 100);
    assert.equal(getScrubberPosition(5, 12), 5 / 11 * 100);
    assert.equal(getScrubberMaximum(12), 1100);
    assert.equal(getScrubberMaximum(1), 0);
    assert.equal(getScrubberIndex(575, 12), 5.75);
    assert.equal(getScrubberIndex(1500, 12), 11);
});
