const resourcePromises = new Map();

export function loadJsonResource(path) {
    if (resourcePromises.has(path)) return resourcePromises.get(path);

    const request = fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            return response.json();
        })
        .catch(error => {
            resourcePromises.delete(path);
            throw error;
        });

    resourcePromises.set(path, request);
    return request;
}

export function loadGalleryData() {
    return loadJsonResource('/gallery.json');
}

export function loadVideoData() {
    return loadJsonResource('/videos.json');
}
