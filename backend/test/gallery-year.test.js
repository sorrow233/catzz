const test = require('node:test');
const assert = require('node:assert/strict');

test('作品年份固定使用 UTC，避免时区导致跨年错组', async () => {
    const { getArtworkYear } = await import('../../src/utils/GalleryYearManager.mjs');

    assert.equal(getArtworkYear('2025-12-31T16:30:00-08:00'), 2026);
    assert.equal(getArtworkYear('2026-01-01T00:00:00Z'), 2026);
    assert.equal(getArtworkYear('无效日期'), null);
});

test('侧边年份索引去重并保持从新到旧', async () => {
    const { sortGalleryYears } = await import('../../src/utils/GalleryYearRail.mjs');

    assert.deepEqual(sortGalleryYears([2024, '2026', 2025, 2024, 'invalid']), [2026, 2025, 2024]);
});
