const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeGallery } = require('../lib/gallery-store');

test('mergeGallery 去重、覆盖旧记录并按时间倒序排列', () => {
    const existing = [
        { id: 1, title: '旧标题', created_at: '2026-01-01T00:00:00Z' },
        { id: 2, title: '第二条', created_at: '2026-02-01T00:00:00Z' }
    ];
    const incoming = [
        { id: 1, title: '新标题', created_at: '2026-01-01T00:00:00Z' },
        { id: 3, title: '最新', created_at: '2026-03-01T00:00:00Z' }
    ];

    const result = mergeGallery(existing, incoming);

    assert.deepEqual(result.map(item => item.id), [3, 2, 1]);
    assert.equal(result[2].title, '新标题');
});
