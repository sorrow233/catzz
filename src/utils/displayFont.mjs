import italianaLatinUrl from '@fontsource/italiana/files/italiana-latin-400-normal.woff2?url';

let loadStarted = false;

export function loadDisplayFontWhenIdle() {
    if (loadStarted || !('FontFace' in window) || !document.fonts) return;
    loadStarted = true;

    const loadFont = async () => {
        try {
            const font = new FontFace(
                'Catzz Italiana',
                `url(${italianaLatinUrl}) format("woff2")`,
                { style: 'normal', weight: '400', unicodeRange: 'U+0000-00FF' }
            );
            await font.load();
            document.fonts.add(font);
            document.documentElement.classList.add('display-font-ready');
        } catch (error) {
            console.warn('Display font could not be loaded.', error);
        }
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadFont, { timeout: 2_500 });
    } else {
        window.setTimeout(loadFont, 1_200);
    }
}
