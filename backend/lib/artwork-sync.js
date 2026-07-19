const { getGalleryId } = require('./gallery-store');

class ArtworkSync {
    constructor({ pixiv, imageStore }) {
        this.pixiv = pixiv;
        this.imageStore = imageStore;
    }

    async sync(artworkId, existingItems) {
        const artwork = await this.pixiv.getArtwork(artworkId);
        const existingByPage = new Map(
            existingItems
                .filter(item => Number(item.id) === artworkId)
                .map(item => [getGalleryId(item), item])
        );
        const pages = artwork.page_count > 1
            ? await this.pixiv.getArtworkPages(artworkId)
            : [{ page_index: 0, original_url: artwork.original_url }];

        const synchronizedItems = [];
        for (const page of pages) {
            const galleryId = `${artworkId}_p${page.page_index}`;
            const existing = existingByPage.get(galleryId);
            let publicImagePath = existing?.url;

            if (!publicImagePath) {
                const imageBuffer = await this.pixiv.downloadImage(page.original_url, artworkId);
                publicImagePath = await this.imageStore.save(artworkId, page.page_index, imageBuffer);
            }

            synchronizedItems.push({
                ...existing,
                ...artwork,
                gallery_id: galleryId,
                page_index: page.page_index,
                page_count: pages.length,
                original_url: page.original_url,
                local_path: existing?.local_path || publicImagePath.replace(/^\//, ''),
                remote_url: existing?.remote_url || publicImagePath,
                url: publicImagePath,
                original_url_display: existing?.original_url_display || publicImagePath
            });
        }

        return synchronizedItems;
    }
}

module.exports = { ArtworkSync };
