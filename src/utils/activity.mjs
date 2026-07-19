const BILIBILI_VIDEO_PATTERN = /https?:\/\/(?:www\.)?bilibili\.com\/video\/[a-zA-Z0-9]+\/?/;

export function extractVideoUrl(description) {
    const decodedDescription = String(description || '').replaceAll('&amp;', '&');
    return decodedDescription.match(BILIBILI_VIDEO_PATTERN)?.[0] || '';
}

export function selectRecentActivities(items, limit = 12) {
    const seenArtworkIds = new Set();
    return [...items]
        .filter(item => item?.created_at && item?.url && item?.pixiv_url)
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
        .filter(item => {
            if (seenArtworkIds.has(item.id)) return false;
            seenArtworkIds.add(item.id);
            return true;
        })
        .slice(0, limit);
}

export function selectVideoActivities(items) {
    return selectRecentActivities(items, Number.POSITIVE_INFINITY)
        .filter(item => extractVideoUrl(item.description));
}

export function getVideoPlatform(url) {
    if (/bilibili\.com/i.test(url)) return 'BILIBILI';
    return '';
}
