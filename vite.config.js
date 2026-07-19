import { defineConfig } from 'vite';
import fs from 'node:fs';
import { buildSeoMetadata, serializeStructuredData } from './scripts/seo-metadata.mjs';

function readPublicJson(filename) {
    return JSON.parse(fs.readFileSync(new URL(`./public/${filename}`, import.meta.url), 'utf8'));
}

function escapeHtmlAttribute(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function createSeoPlugin() {
    return {
        name: 'catzz-seo-metadata',
        transformIndexHtml(html) {
            const metadata = buildSeoMetadata({
                galleryData: readPublicJson('gallery.json'),
                videoData: readPublicJson('videos.json')
            });
            const replacements = {
                '__CATZZ_SEO_TITLE__': escapeHtmlAttribute(metadata.title),
                '__CATZZ_SEO_DESCRIPTION__': escapeHtmlAttribute(metadata.description),
                '__CATZZ_SEO_IMAGE__': escapeHtmlAttribute(metadata.socialImage),
                '__CATZZ_SEO_IMAGE_TYPE__': escapeHtmlAttribute(metadata.socialImageType),
                '__CATZZ_SEO_IMAGE_ALT__': escapeHtmlAttribute(metadata.socialImageAlt),
                '__CATZZ_SEO_IMAGE_WIDTH__': String(metadata.socialImageWidth),
                '__CATZZ_SEO_IMAGE_HEIGHT__': String(metadata.socialImageHeight),
                '__CATZZ_SEO_LAST_MODIFIED__': escapeHtmlAttribute(metadata.dateModified),
                '__CATZZ_SEO_GALLERY_COUNT__': String(metadata.artworkCount),
                '__CATZZ_SEO_VIDEO_COUNT__': String(metadata.videoCount),
                '__CATZZ_SEO_JSON_LD__': serializeStructuredData(metadata.structuredData)
            };

            return Object.entries(replacements).reduce((output, [token, value]) => {
                return output.split(token).join(value);
            }, html);
        }
    };
}

export default defineConfig({
    plugins: [createSeoPlugin()],
    server: {
        open: true
    }
});
