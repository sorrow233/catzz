const test = require('node:test');
const assert = require('node:assert/strict');

test('SEO 元数据随插画与视频数据自动更新且不声明虚假搜索功能', async () => {
    const { buildSeoMetadata, serializeStructuredData } = await import('../../scripts/seo-metadata.mjs');
    const metadata = buildSeoMetadata({
        galleryData: [{
            id: 1,
            title: '雨夜',
            url: '/artworks/1.webp',
            width: 1920,
            height: 1080,
            created_at: '2026-07-04T16:05:00Z',
            pixiv_url: 'https://www.pixiv.net/artworks/1'
        }],
        videoData: [{
            title: '创作过程',
            url: 'https://www.bilibili.com/video/BV1test',
            thumbnail: '/videos/BV1test.webp',
            published_at: '2026-07-05T09:00:00Z'
        }]
    });
    const serialized = serializeStructuredData(metadata.structuredData);

    assert.equal(metadata.artworkCount, 1);
    assert.equal(metadata.videoCount, 1);
    assert.equal(metadata.socialImage, 'https://catzz.work/artworks/1.webp');
    assert.equal(metadata.dateModified, '2026-07-05T09:00:00.000Z');
    assert.match(metadata.description, /1 张插画与 1 个哔哩哔哩投稿/);
    assert.match(serialized, /ImageGallery/);
    assert.doesNotMatch(serialized, /SearchAction/);
});
