import { translations } from '../data/translations.js';

class I18n {
    constructor() {
        this.languages = ['zh', 'en', 'ja', 'ko'];
        this.defaultLanguage = 'zh';
        this.currentLanguage = this.detectLanguage();
        this.translations = translations;
    }

    detectLanguage() {
        // 1. Honor the language URL used by hreflang and the sitemap.
        const requested = new URLSearchParams(window.location.search).get('lang');
        if (requested && this.languages.includes(requested)) return requested;

        // 2. Check localStorage
        const saved = localStorage.getItem('preferred_language');
        if (saved && this.languages.includes(saved)) return saved;

        // 3. Keep the canonical root deterministic for crawlers and first visits.
        return this.defaultLanguage;
    }

    setLanguage(lang) {
        if (this.languages.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('preferred_language', lang);
            this.updateLanguageUrl(lang);
            this.updateDOM();
            // Emit custom event for components to listen
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
        }
    }

    t(path) {
        const keys = path.split('.');
        let result = this.translations[this.currentLanguage];

        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                // Fallback to default language
                return this.getFallback(path);
            }
        }
        return result;
    }

    getFallback(path) {
        const keys = path.split('.');
        let result = this.translations[this.defaultLanguage];
        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                return path; // Return key if not found
            }
        }
        return result;
    }

    interpolateMeta(value) {
        const root = document.documentElement;
        return String(value)
            .replaceAll('{galleryCount}', root.dataset.galleryCount || '0')
            .replaceAll('{videoCount}', root.dataset.videoCount || '0');
    }

    getLanguageUrl(lang) {
        const url = new URL('https://catzz.work/');
        if (lang !== this.defaultLanguage) url.searchParams.set('lang', lang);
        return url.toString();
    }

    updateLanguageUrl(lang) {
        const url = new URL(window.location.href);
        if (lang === this.defaultLanguage) url.searchParams.delete('lang');
        else url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    updateDOM() {
        this.updateLanguageUrl(this.currentLanguage);
        const languageTagMap = { zh: 'zh-CN', en: 'en', ja: 'ja', ko: 'ko' };
        document.documentElement.lang = languageTagMap[this.currentLanguage] || 'zh-CN';

        // Helper to set meta content safely
        const setMeta = (selector, content) => {
            const el = document.querySelector(selector);
            if (el) {
                el.setAttribute('content', content);
            }
        };

        const title = this.interpolateMeta(this.t('meta.title'));
        const desc = this.interpolateMeta(this.t('meta.description'));
        const languageUrl = this.getLanguageUrl(this.currentLanguage);

        // Update Title
        document.title = title;

        // Update Meta Tags
        setMeta('meta[name="description"]', desc);
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', desc);
        setMeta('meta[name="twitter:title"]', title);
        setMeta('meta[name="twitter:description"]', desc);
        setMeta('meta[property="og:url"]', languageUrl);
        setMeta('meta[name="twitter:url"]', languageUrl);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', languageUrl);

        // Update Locale
        const localeMap = {
            'zh': 'zh_CN',
            'en': 'en_US',
            'ja': 'ja_JP',
            'ko': 'ko_KR'
        };
        setMeta('meta[property="og:locale"]', localeMap[this.currentLanguage] || 'en_US');
    }
}

export const i18n = new I18n();
window.i18n = i18n; // Make global for easy access or debugging
