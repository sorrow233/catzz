import { translations } from '../data/translations.js';

class I18n {
    constructor() {
        this.languages = ['zh', 'en', 'ja'];
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

        // Update Meta
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', this.t('meta.description'));
        }
    }
}

export const i18n = new I18n();
window.i18n = i18n; // Make global for easy access or debugging
