export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

export function safeExternalUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.toString() : '#';
    } catch {
        return '#';
    }
}
