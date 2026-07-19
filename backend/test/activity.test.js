const test = require('node:test');
const assert = require('node:assert/strict');

test('视频链接仅接纳哔哩哔哩 BV 投稿并忽略站外与直播链接', async () => {
    const { extractVideoUrl } = await import('../../src/utils/activity.mjs');

    assert.equal(
        extractVideoUrl('试听 https://www.bilibili.com/video/BV1zK42147zd/'),
        'https://www.bilibili.com/video/BV1zK42147zd/'
    );
    assert.equal(extractVideoUrl('站外视频 https://youtu.be/FADGS23Z9ZA'), '');
    assert.equal(extractVideoUrl('直播 https://live.bilibili.com/42481'), '');
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

test('视频活动只筛选哔哩哔哩投稿并识别平台', async () => {
    const { getVideoPlatform, selectVideoActivities } = await import('../../src/utils/activity.mjs');
    const source = [
        { id: 1, created_at: '2026-01-01T00:00:00Z', url: '/1', pixiv_url: 'https://pixiv/1', description: '普通插画' },
        { id: 2, created_at: '2025-01-01T00:00:00Z', url: '/2', pixiv_url: 'https://pixiv/2', description: 'https://www.bilibili.com/video/BV1demo' },
        { id: 3, created_at: '2024-01-01T00:00:00Z', url: '/3', pixiv_url: 'https://pixiv/3', description: 'https://youtu.be/demo123' }
    ];

    assert.deepEqual(selectVideoActivities(source).map(item => item.id), [2]);
    assert.equal(getVideoPlatform('https://www.bilibili.com/video/BV1demo'), 'BILIBILI');
    assert.equal(getVideoPlatform('https://www.nicovideo.jp/watch/sm123'), '');
});
