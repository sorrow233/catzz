const SITE_URL = 'https://catzz.work/';
const ARTIST_ID = `${SITE_URL}#artist`;

function toAbsoluteUrl(value) {
    if (!value) return SITE_URL;
    try {
        return new URL(String(value), SITE_URL).toString();
    } catch {
        return SITE_URL;
    }
}

function toIsoDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getImageMimeType(url) {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.png')) return 'image/png';
    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
    if (pathname.endsWith('.avif')) return 'image/avif';
    return 'image/webp';
}

function getNewestDate(galleryData, videoData) {
    const dates = [
        ...galleryData.map(item => toIsoDate(item.created_at)),
        ...videoData.map(item => toIsoDate(item.published_at))
    ].filter(Boolean).sort().reverse();
    return dates[0] || new Date(0).toISOString();
}

function selectRepresentativeArtworks(galleryData, maximum = 6) {
    const seen = new Set();
    return galleryData.filter(item => {
        const identity = String(item.id ?? item.url ?? '');
        if (!identity || seen.has(identity)) return false;
        seen.add(identity);
        return Boolean(item.url || item.remote_url);
    }).slice(0, maximum);
}

function createArtworkList(galleryData) {
    return selectRepresentativeArtworks(galleryData).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
            '@type': 'VisualArtwork',
            name: String(item.title || `Catzz 插画 ${index + 1}`),
            url: toAbsoluteUrl(item.pixiv_url || item.url),
            image: toAbsoluteUrl(item.remote_url || item.url),
            dateCreated: toIsoDate(item.created_at),
            creator: { '@id': ARTIST_ID }
        }
    }));
}

function createVideoList(videoData) {
    return videoData.slice(0, 6).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
            '@type': 'CreativeWork',
            name: String(item.title || `Catzz 投稿 ${index + 1}`),
            url: toAbsoluteUrl(item.url),
            thumbnailUrl: toAbsoluteUrl(item.thumbnail),
            datePublished: toIsoDate(item.published_at),
            creator: { '@id': ARTIST_ID }
        }
    }));
}

export function buildSeoMetadata({ galleryData = [], videoData = [] } = {}) {
    const artworkCount = galleryData.length;
    const videoCount = videoData.length;
    const latestArtwork = galleryData.find(item => item.url || item.remote_url) || {};
    const socialImage = toAbsoluteUrl(latestArtwork.remote_url || latestArtwork.url);
    const socialImageType = getImageMimeType(socialImage);
    const socialImageWidth = Number(latestArtwork.width) || 1920;
    const socialImageHeight = Number(latestArtwork.height) || 1080;
    const socialImageAlt = String(latestArtwork.title || 'Catzz 插画作品');
    const dateModified = getNewestDate(galleryData, videoData);
    const title = 'Catzz 插画作品集｜雨夜少女、城市光影与哔哩哔哩创作';
    const description = `收录 Catzz ${artworkCount} 张插画与 ${videoCount} 个哔哩哔哩投稿，按年份浏览雨景、少女、城市夜色与百日绘主题作品，并查看近期创作动态。`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}#website`,
                url: SITE_URL,
                name: 'Catzz 插画作品集',
                alternateName: ['Catzz Works', 'Catzz イラスト作品集', 'Catzz 일러스트 작품집'],
                description,
                inLanguage: ['zh-CN', 'en', 'ja', 'ko'],
                dateModified,
                publisher: { '@id': ARTIST_ID }
            },
            {
                '@type': 'Person',
                '@id': ARTIST_ID,
                name: 'Catzz',
                url: SITE_URL,
                image: socialImage,
                sameAs: [
                    'https://www.pixiv.net/users/1056186',
                    'https://space.bilibili.com/308124',
                    'https://x.com/2gonode'
                ]
            },
            {
                '@type': 'ImageGallery',
                '@id': `${SITE_URL}#works`,
                url: `${SITE_URL}#works`,
                name: 'Catzz 插画作品集',
                description,
                isPartOf: { '@id': `${SITE_URL}#website` },
                about: { '@id': ARTIST_ID },
                dateModified,
                primaryImageOfPage: {
                    '@type': 'ImageObject',
                    url: socialImage,
                    width: socialImageWidth,
                    height: socialImageHeight,
                    caption: socialImageAlt
                },
                mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: artworkCount,
                    itemListOrder: 'https://schema.org/ItemListOrderDescending',
                    itemListElement: createArtworkList(galleryData)
                }
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_URL}#moving-image`,
                name: 'Catzz 哔哩哔哩投稿',
                numberOfItems: videoCount,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                itemListElement: createVideoList(videoData)
            }
        ]
    };

    return {
        artworkCount,
        videoCount,
        title,
        description,
        socialImage,
        socialImageType,
        socialImageAlt,
        socialImageWidth,
        socialImageHeight,
        dateModified,
        structuredData
    };
}

export function serializeStructuredData(value) {
    return JSON.stringify(value).replaceAll('<', '\\u003c');
}
