import './styles/main.css';
import HeroSection from './components/HeroSection.js';
import ImpressionsSection from './components/ImpressionsSection.js';
import VideoSection from './components/VideoSection.js';
import GallerySection from './components/GallerySection.js';
import FooterSection from './components/FooterSection.js';
import { i18n } from './utils/i18n.js';
import { loadDisplayFontWhenIdle } from './utils/displayFont.mjs';

class App {
    constructor() {
        this.mainContent = document.getElementById('app'); // Changed from 'main-content' to 'app' to match original HTML context
        this.sections = [];
        this.init();
    }

    init() {
        // Initialize i18n global state and update DOM
        i18n.updateDOM();

        // Instantiate components
        this.sections = [
            new HeroSection(),
            new ImpressionsSection(),
            new VideoSection(),
            new GallerySection(),
            new FooterSection()
        ];

        this.render();
    }

    render() {
        // Render components
        this.sections.forEach(section => {
            if (section.render) {
                this.mainContent.appendChild(section.render());
            }
        });
    }

    mount() {
        // Mount/Hydrate components (animations, events)
        this.sections.forEach(section => {
            if (section.mount) {
                section.mount();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.mount();
    loadDisplayFontWhenIdle();
});
