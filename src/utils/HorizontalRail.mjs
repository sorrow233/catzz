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

export function getSmoothedScrollLeft(current, target, deltaMs, responseMs = 90) {
    if (![current, target, deltaMs, responseMs].every(Number.isFinite) || responseMs <= 0) return target;
    const blend = 1 - Math.exp(-Math.max(0, deltaMs) / responseMs);
    return current + (target - current) * blend;
}

export function getItemIndexFromScrubber(value, maximum, itemCount) {
    if (itemCount <= 1) return 0;
    return Math.round(clampRailRatio(value / maximum) * (itemCount - 1));
}

export default class HorizontalRail {
    constructor({ container, counter, scrubber, progress, dateLabel, edgeDateLabel, itemSelector = '.rail-item' }) {
        this.container = container;
        this.counter = counter;
        this.scrubber = scrubber;
        this.progress = progress;
        this.dateLabel = dateLabel;
        this.edgeDateLabel = edgeDateLabel;
        this.itemSelector = itemSelector;
        this.currentIndex = 0;
        this.frameId = null;
        this.motionFrameId = null;
        this.dateFrameId = null;
        this.targetScrollLeft = 0;
        this.lastMotionTime = null;
        this.isScrubbing = false;

        this.stepMotion = this.stepMotion.bind(this);
    }

    connect() {
        this.container.addEventListener('scroll', () => this.scheduleUpdate(), { passive: true });
        this.container.addEventListener('pointerdown', () => this.cancelMotion(), { passive: true });
        this.container.addEventListener('wheel', () => this.cancelMotion(), { passive: true });
        window.addEventListener('resize', () => this.scheduleUpdate(), { passive: true });
        this.scrubber?.addEventListener('pointerdown', () => this.beginScrubbing());
        this.scrubber?.addEventListener('input', event => this.scrubTo(event.currentTarget.value));
        this.scrubber?.addEventListener('change', () => this.endScrubbing());
        this.scrubber?.addEventListener('pointerup', () => this.endScrubbing());
        this.scrubber?.addEventListener('pointercancel', () => this.endScrubbing());
        this.refresh();
    }

    refresh() {
        this.cancelMotion();
        this.items = Array.from(this.container.querySelectorAll(this.itemSelector));
        this.targetScrollLeft = this.container.scrollLeft;
        this.update();
    }

    beginScrubbing() {
        this.isScrubbing = true;
        this.progress?.classList.add('is-scrubbing');
    }

    scrubTo(value) {
        const maximum = Number(this.scrubber?.max) || 1000;
        const maximumScroll = Math.max(this.container.scrollWidth - this.container.clientWidth, 0);
        this.targetScrollLeft = getScrollLeftFromScrubber(Number(value), maximum, maximumScroll);
        this.updateScrubber(Number(value), maximum);
        this.updateDateLabel(getItemIndexFromScrubber(Number(value), maximum, this.items.length));
        this.startMotion();
    }

    endScrubbing() {
        this.isScrubbing = false;
        this.progress?.classList.remove('is-scrubbing');
    }

    startMotion() {
        if (this.motionFrameId !== null) return;
        this.lastMotionTime = null;
        this.motionFrameId = requestAnimationFrame(this.stepMotion);
    }

    stepMotion(timestamp) {
        const current = this.container.scrollLeft;
        const delta = this.targetScrollLeft - current;

        if (Math.abs(delta) < 0.35) {
            this.container.scrollLeft = this.targetScrollLeft;
            this.motionFrameId = null;
            this.lastMotionTime = null;
            this.update();
            return;
        }

        const deltaMs = this.lastMotionTime === null ? 16 : Math.min(timestamp - this.lastMotionTime, 32);
        this.lastMotionTime = timestamp;
        this.container.scrollLeft = getSmoothedScrollLeft(current, this.targetScrollLeft, deltaMs);
        this.motionFrameId = requestAnimationFrame(this.stepMotion);
    }

    cancelMotion() {
        if (this.motionFrameId !== null) cancelAnimationFrame(this.motionFrameId);
        this.motionFrameId = null;
        this.lastMotionTime = null;
        this.targetScrollLeft = this.container.scrollLeft;
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
            if (this.dateLabel) this.dateLabel.textContent = '--.--';
            if (this.edgeDateLabel) this.edgeDateLabel.textContent = '--.--';
            return;
        }

        if (this.scrubber) this.scrubber.disabled = false;
        this.currentIndex = this.findIndexAtScrollLeft(this.container.scrollLeft);
        const current = String(this.currentIndex + 1).padStart(2, '0');
        const total = String(this.items.length).padStart(2, '0');

        if (this.counter) this.counter.textContent = `${current} / ${total}`;
        if (this.scrubber) {
            const maximum = Number(this.scrubber.max) || 1000;
            const maximumScroll = Math.max(this.container.scrollWidth - this.container.clientWidth, 0);
            const value = getScrubberValue(this.container.scrollLeft, maximumScroll, maximum);
            if (!this.isScrubbing && this.motionFrameId === null) {
                this.updateScrubber(value, maximum);
                this.updateDateLabel(getItemIndexFromScrubber(value, maximum, this.items.length));
            }
            this.scrubber.setAttribute('aria-valuetext', `${current} / ${total}`);
        }
    }

    findIndexAtScrollLeft(scrollLeft) {
        if (!this.items?.length) return 0;
        const viewportCenter = scrollLeft + this.container.clientWidth / 2;
        const firstOffset = this.items[0].offsetLeft;
        const itemCenters = this.items.map(item => item.offsetLeft - firstOffset + item.offsetWidth / 2);
        return findClosestItemIndex(itemCenters, viewportCenter);
    }

    updateDateLabel(index) {
        if (!this.dateLabel) return;
        const nextLabel = this.items?.[index]?.dataset.month || '--.--';
        if (this.dateLabel.textContent === nextLabel) return;
        this.dateLabel.textContent = nextLabel;
        if (this.edgeDateLabel) this.edgeDateLabel.textContent = nextLabel;
        this.dateLabel.classList.remove('is-changing');
        if (this.dateFrameId !== null) cancelAnimationFrame(this.dateFrameId);
        this.dateFrameId = requestAnimationFrame(() => {
            this.dateLabel.classList.add('is-changing');
            this.dateFrameId = null;
        });
    }

    updateScrubber(value, maximum) {
        if (!this.scrubber) return;
        const position = clampRailRatio(value / maximum) * 100;
        this.scrubber.value = String(value);
        (this.progress || this.scrubber).style.setProperty('--position', `${position}%`);
    }
}
