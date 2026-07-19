export function findClosestItemIndex(itemCenters, viewportCenter) {
    if (itemCenters.length === 0) return 0;
    return itemCenters.reduce((closestIndex, center, index) => {
        return Math.abs(center - viewportCenter) < Math.abs(itemCenters[closestIndex] - viewportCenter)
            ? index
            : closestIndex;
    }, 0);
}

export function clampRailRatio(value) {
    return Math.min(Math.max(Number(value) || 0, 0), 1);
}

export function getScrollLeftFromScrubber(value, maximum, maximumScroll) {
    if (maximum <= 0 || maximumScroll <= 0) return 0;
    return clampRailRatio(value / maximum) * maximumScroll;
}

export function getScrubberValue(scrollLeft, maximumScroll, maximum) {
    if (maximumScroll <= 0 || maximum <= 0) return 0;
    return Math.round(clampRailRatio(scrollLeft / maximumScroll) * maximum);
}

export default class HorizontalRail {
    constructor({ container, counter, scrubber, itemSelector = '.rail-item' }) {
        this.container = container;
        this.counter = counter;
        this.scrubber = scrubber;
        this.itemSelector = itemSelector;
        this.currentIndex = 0;
        this.frameId = null;
    }

    connect() {
        this.container.addEventListener('scroll', () => this.scheduleUpdate(), { passive: true });
        window.addEventListener('resize', () => this.scheduleUpdate(), { passive: true });
        this.scrubber?.addEventListener('input', event => this.scrubTo(event.currentTarget.value));
        this.refresh();
    }

    refresh() {
        this.items = Array.from(this.container.querySelectorAll(this.itemSelector));
        this.update();
    }

    scrubTo(value) {
        const maximum = Number(this.scrubber?.max) || 1000;
        const maximumScroll = Math.max(this.container.scrollWidth - this.container.clientWidth, 0);
        const scrollLeft = getScrollLeftFromScrubber(Number(value), maximum, maximumScroll);
        this.container.scrollTo({ left: scrollLeft, behavior: 'auto' });
        this.updateScrubber(Number(value), maximum);
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
        if (!this.items?.length) {
            if (this.counter) this.counter.textContent = '00 / 00';
            if (this.scrubber) this.scrubber.disabled = true;
            return;
        }

        if (this.scrubber) this.scrubber.disabled = false;
        const viewportCenter = this.container.scrollLeft + this.container.clientWidth / 2;
        const firstOffset = this.items[0].offsetLeft;
        const itemCenters = this.items.map(item => item.offsetLeft - firstOffset + item.offsetWidth / 2);
        this.currentIndex = findClosestItemIndex(itemCenters, viewportCenter);
        const current = String(this.currentIndex + 1).padStart(2, '0');
        const total = String(this.items.length).padStart(2, '0');

        if (this.counter) this.counter.textContent = `${current} / ${total}`;
        if (this.scrubber) {
            const maximum = Number(this.scrubber.max) || 1000;
            const maximumScroll = Math.max(this.container.scrollWidth - this.container.clientWidth, 0);
            const value = getScrubberValue(this.container.scrollLeft, maximumScroll, maximum);
            this.updateScrubber(value, maximum);
            this.scrubber.setAttribute('aria-valuetext', `${current} / ${total}`);
        }
    }

    updateScrubber(value, maximum) {
        if (!this.scrubber) return;
        const position = clampRailRatio(value / maximum) * 100;
        this.scrubber.value = String(value);
        this.scrubber.style.setProperty('--position', `${position}%`);
    }
}
