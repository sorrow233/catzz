const fs = require('node:fs/promises');

function mergeGallery(existingItems, incomingItems) {
    const itemsById = new Map();
    for (const item of existingItems) itemsById.set(getGalleryId(item), normalizeGalleryItem(item));
    for (const item of incomingItems) itemsById.set(getGalleryId(item), normalizeGalleryItem(item));

    return [...itemsById.values()].sort((left, right) => {
        const dateDifference = new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        if (dateDifference !== 0) return dateDifference;
        return (Number(left.page_index) || 0) - (Number(right.page_index) || 0);
    });
}

function normalizeGalleryItem(item) {
    return {
        ...item,
        gallery_id: getGalleryId(item),
        page_index: Number(item.page_index) || 0,
        page_count: Number(item.page_count) || 1
    };
}

function getGalleryId(item) {
    return item.gallery_id || `${item.id}_p${Number(item.page_index) || 0}`;
}

class GalleryStore {
    constructor(galleryPath) {
        this.galleryPath = galleryPath;
    }

    async read() {
        return JSON.parse(await fs.readFile(this.galleryPath, 'utf8'));
    }

    async write(items) {
        const temporaryPath = `${this.galleryPath}.tmp`;
        await fs.writeFile(temporaryPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
        await fs.rename(temporaryPath, this.galleryPath);
    }
}

module.exports = { GalleryStore, getGalleryId, mergeGallery, normalizeGalleryItem };
