export function findClosestItemIndex(itemCenters, viewportCenter) {
    if (itemCenters.length === 0) return 0;
    return itemCenters.reduce((closestIndex, center, index) => {
        return Math.abs(center - viewportCenter) < Math.abs(itemCenters[closestIndex] - viewportCenter)
            ? index
            : closestIndex;
    }, 0);
}

export default class HorizontalRail {
    constructor({ container, previousButton, nextButton, counter, progress }) {
        this.container = container;
        this.previousButton = previousButton;
        this.nextButton = nextButton;
        this.counter = counter;
        this.progress = progress;
        this.currentIndex = 0;
        this.frameId = null;
    }

    connect() {
        this.previousButton?.addEventListener('click', () => this.move(-1));
        this.nextButton?.addEventListener('click', () => this.move(1));
        this.container.addEventListener('scroll', () => this.scheduleUpdate(), { passive: true });
        window.addEventListener('resize', () => this.scheduleUpdate(), { passive: true });
        this.refresh();
    }

    refresh() {
        this.items = Array.from(this.container.querySelectorAll('.timeline-item'));
        this.update();
    }

    move(direction) {
        if (!this.items?.length) return;
        const nextIndex = Math.min(Math.max(this.currentIndex + direction, 0), this.items.length - 1);
        const target = this.items[nextIndex];
        this.container.scrollTo({ left: target.offsetLeft - this.container.offsetLeft, behavior: 'smooth' });
    }

    scheduleUpdate() {
        if (this.frameId !== null) return;
        this.frameId = requestAnimationFrame(() => {
            this.frameId = null;
            this.update();
        });
    }

    update() {
        if (!this.items?.length) {
            if (this.counter) this.counter.textContent = '00 / 00';
            return;
        }

        const viewportCenter = this.container.scrollLeft + this.container.clientWidth / 2;
        const itemCenters = this.items.map(item => item.offsetLeft + item.offsetWidth / 2);
        this.currentIndex = findClosestItemIndex(itemCenters, viewportCenter);
        const current = String(this.currentIndex + 1).padStart(2, '0');
        const total = String(this.items.length).padStart(2, '0');

        if (this.counter) this.counter.textContent = `${current} / ${total}`;
        if (this.progress) this.progress.style.transform = `scaleX(${(this.currentIndex + 1) / this.items.length})`;
        if (this.previousButton) this.previousButton.disabled = this.currentIndex === 0;
        if (this.nextButton) this.nextButton.disabled = this.currentIndex === this.items.length - 1;
    }
}
