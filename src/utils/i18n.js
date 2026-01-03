import { translations } from '../data/translations.js';

class I18n {
    constructor() {
        this.languages = ['zh', 'en', 'ja', 'ko'];
        this.defaultLanguage = 'zh';
        this.currentLanguage = this.detectLanguage();
        this.translations = translations;
    }

    detectLanguage() {
        // 1. Check localStorage
        const saved = localStorage.getItem('preferred_language');
        if (saved && this.languages.includes(saved)) return saved;

        // 2. Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.languages.includes(browserLang)) return browserLang;

        // 3. Fallback
        return this.defaultLanguage;
    }

    setLanguage(lang) {
        if (this.languages.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('preferred_language', lang);
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

    updateDOM() {
        document.documentElement.lang = this.currentLanguage;

        // Helper to set meta content safely
        const setMeta = (selector, content) => {
            const el = document.querySelector(selector);
            if (el) {
                el.setAttribute('content', content);
            }
        };

        const title = this.t('meta.title');
        const desc = this.t('meta.description');

        // Update Title
        document.title = title;

        // Update Meta Tags
        setMeta('meta[name="description"]', desc);
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', desc);
        setMeta('meta[name="twitter:title"]', title);
        setMeta('meta[name="twitter:description"]', desc);

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
