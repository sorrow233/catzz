const test = require('node:test');
const assert = require('node:assert/strict');

test('自动轮播到末尾后回到第一幅且安全处理空列表', async () => {
    const { getNextAutoplayIndex } = await import('../../src/utils/AutoplayRail.mjs');

    assert.equal(getNextAutoplayIndex(0, 12), 1);
    assert.equal(getNextAutoplayIndex(11, 12), 0);
    assert.equal(getNextAutoplayIndex(0, 0), 0);
});
