const test = require('node:test');
const assert = require('node:assert/strict');

test('同一静态数据资源只请求并解析一次', async () => {
    const originalFetch = global.fetch;
    let requestCount = 0;
    global.fetch = async () => {
        requestCount += 1;
        return {
            ok: true,
            async json() {
                return [{ id: 1 }];
            }
        };
    };

    try {
        const { loadJsonResource } = await import('../../src/utils/contentData.mjs');
        const path = `/performance-test-${Date.now()}.json`;
        const [first, second] = await Promise.all([
            loadJsonResource(path),
            loadJsonResource(path)
        ]);

        assert.equal(requestCount, 1);
        assert.strictEqual(first, second);
    } finally {
        global.fetch = originalFetch;
    }
});
