
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://catzz.work';
const GALLERY_PATH = path.join(__dirname, '../public/gallery.json');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml'); // Or dist/sitemap.xml if running post-build

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

        // Add images to the homepage entry (since it's a single page gallery)
        // Or add individual entries if we had individual pages.
        // Strategy: Enhance the main page entry with image extensions

        // We can also list the images as separate URLs if they were accessible pages, 
        // but here we are telling Google "these images are on this page".
        // Actually, let's create a robust "image sitemap" attached to the main URL 
        // OR separate URLs if we want to deep link (but SPA deep linking needs care).
        // Safest bet for now: Associate all images with the root URL.

        sitemap = sitemap.replace('</url>', ''); // Re-open the root url tag

        galleryData.forEach(item => {
            // Use remote_url or original_url_display
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
