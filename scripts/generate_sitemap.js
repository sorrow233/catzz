const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://catzz.work';
const GALLERY_PATH = path.join(__dirname, '../public/gallery.json');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml'); // Note: dirname is scripts/

async function generateSitemap() {
    try {
        const galleryData = JSON.parse(fs.readFileSync(GALLERY_PATH, 'utf8'));

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

        sitemap = sitemap.replace('</url>', '');

        galleryData.forEach(item => {
            const imgUrl = item.remote_url || item.url || item.original_url_display;
            if (imgUrl) {
                sitemap += `
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
      <image:caption>${escapeXml(item.description || item.tags.join(', '))}</image:caption>
    </image:image>`;
            }
        });

        sitemap += `
  </url>
</urlset>`;

        fs.writeFileSync(OUTPUT_PATH, sitemap);
        console.log(`Sitemap generated at ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
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
