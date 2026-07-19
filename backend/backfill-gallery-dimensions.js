const config = require('./config');
const { addMissingImageDimensions } = require('./lib/gallery-dimensions');
const { GalleryStore } = require('./lib/gallery-store');

async function main() {
    const store = new GalleryStore(config.galleryPath);
    const items = await store.read();
    const completed = await addMissingImageDimensions(items, config.publicDir, config.requestConcurrency, {
        retries: config.requestRetries,
        timeoutMs: config.requestTimeoutMs
    });
    await store.write(completed);
    console.log(`尺寸补全完成：${completed.length} 张插画均包含真实宽高。`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
