const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeGallery } = require('../lib/gallery-store');

test('mergeGallery 去重、覆盖旧记录并按时间倒序排列', () => {
    const existing = [
        { id: 1, page_index: 0, title: '旧标题', created_at: '2026-01-01T00:00:00Z' },
        { id: 2, page_index: 0, title: '第二条', created_at: '2026-02-01T00:00:00Z' }
    ];
    const incoming = [
        { id: 1, page_index: 0, title: '新标题', created_at: '2026-01-01T00:00:00Z' },
        { id: 1, page_index: 1, title: '新标题', created_at: '2026-01-01T00:00:00Z' },
        { id: 3, page_index: 0, title: '最新', created_at: '2026-03-01T00:00:00Z' }
    ];

    const result = mergeGallery(existing, incoming);

    assert.deepEqual(result.map(item => `${item.id}:${item.page_index}`), ['3:0', '2:0', '1:0', '1:1']);
    assert.equal(result[2].title, '新标题');
    assert.deepEqual(result.map(item => item.gallery_id), ['3_p0', '2_p0', '1_p0', '1_p1']);
});
