const config = require('./config');
const { GalleryStore, mergeGallery } = require('./lib/gallery-store');
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
    const existingIds = new Set(existingItems.map(item => Number(item.id)));
    const artworkIds = await pixiv.getArtworkIds();
    const missingIds = artworkIds.filter(id => !existingIds.has(id));

    if (missingIds.length === 0) {
        console.log('画廊已经是最新状态，没有发现新作品。');
        return;
    }

    console.log(`发现 ${missingIds.length} 个新作品，开始并发同步。`);
    const results = await mapWithConcurrency(
        missingIds,
        config.requestConcurrency,
        async artworkId => {
            const artwork = await pixiv.getArtwork(artworkId);
            const imageBuffer = await pixiv.downloadImage(artwork.original_url, artworkId);
            const publicImagePath = await imageStore.save(artworkId, imageBuffer);

            return {
                ...artwork,
                local_path: publicImagePath.replace(/^\//, ''),
                remote_url: publicImagePath,
                url: publicImagePath,
                original_url_display: publicImagePath
            };
        }
    );

    const completedItems = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    const failures = results.filter(result => result.status === 'rejected');

    if (completedItems.length === 0) {
        throw new AggregateError(failures.map(result => result.reason), '所有新作品均同步失败');
    }

    await galleryStore.write(mergeGallery(existingItems, completedItems));
    console.log(`已同步 ${completedItems.length} 个作品，画廊现有 ${existingItems.length + completedItems.length} 条记录。`);

    for (const failure of failures) {
        console.warn(`部分作品同步失败，将在下次任务重试：${failure.reason.message}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
