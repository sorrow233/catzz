export function getArtworkLayout(width, height) {
    const normalizedWidth = Number(width);
    const normalizedHeight = Number(height);
    if (!(normalizedWidth > 0) || !(normalizedHeight > 0)) return 'standard';
    return normalizedWidth / normalizedHeight >= 1.45 ? 'wide' : 'standard';
}
