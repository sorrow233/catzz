export function createVideoViewModel(item) {
    const publishedAt = new Date(item.published_at);
    const validDate = !Number.isNaN(publishedAt.getTime());

    return {
        id: item.id,
        title: item.title || '',
        date: validDate
            ? `${publishedAt.getUTCFullYear()}.${String(publishedAt.getUTCMonth() + 1).padStart(2, '0')}.${String(publishedAt.getUTCDate()).padStart(2, '0')}`
            : '',
        thumbnail: item.thumbnail || '',
        videoUrl: item.url || '',
        duration: item.duration || '',
        description: String(item.description || '').replace(/\s+/g, ' ').trim()
    };
}
