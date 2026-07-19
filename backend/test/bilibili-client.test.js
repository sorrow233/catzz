const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMixinKey, normalizeVideo, signWbiParameters } = require('../lib/bilibili-client');

test('WBI 混合密钥和签名参数保持确定性', () => {
    const key = buildMixinKey('abcdefghijklmnopqrstuvwxyz123456', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ654321');
    const query = signWbiParameters({ mid: '308124', pn: 1 }, key, 1_700_000_000);

    assert.equal(key.length, 32);
    assert.match(query, /^mid=308124&pn=1&wts=1700000000&w_rid=[a-f0-9]{32}$/);
});

test('B 站投稿转换为前端稳定数据结构', () => {
    const video = normalizeVideo({
        bvid: 'BV1demo',
        title: '测试投稿',
        description: '',
        pic: 'http://i0.hdslb.com/demo.jpg',
        created: 1_700_000_000,
        length: '01:20',
        play: 10,
        comment: 2
    }, '308124');

    assert.equal(video.url, 'https://www.bilibili.com/video/BV1demo');
    assert.equal(video.remote_thumbnail, 'https://i0.hdslb.com/demo.jpg');
    assert.equal(video.source, 'bilibili');
});
