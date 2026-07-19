const config = require('./config');
const { ArtworkSync } = require('./lib/artwork-sync');
const { GalleryStore, getGalleryId, mergeGallery } = require('./lib/gallery-store');
const { addMissingImageDimensions } = require('./lib/gallery-dimensions');
const { mapWithConcurrency } = require('./lib/http-client');
const { ImageStore } = require('./lib/image-store');
const { PixivClient } = require('./lib/pixiv-client');

async function main() {
    const galleryStore = new GalleryStore(config.galleryPath);
    const imageStore = new ImageStore({
        artworkDir: config.artworkDir,
        publicArtworkPath: config.publicArtworkPath,
        maxWidth: config.imageMaxWidth,
        quality: config.imageQuality
    });
    const pixiv = new PixivClient({
        userId: config.pixivUserId,
        retries: config.requestRetries,
        timeoutMs: config.requestTimeoutMs
    });

    const existingItems = await galleryStore.read();
    const artworkIds = await pixiv.getArtworkIds();
    const itemsByArtworkId = existingItems.reduce((groups, item) => {
        const artworkId = Number(item.id);
        if (!groups.has(artworkId)) groups.set(artworkId, []);
        groups.get(artworkId).push(item);
        return groups;
    }, new Map());
    const incompleteIds = artworkIds.filter(id => {
        const items = itemsByArtworkId.get(id) || [];
        const expectedPageCount = Math.max(...items.map(item => Number(item.page_count) || 1), 1);
        const uniquePages = new Set(items.map(getGalleryId)).size;
        return items.length === 0 || items.some(item => !item.page_count) || uniquePages < expectedPageCount;
    });
    const targetIds = [...new Set([...artworkIds.slice(0, 12), ...incompleteIds])];

    console.log(`检查 ${targetIds.length} 个新增、近期或分页不完整的投稿。`);
    const artworkSync = new ArtworkSync({ pixiv, imageStore });
    const results = await mapWithConcurrency(
        targetIds,
        config.requestConcurrency,
        artworkId => artworkSync.sync(artworkId, existingItems)
    );

    const completedItems = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
    const failures = results.filter(result => result.status === 'rejected');

    if (completedItems.length === 0) {
        throw new AggregateError(failures.map(result => result.reason), '所有新作品均同步失败');
    }

    const mergedItems = mergeGallery(existingItems, completedItems);
    const dimensionedItems = await addMissingImageDimensions(
        mergedItems,
        config.publicDir,
        config.requestConcurrency,
        { retries: config.requestRetries, timeoutMs: config.requestTimeoutMs }
    );
    await galleryStore.write(dimensionedItems);
    console.log(`同步完成：${new Set(dimensionedItems.map(item => item.id)).size} 个投稿，共 ${dimensionedItems.length} 张图片。`);

    for (const failure of failures) {
        console.warn(`部分作品同步失败，将在下次任务重试：${failure.reason.message}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
