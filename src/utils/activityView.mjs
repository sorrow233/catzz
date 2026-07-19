import { extractVideoUrl, getVideoPlatform } from './activity.mjs';

export function createActivityViewModel(item) {
    const videoUrl = extractVideoUrl(item.description);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.description || '';
    const cleanDescription = (tempDiv.textContent || tempDiv.innerText || '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const usefulDescription = /^~*$/.test(cleanDescription)
        ? (item.tags || []).slice(0, 4).join(' · ')
        : cleanDescription;
    const date = new Date(item.created_at);

    return {
        id: item.id,
        title: item.title,
        date: `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`,
        thumbnail: item.url,
        artworkUrl: item.pixiv_url,
        videoUrl,
        platform: getVideoPlatform(videoUrl),
        description: usefulDescription.slice(0, 120) + (usefulDescription.length > 120 ? '...' : '')
    };
}
