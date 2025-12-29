import { i18n } from '../utils/i18n.js';

export default class FooterSection {
    constructor() {
        window.addEventListener('languageChanged', () => {
            this.updateText();
        });
    }

    updateText() {
        if (!this.element) return;
        this.element.innerHTML = `
            <p>&copy; ${new Date().getFullYear()} Catzz. ${i18n.t('footer.rights')}</p>
        `;
    }

    render() {
        this.element = document.createElement('footer');
        this.element.className = 'w-full py-10 bg-bg flex justify-center items-center text-xs text-gray-400 font-light tracking-wider';
        this.updateText();
        return this.element;
    }
}
