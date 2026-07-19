const test = require('node:test');
const assert = require('node:assert/strict');

test('视频前端模型使用 UTC 日期并清理描述空白', async () => {
    const { createVideoViewModel } = await import('../../src/utils/videoView.mjs');
    const video = createVideoViewModel({
        id: 'BV1demo',
        title: '标题',
        published_at: '2026-01-01T00:00:00Z',
        thumbnail: '/videos/BV1demo.webp',
        url: 'https://www.bilibili.com/video/BV1demo',
        duration: '01:20',
        description: '第一行\n  第二行'
    });

    assert.equal(video.date, '2026.01.01');
    assert.equal(video.description, '第一行 第二行');
});
