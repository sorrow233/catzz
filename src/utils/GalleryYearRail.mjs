export function sortGalleryYears(years) {
    return [...new Set(years.map(Number).filter(Number.isInteger))]
        .sort((left, right) => right - left);
}

export default class GalleryYearRail {
    constructor({ container, galleryElement, onSelect }) {
        this.container = container;
        this.galleryElement = galleryElement;
        this.onSelect = onSelect;
        this.sections = new Map();
        this.activeYear = null;
        this.scrollFrame = null;
        this.visibilityObserver = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    connect() {
        this.container.addEventListener('click', this.handleClick);
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleScroll, { passive: true });

        this.visibilityObserver = new IntersectionObserver(([entry]) => {
            this.container.classList.toggle('year-rail-visible', entry.isIntersecting);
        }, { rootMargin: '-8% 0px -8% 0px' });
        this.visibilityObserver.observe(this.galleryElement);
    }

    setYears(years) {
        const sortedYears = sortGalleryYears(years);
        this.container.innerHTML = sortedYears.map(year => `
            <button type="button" class="year-rail-button" data-year="${year}" aria-label="${year}" aria-current="false">
                <span class="year-rail-line" aria-hidden="true"></span>
                <span class="year-rail-label">${year}</span>
            </button>
        `).join('');

        this.activeYear = null;
        if (sortedYears.length > 0) this.setActive(sortedYears[0]);
    }

    registerSection(year, element) {
        this.sections.set(Number(year), element);
        this.scheduleActiveUpdate();
    }

    handleClick(event) {
        const button = event.target.closest('[data-year]');
        if (!button || !this.container.contains(button)) return;
        const year = Number(button.dataset.year);
        if (!Number.isInteger(year)) return;
        this.setActive(year);
        this.onSelect(year);
    }

    handleScroll() {
        this.scheduleActiveUpdate();
    }

    scheduleActiveUpdate() {
        if (this.scrollFrame !== null) return;
        this.scrollFrame = requestAnimationFrame(() => {
            this.scrollFrame = null;
            this.updateActiveFromViewport();
        });
    }

    updateActiveFromViewport() {
        if (this.sections.size === 0) return;
        const anchor = window.innerHeight * 0.34;
        const sections = [...this.sections.entries()]
            .map(([year, element]) => ({ year, top: element.getBoundingClientRect().top }))
            .sort((left, right) => left.top - right.top);
        const active = sections.reduce((current, section) => {
            return section.top <= anchor ? section : current;
        }, sections[0]);
        this.setActive(active.year);
    }

    setActive(year) {
        if (this.activeYear === year) return;
        this.activeYear = year;
        for (const button of this.container.querySelectorAll('[data-year]')) {
            button.setAttribute('aria-current', String(Number(button.dataset.year) === year));
        }
    }
}
