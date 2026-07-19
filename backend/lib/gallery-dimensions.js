const path = require('node:path');
const sharp = require('sharp');
const { fetchWithRetry, mapWithConcurrency } = require('./http-client');

async function getImageInput(item, publicDir, retryOptions) {
    const source = String(item.url || '');
    if (/^https:\/\//i.test(source)) {
        const response = await fetchWithRetry(source, {}, retryOptions);
        return Buffer.from(await response.arrayBuffer());
    }
    const relativePath = (source || item.local_path || '').replace(/^\/+/, '');
    return path.join(publicDir, relativePath);
}

async function addMissingImageDimensions(items, publicDir, concurrency = 3, retryOptions = {}) {
    const results = await mapWithConcurrency(items, concurrency, async item => {
        const width = Number(item.width);
        const height = Number(item.height);
        if (width > 0 && height > 0) return item;

        const imageInput = await getImageInput(item, publicDir, retryOptions);
        const metadata = await sharp(imageInput).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error(`无法读取图片尺寸：${item.url || item.local_path}`);
        }
        return { ...item, width: metadata.width, height: metadata.height };
    });
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    return results.map(result => result.value);
}

module.exports = { addMissingImageDimensions };
