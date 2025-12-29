import { i18n } from '../utils/i18n.js';

export default class FooterSection {
    constructor() {
        window.addEventListener('languageChanged', () => {
            this.renderContent();
        });
    }

    renderContent() {
        if (!this.element) return;
        const currentLang = i18n.currentLanguage;

        this.element.innerHTML = `
            <div class="flex flex-col items-center gap-4">
                <p>&copy; ${new Date().getFullYear()} Catzz. ${i18n.t('footer.rights')}</p>
                
                <!-- Subtle Language Switcher -->
                <div class="flex gap-4 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <button class="hover:text-black transition-colors ${currentLang === 'zh' ? 'text-black font-bold' : ''}" onclick="window.i18n.setLanguage('zh')">CN</button>
                    <button class="hover:text-black transition-colors ${currentLang === 'en' ? 'text-black font-bold' : ''}" onclick="window.i18n.setLanguage('en')">EN</button>
                    <button class="hover:text-black transition-colors ${currentLang === 'ja' ? 'text-black font-bold' : ''}" onclick="window.i18n.setLanguage('ja')">JP</button>
                </div>
            </div>
        `;

        // Bind events manually since onclick string attribute might rely on global scope which module scope doesn't guarantee if not attached to window
        // Actually i18n is imported but not exposed to window in this file. 
        // We should attach listeners effectively.
        const btns = this.element.querySelectorAll('button');
        btns[0].onclick = () => i18n.setLanguage('zh');
        btns[1].onclick = () => i18n.setLanguage('en');
        btns[2].onclick = () => i18n.setLanguage('ja');
    }

    render() {
        this.element = document.createElement('footer');
        this.element.className = 'w-full py-12 bg-white flex justify-center items-center text-xs text-gray-400 font-light tracking-wider border-t border-gray-50';
        this.renderContent();
        return this.element;
    }
}
