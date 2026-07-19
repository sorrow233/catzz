export function createActivityViewModel(item) {
    const date = new Date(item.created_at);

    return {
        id: item.id,
        title: item.title,
        date: `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`,
        thumbnail: item.url,
        artworkUrl: item.pixiv_url
    };
}
