const test = require('node:test');
const assert = require('node:assert/strict');
const { mapWithConcurrency } = require('../lib/http-client');

test('mapWithConcurrency 遵守并发上限并保留输入顺序', async () => {
    let active = 0;
    let peak = 0;
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async value => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise(resolve => setTimeout(resolve, 5));
        active -= 1;
        return value * 2;
    });

    assert.equal(peak, 2);
    assert.deepEqual(results.map(result => result.value), [2, 4, 6, 8, 10]);
});

test('mapWithConcurrency 隔离单项失败，不阻塞其他任务', async () => {
    const results = await mapWithConcurrency([1, 2, 3], 3, async value => {
        if (value === 2) throw new Error('预期失败');
        return value;
    });

    assert.deepEqual(results.map(result => result.status), ['fulfilled', 'rejected', 'fulfilled']);
});
