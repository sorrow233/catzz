const test = require('node:test');
const assert = require('node:assert/strict');

test('瀑布流跨度根据内容高度、基础行高与间距计算', async () => {
    const { calculateMasonrySpan } = await import('../../src/utils/MasonryGrid.mjs');

    assert.equal(calculateMasonrySpan(200, 8, 24), 7);
    assert.equal(calculateMasonrySpan(456, 8, 24), 15);
    assert.equal(calculateMasonrySpan(0, 8, 24), 1);
});

test('瀑布流跨度对非法尺寸安全降级', async () => {
    const { calculateMasonrySpan } = await import('../../src/utils/MasonryGrid.mjs');

    assert.equal(calculateMasonrySpan(Number.NaN, 8, 24), 1);
    assert.equal(calculateMasonrySpan(200, 0, 24), 1);
});
