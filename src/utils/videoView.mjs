export function createVideoViewModel(item) {
    const publishedAt = new Date(item.published_at);
    const validDate = !Number.isNaN(publishedAt.getTime());
    const year = validDate ? publishedAt.getUTCFullYear() : 0;
    const month = validDate ? String(publishedAt.getUTCMonth() + 1).padStart(2, '0') : '';

    return {
        id: item.id,
        title: item.title || '',
        date: validDate
            ? `${year}.${month}.${String(publishedAt.getUTCDate()).padStart(2, '0')}`
            : '',
        month: validDate ? `${String(year).slice(-2)}.${month}` : '',
        thumbnail: item.thumbnail || '',
        videoUrl: item.url || '',
        duration: item.duration || '',
        description: String(item.description || '').replace(/\s+/g, ' ').trim()
    };
}
