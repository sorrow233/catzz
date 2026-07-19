const test = require('node:test');
const assert = require('node:assert/strict');
const { addMissingImageDimensions } = require('../lib/gallery-dimensions');

test('已有合法尺寸的作品不需要读取图片文件', async () => {
    const items = [{ id: 1, url: '/missing.webp', width: 1200, height: 800 }];
    const result = await addMissingImageDimensions(items, '/not-used', 1);

    assert.strictEqual(result[0], items[0]);
});
