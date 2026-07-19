const test = require('node:test');
const assert = require('node:assert/strict');

test('宽幅插画跨栏，竖幅与无效尺寸保持标准列宽', async () => {
    const { getArtworkLayout } = await import('../../src/utils/artworkLayout.mjs');

    assert.equal(getArtworkLayout(1920, 1080), 'wide');
    assert.equal(getArtworkLayout(1500, 1000), 'wide');
    assert.equal(getArtworkLayout(1200, 1000), 'standard');
    assert.equal(getArtworkLayout(1080, 1920), 'standard');
    assert.equal(getArtworkLayout(0, 0), 'standard');
});
