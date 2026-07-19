export function getActiveGalleryYear(sections, activationLine) {
    if (!Array.isArray(sections) || !Number.isFinite(activationLine)) return null;

    return sections
        .map(section => ({ year: Number(section?.year), top: Number(section?.top) }))
        .filter(section => Number.isInteger(section.year) && Number.isFinite(section.top))
        .sort((left, right) => left.top - right.top)
        .reduce((activeYear, section) => {
            return section.top <= activationLine ? section.year : activeYear;
        }, null);
}

export default class GalleryScrollContext {
    constructor({ yearsContainer, stickyHeader, onChange }) {
        this.yearsContainer = yearsContainer;
        this.stickyHeader = stickyHeader;
        this.onChange = onChange;
        this.activeYear = undefined;
        this.frameId = null;

        this.scheduleUpdate = this.scheduleUpdate.bind(this);
    }

    connect() {
        window.addEventListener('scroll', this.scheduleUpdate, { passive: true });
        window.addEventListener('resize', this.scheduleUpdate, { passive: true });
        this.refresh();
    }

    refresh() {
        this.scheduleUpdate();
    }

    scheduleUpdate() {
        if (this.frameId !== null) return;
        this.frameId = requestAnimationFrame(() => {
            this.frameId = null;
            this.update();
        });
    }

    update() {
        const activationLine = this.stickyHeader.getBoundingClientRect().bottom + 1;
        const sections = Array.from(this.yearsContainer.querySelectorAll('.gallery-year-section'))
            .map(element => ({
                year: element.dataset.year,
                top: element.getBoundingClientRect().top
            }));
        const nextYear = getActiveGalleryYear(sections, activationLine);

        if (nextYear === this.activeYear) return;
        this.activeYear = nextYear;
        this.onChange(nextYear);
    }

    disconnect() {
        window.removeEventListener('scroll', this.scheduleUpdate);
        window.removeEventListener('resize', this.scheduleUpdate);
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = null;
    }
}
