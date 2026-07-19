const VIDEO_PATTERNS = [
    /https?:\/\/(?:www\.)?bilibili\.com\/video\/[a-zA-Z0-9]+\/?/,
    /https?:\/\/live\.bilibili\.com\/\d+/,
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
    /https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+/,
    /https?:\/\/(?:www\.)?nicovideo\.jp\/watch\/[a-zA-Z0-9_-]+/
];

export function extractVideoUrl(description) {
    const decodedDescription = String(description || '').replaceAll('&amp;', '&');

    for (const pattern of VIDEO_PATTERNS) {
        const match = decodedDescription.match(pattern);
        if (match) return match[0];
    }

    return '';
}

export function selectRecentActivities(items, limit = 12) {
    return [...items]
        .filter(item => item?.created_at && item?.url && item?.pixiv_url)
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
        .slice(0, limit);
}
