const crypto = require('node:crypto');
const { fetchWithRetry, mapWithConcurrency } = require('./http-client');

const MIXIN_KEY_INDEXES = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
    37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
    22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
];
const RETRYABLE_API_CODES = new Set([-799, -412, -352]);
const sleep = durationMs => new Promise(resolve => setTimeout(resolve, durationMs));

function buildMixinKey(imageKey, subKey) {
    const source = `${imageKey}${subKey}`;
    return MIXIN_KEY_INDEXES.map(index => source[index]).join('').slice(0, 32);
}

function signWbiParameters(parameters, mixinKey, timestamp = Math.floor(Date.now() / 1000)) {
    const signedParameters = { ...parameters, wts: String(timestamp) };
    const query = Object.keys(signedParameters)
        .sort()
        .map(key => {
            const cleanValue = String(signedParameters[key]).replace(/[!'()*]/g, '');
            return `${encodeURIComponent(key)}=${encodeURIComponent(cleanValue)}`;
        })
        .join('&');
    const signature = crypto.createHash('md5').update(`${query}${mixinKey}`).digest('hex');
    return `${query}&w_rid=${signature}`;
}

function normalizeVideo(video, userId) {
    return {
        id: video.bvid,
        title: video.title,
        description: video.description || '',
        url: `https://www.bilibili.com/video/${video.bvid}`,
        remote_thumbnail: String(video.pic || '').replace(/^http:/, 'https:'),
        published_at: new Date(Number(video.created) * 1000).toISOString(),
        duration: video.length || '',
        play_count: Number(video.play) || 0,
        comment_count: Number(video.comment) || 0,
        author_mid: String(userId),
        source: 'bilibili'
    };
}

class BilibiliClient {
    constructor({ userId, cookie, retries = 4, timeoutMs = 20_000, concurrency = 2 }) {
        this.userId = String(userId);
        this.cookie = cookie;
        this.retries = retries;
        this.timeoutMs = timeoutMs;
        this.concurrency = concurrency;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/150.0.0.0 Safari/537.36',
            Referer: `https://space.bilibili.com/${this.userId}/video`,
            Cookie: cookie
        };
    }

    async requestJson(url) {
        let lastError;
        for (let attempt = 0; attempt <= this.retries; attempt += 1) {
            try {
                const response = await fetchWithRetry(url, { headers: this.headers }, {
                    retries: 1,
                    timeoutMs: this.timeoutMs
                });
                const payload = await response.json();
                if (payload.code === 0) return payload.data;
                lastError = new Error(`哔哩哔哩 API ${payload.code}: ${payload.message}`);
                if (!RETRYABLE_API_CODES.has(payload.code)) {
                    lastError.retryable = false;
                    throw lastError;
                }
            } catch (error) {
                lastError = error;
                if (error.retryable === false) break;
            }

            if (attempt < this.retries) {
                await sleep(700 * (2 ** attempt) + Math.floor(Math.random() * 300));
            }
        }
        throw new Error(`哔哩哔哩请求在 ${this.retries + 1} 次尝试后失败`, { cause: lastError });
    }

    async getMixinKey() {
        const data = await this.requestJson('https://api.bilibili.com/x/web-interface/nav');
        const imageKey = new URL(data.wbi_img.img_url).pathname.split('/').pop().split('.')[0];
        const subKey = new URL(data.wbi_img.sub_url).pathname.split('/').pop().split('.')[0];
        return buildMixinKey(imageKey, subKey);
    }

    async getVideoPage(pageNumber, mixinKey, pageSize = 50) {
        const query = signWbiParameters({
            mid: this.userId,
            order: 'pubdate',
            platform: 'web',
            pn: pageNumber,
            ps: pageSize,
            web_location: '1550101'
        }, mixinKey);
        return this.requestJson(`https://api.bilibili.com/x/space/wbi/arc/search?${query}`);
    }

    async getVideos() {
        const mixinKey = await this.getMixinKey();
        const firstPage = await this.getVideoPage(1, mixinKey);
        const total = Number(firstPage.page?.count) || 0;
        const pageSize = Number(firstPage.page?.ps) || 50;
        const pageCount = Math.ceil(total / pageSize);
        const remainingPages = Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => index + 2);
        const results = await mapWithConcurrency(
            remainingPages,
            this.concurrency,
            page => this.getVideoPage(page, mixinKey, pageSize)
        );
        const failure = results.find(result => result.status === 'rejected');
        if (failure) throw failure.reason;

        return [firstPage, ...results.map(result => result.value)]
            .flatMap(page => page.list?.vlist || [])
            .map(video => normalizeVideo(video, this.userId))
            .sort((left, right) => new Date(right.published_at) - new Date(left.published_at));
    }

    async getThumbnail(url) {
        const response = await fetchWithRetry(url, { headers: this.headers }, {
            retries: this.retries,
            timeoutMs: this.timeoutMs
        });
        return Buffer.from(await response.arrayBuffer());
    }
}

module.exports = { BilibiliClient, buildMixinKey, normalizeVideo, signWbiParameters };
