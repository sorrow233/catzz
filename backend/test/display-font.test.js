const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('艺术字体只引用单一 Latin WOFF2 子集', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../../src/utils/displayFont.mjs'), 'utf8');

    assert.match(source, /italiana-latin-400-normal\.woff2\?url/);
    assert.match(source, /requestIdleCallback/);
    assert.doesNotMatch(source, /latin-ext|cyrillic|italic-[0-9]/);
});
