const test = require('node:test');
const assert = require('node:assert/strict');

test('最近活动按日期倒序截取且不修改原数组', async () => {
    const { selectRecentActivities } = await import('../../src/utils/activity.mjs');
    const source = [
        { id: 1, page_index: 0, created_at: '2026-01-01T00:00:00Z', url: '/1', pixiv_url: 'https://pixiv/1' },
        { id: 1, page_index: 1, created_at: '2026-01-01T00:00:00Z', url: '/1-2', pixiv_url: 'https://pixiv/1' },
        { id: 3, created_at: '2026-03-01T00:00:00Z', url: '/3', pixiv_url: 'https://pixiv/3' },
        { id: 2, created_at: '2026-02-01T00:00:00Z', url: '/2', pixiv_url: 'https://pixiv/2' }
    ];

    assert.deepEqual(selectRecentActivities(source, 2).map(item => item.id), [3, 2]);
    assert.deepEqual(source.map(item => item.id), [1, 1, 3, 2]);
});
