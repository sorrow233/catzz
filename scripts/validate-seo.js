const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(__dirname, '../dist/sitemap.xml'), 'utf8');
const failures = [];

if (html.includes('__CATZZ_SEO_')) failures.push('SEO 构建占位符未被替换');
if (!html.includes('<html lang="zh-CN"')) failures.push('缺少默认 HTML 语言标记');
if (!html.includes('max-image-preview:large')) failures.push('缺少图片抓取预览指令');
if (!html.includes('rel="canonical"')) failures.push('缺少 canonical 链接');
if (!html.includes('id="structured-data"')) failures.push('缺少结构化数据');
if (!sitemap.includes('<lastmod>')) failures.push('站点地图缺少更新时间');
if (!sitemap.includes('hreflang="zh-CN"')) failures.push('站点地图缺少中文 hreflang');

const structuredMatch = html.match(/<script id="structured-data" type="application\/ld\+json">([^<]+)<\/script>/);
if (!structuredMatch) {
    failures.push('无法读取结构化数据');
} else {
    try {
        const structuredData = JSON.parse(structuredMatch[1]);
        const serialized = JSON.stringify(structuredData);
        if (!serialized.includes('ImageGallery')) failures.push('结构化数据缺少 ImageGallery');
        if (serialized.includes('SearchAction')) failures.push('结构化数据声明了并不存在的站内搜索');
    } catch {
        failures.push('结构化数据不是合法 JSON');
    }
}

if (failures.length > 0) {
    throw new Error(`SEO validation failed:\n- ${failures.join('\n- ')}`);
}

console.log('SEO metadata and sitemap validation passed.');
