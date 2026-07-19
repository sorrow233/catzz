const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('./config');
const { BilibiliClient } = require('./lib/bilibili-client');
const { mapWithConcurrency } = require('./lib/http-client');
const { ImageStore } = require('./lib/image-store');
const { VideoStore } = require('./lib/video-store');

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function removeStaleThumbnails(videos) {
    const activeNames = new Set(videos.map(video => path.basename(video.thumbnail)));
    const files = await fs.readdir(config.videoThumbnailDir, { withFileTypes: true });
    await Promise.all(files
        .filter(file => file.isFile() && file.name.endsWith('.webp') && !activeNames.has(file.name))
        .map(file => fs.unlink(path.join(config.videoThumbnailDir, file.name))));
}

async function main() {
    const cookie = process.env.BILIBILI_COOKIE?.trim();
    if (!cookie) {
        console.warn('未提供 BILIBILI_COOKIE，跳过哔哩哔哩视频同步。');
        return;
    }

    const client = new BilibiliClient({
        userId: config.bilibiliUserId,
        cookie,
        retries: config.requestRetries,
        timeoutMs: config.requestTimeoutMs,
        concurrency: config.videoRequestConcurrency
    });
    const store = new VideoStore(config.videosPath);
    const imageStore = new ImageStore({
        artworkDir: config.videoThumbnailDir,
        publicArtworkPath: config.publicVideoThumbnailPath,
        maxWidth: config.videoThumbnailMaxWidth,
        quality: config.videoThumbnailQuality
    });
    const existingVideos = await store.read();
    const existingById = new Map(existingVideos.map(video => [video.id, video]));
    const videos = await client.getVideos();

    const results = await mapWithConcurrency(videos, config.videoRequestConcurrency, async video => {
        const existingThumbnail = existingById.get(video.id)?.thumbnail;
        const existingPath = existingThumbnail?.startsWith(config.publicVideoThumbnailPath)
            ? path.join(config.rootDir, 'public', existingThumbnail.replace(/^\/+/, ''))
            : null;
        if (existingPath && await fileExists(existingPath)) {
            return { ...video, thumbnail: existingThumbnail };
        }
        const image = await client.getThumbnail(video.remote_thumbnail);
        const thumbnail = await imageStore.save(video.id, 0, image);
        return { ...video, thumbnail };
    });
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;

    const publicVideos = results.map(result => {
        const { remote_thumbnail: remoteThumbnail, ...video } = result.value;
        return video;
    });
    await store.write(publicVideos);
    await removeStaleThumbnails(publicVideos);
    console.log(`同步完成：哔哩哔哩空间 ${config.bilibiliUserId} 共 ${publicVideos.length} 条视频投稿。`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
