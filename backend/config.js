const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = Object.freeze({
    pixivUserId: '1056186',
    galleryPath: path.join(ROOT_DIR, 'public/gallery.json'),
    artworkDir: path.join(ROOT_DIR, 'public/artworks'),
    publicArtworkPath: '/artworks',
    requestConcurrency: 3,
    requestRetries: 4,
    requestTimeoutMs: 20_000,
    imageMaxWidth: 2_000,
    imageQuality: 86
});
