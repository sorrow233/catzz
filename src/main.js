import HeroSection from './components/HeroSection.js';
import GallerySection from './components/GallerySection.js';
import TimelineSection from './components/TimelineSection.js';
import FooterSection from './components/FooterSection.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('main-content');
        this.init();
    }

    init() {
        // Render all sections in order
        this.renderSection(new HeroSection());
        this.renderSection(new GallerySection());
        this.renderSection(new TimelineSection());
        this.renderSection(new FooterSection());
    }

    renderSection(component) {
        const sectionElement = component.render(); // All components must implement render() returning an HTMLElement
        this.appContainer.appendChild(sectionElement);
        
        // Call mount if available (for effects/listeners)
        if (component.mount) {
            component.mount();
        }
    }
}

// Initialize the App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
