import HeroSection from './components/HeroSection.js';
import CarouselSection from './components/CarouselSection.js';
import TimelineSection from './components/TimelineSection.js';
import GallerySection from './components/GallerySection.js';
import FooterSection from './components/FooterSection.js';

document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');

    // Initialize components
    const hero = new HeroSection();
    const carousel = new CarouselSection();
    const timeline = new TimelineSection();
    const gallery = new GallerySection();
    const footer = new FooterSection();

    // Render components
    // Render components
    app.appendChild(hero.render());
    app.appendChild(carousel.render());
    app.appendChild(gallery.render());
    app.appendChild(timeline.render());
    app.appendChild(footer.render());

    // Mount/Hydrate components (animations, events)
    if (hero.mount) hero.mount();
    if (carousel.mount) carousel.mount();
    if (timeline.mount) timeline.mount();
    if (gallery.mount) gallery.mount();
    if (footer.mount) footer.mount();
});
