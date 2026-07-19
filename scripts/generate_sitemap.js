const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://catzz.work';
const GALLERY_PATH = path.join(__dirname, '../public/gallery.json');
const VIDEOS_PATH = path.join(__dirname, '../public/videos.json');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml'); // Note: dirname is scripts/
const LANGUAGE_URLS = {
    'zh-CN': `${BASE_URL}/`,
    en: `${BASE_URL}/?lang=en`,
    ja: `${BASE_URL}/?lang=ja`,
    ko: `${BASE_URL}/?lang=ko`
};

async function generateSitemap() {
    try {
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_PATH, 'utf8'));
        const videoData = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf8'));
        const latestDate = getLatestContentDate(galleryData, videoData);

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
`;

        // Add hreflang links for each language
        Object.entries(LANGUAGE_URLS).forEach(([lang, href]) => {
            sitemap += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>\n`;
        });
        sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/"/>\n`;

        // Add gallery images to the main URL
        galleryData.forEach(item => {
            const imgUrl = item.remote_url || item.url || item.original_url_display;
            if (imgUrl) {
                const absoluteImageUrl = new URL(imgUrl, BASE_URL).toString();
                const caption = getImageCaption(item);
                sitemap += `    <image:image>
      <image:loc>${escapeXml(absoluteImageUrl)}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>\n`;
            }
        });

        sitemap += `  </url>
</urlset>`;

        fs.writeFileSync(OUTPUT_PATH, sitemap);
        console.log(`Sitemap generated at ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

function getLatestContentDate(galleryData, videoData) {
    const timestamps = [
        ...galleryData.map(item => item.created_at),
        ...videoData.map(item => item.published_at)
    ].map(value => new Date(value).getTime()).filter(Number.isFinite);
    if (timestamps.length === 0) return new Date(0).toISOString().slice(0, 10);
    return new Date(Math.max(...timestamps)).toISOString().slice(0, 10);
}

function getImageCaption(item) {
    const description = String(item.description || '').trim();
    const meaningfulDescription = description.replace(/[\s~_.—-]/g, '');
    if (meaningfulDescription.length > 1) return description;
    const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean).join(', ') : '';
    return tags || String(item.title || 'Catzz illustration');
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

generateSitemap();
