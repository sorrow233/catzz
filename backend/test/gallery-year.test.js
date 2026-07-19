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

test('年份跳转位置扣除粘性页头与留白并限制为非负值', async () => {
    const { calculateYearScrollTop } = await import('../../src/utils/YearJumpController.mjs');

    assert.equal(calculateYearScrollTop({ scrollY: 1_000, sectionTop: 500, headerHeight: 120 }), 1_356);
    assert.equal(calculateYearScrollTop({ scrollY: 0, sectionTop: 80, headerHeight: 120 }), 0);
    assert.equal(calculateYearScrollTop({ scrollY: 0, sectionTop: Number.NaN, headerHeight: 120 }), 0);
});
