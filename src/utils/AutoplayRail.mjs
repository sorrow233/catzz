export function getNextAutoplayIndex(currentIndex, itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 0) return 0;
    return (Math.max(0, currentIndex) + 1) % itemCount;
}

export default class AutoplayRail {
    constructor({ container, progress, intervalMs = 6_500, itemSelector = '.rail-item' }) {
        this.container = container;
        this.progress = progress;
        this.intervalMs = intervalMs;
        this.itemSelector = itemSelector;
        this.items = [];
        this.currentIndex = 0;
        this.timer = null;
        this.handleVisibility = this.handleVisibility.bind(this);
    }

    connect() {
        document.addEventListener('visibilitychange', this.handleVisibility);
        this.refresh();
    }

    refresh() {
        this.items = Array.from(this.container.querySelectorAll(this.itemSelector));
        this.currentIndex = 0;
        this.updateAccessibility();
        this.container.scrollTo({ left: 0, behavior: 'auto' });
        this.scheduleNext();
    }

    handleVisibility() {
        if (document.hidden) {
            this.clearTimer();
            return;
        }
        this.scheduleNext();
    }

    scheduleNext() {
        this.clearTimer();
        this.animateProgress();
        if (this.items.length < 2 || document.hidden) return;
        this.timer = window.setTimeout(() => {
            this.currentIndex = getNextAutoplayIndex(this.currentIndex, this.items.length);
            const target = this.items[this.currentIndex];
            this.updateAccessibility();
            this.container.scrollTo({
                left: target.offsetLeft - this.container.offsetLeft,
                behavior: 'smooth'
            });
            this.scheduleNext();
        }, this.intervalMs);
    }

    animateProgress() {
        if (!this.progress) return;
        this.progress.style.transition = 'none';
        this.progress.style.transform = 'scaleX(0)';
        requestAnimationFrame(() => {
            this.progress.style.transition = `transform ${this.intervalMs}ms linear`;
            this.progress.style.transform = 'scaleX(1)';
        });
    }

    updateAccessibility() {
        this.items.forEach((item, index) => {
            const isCurrent = index === this.currentIndex;
            item.setAttribute('aria-hidden', String(!isCurrent));
            item.tabIndex = isCurrent ? 0 : -1;
        });
    }

    clearTimer() {
        if (this.timer !== null) window.clearTimeout(this.timer);
        this.timer = null;
    }
}
