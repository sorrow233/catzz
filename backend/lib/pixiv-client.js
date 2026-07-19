const { fetchWithRetry } = require('./http-client');

class PixivClient {
    constructor({ userId, retries, timeoutMs }) {
        this.userId = String(userId);
        this.retryOptions = { retries, timeoutMs };
        this.headers = {
            'Accept-Language': 'zh-CN,zh;q=0.9,ja;q=0.8',
            Referer: `https://www.pixiv.net/users/${this.userId}/artworks`,
            'User-Agent': 'catzz-gallery-updater/1.1 (+https://catzz.work)'
        };
    }

    async getArtworkIds() {
        const response = await fetchWithRetry(
            `https://www.pixiv.net/ajax/user/${this.userId}/profile/all?lang=zh`,
            { headers: this.headers },
            this.retryOptions
        );
        const payload = await response.json();
        if (payload.error || !payload.body) {
            throw new Error(`Pixiv 作品列表返回异常：${payload.message || '缺少 body'}`);
        }

        return [...new Set([
            ...Object.keys(payload.body.illusts || {}),
            ...Object.keys(payload.body.manga || {})
        ])]
            .map(Number)
            .filter(Number.isSafeInteger)
            .sort((a, b) => b - a);
    }

    async getArtwork(artworkId) {
        const response = await fetchWithRetry(
            `https://www.pixiv.net/ajax/illust/${artworkId}?lang=zh`,
            { headers: { ...this.headers, Referer: `https://www.pixiv.net/artworks/${artworkId}` } },
            this.retryOptions
        );
        const payload = await response.json();
        const artwork = payload.body;

        if (payload.error || !artwork || String(artwork.userId) !== this.userId) {
            throw new Error(`作品 ${artworkId} 返回异常或不属于目标作者`);
        }

        const imageUrl = artwork.urls?.original || artwork.urls?.regular;
        if (!imageUrl) throw new Error(`作品 ${artworkId} 缺少可用图片地址`);

        return {
            id: Number(artwork.id),
            title: artwork.title || 'Untitled',
            description: artwork.description || '',
            tags: (artwork.tags?.tags || []).map(item => item.tag).filter(Boolean),
            created_at: artwork.createDate,
            original_url: imageUrl,
            pixiv_url: `https://www.pixiv.net/artworks/${artwork.id}`,
            page_count: Number(artwork.pageCount) || 1
        };
    }

    async downloadImage(imageUrl, artworkId) {
        const response = await fetchWithRetry(
            imageUrl,
            { headers: { ...this.headers, Referer: `https://www.pixiv.net/artworks/${artworkId}` } },
            this.retryOptions
        );
        return Buffer.from(await response.arrayBuffer());
    }

    async getArtworkPages(artworkId) {
        const response = await fetchWithRetry(
            `https://www.pixiv.net/ajax/illust/${artworkId}/pages?lang=zh`,
            { headers: { ...this.headers, Referer: `https://www.pixiv.net/artworks/${artworkId}` } },
            this.retryOptions
        );
        const payload = await response.json();
        if (payload.error || !Array.isArray(payload.body)) {
            throw new Error(`作品 ${artworkId} 的分页信息返回异常`);
        }

        return payload.body.map((page, pageIndex) => ({
            page_index: pageIndex,
            original_url: page.urls?.original || page.urls?.regular
        })).filter(page => page.original_url);
    }
}

module.exports = { PixivClient };
