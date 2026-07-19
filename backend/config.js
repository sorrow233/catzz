const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = Object.freeze({
    rootDir: ROOT_DIR,
    publicDir: path.join(ROOT_DIR, 'public'),
    pixivUserId: '1056186',
    bilibiliUserId: '308124',
    galleryPath: path.join(ROOT_DIR, 'public/gallery.json'),
    videosPath: path.join(ROOT_DIR, 'public/videos.json'),
    artworkDir: path.join(ROOT_DIR, 'public/artworks'),
    videoThumbnailDir: path.join(ROOT_DIR, 'public/videos'),
    publicArtworkPath: '/artworks',
    publicVideoThumbnailPath: '/videos',
    requestConcurrency: 3,
    videoRequestConcurrency: 3,
    requestRetries: 4,
    requestTimeoutMs: 20_000,
    imageMaxWidth: 2_000,
    imageQuality: 86,
    videoThumbnailMaxWidth: 1_280,
    videoThumbnailQuality: 84
});
