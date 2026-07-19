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
