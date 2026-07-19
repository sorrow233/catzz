const test = require('node:test');
const assert = require('node:assert/strict');

test('活动链接支持主流视频平台并忽略普通文本', async () => {
    const { extractVideoUrl } = await import('../../src/utils/activity.mjs');

    assert.equal(
        extractVideoUrl('试听 https://www.nicovideo.jp/watch/sm43431591'),
        'https://www.nicovideo.jp/watch/sm43431591'
    );
    assert.equal(
        extractVideoUrl('视频 https://youtu.be/FADGS23Z9ZA?si=demo'),
        'https://youtu.be/FADGS23Z9ZA'
    );
    assert.equal(extractVideoUrl('普通作品说明'), '');
});

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
