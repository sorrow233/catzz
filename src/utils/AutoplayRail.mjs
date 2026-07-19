export function getNextAutoplayIndex(currentIndex, itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 0) return 0;
    return (Math.max(0, currentIndex) + 1) % itemCount;
}

export function getScrubberPosition(index, itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 1) return 0;
    return Math.min(100, Math.max(0, (index / (itemCount - 1)) * 100));
}

export default class AutoplayRail {
    constructor({ track, scrubber, positionLabel, intervalMs = 6_500, transitionMs = 900, itemSelector = '.rail-item' }) {
        this.track = track;
        this.scrubber = scrubber;
        this.positionLabel = positionLabel;
        this.intervalMs = intervalMs;
        this.transitionMs = transitionMs;
        this.itemSelector = itemSelector;
        this.items = [];
        this.currentIndex = 0;
        this.timer = null;
        this.isWrapping = false;
        this.handleVisibility = this.handleVisibility.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
        this.handleScrubInput = this.handleScrubInput.bind(this);
        this.handleScrubChange = this.handleScrubChange.bind(this);
    }

    connect() {
        document.addEventListener('visibilitychange', this.handleVisibility);
        this.track.addEventListener('transitionend', this.handleTransitionEnd);
        this.scrubber.addEventListener('pointerdown', () => this.clearTimer());
        this.scrubber.addEventListener('input', this.handleScrubInput);
        this.scrubber.addEventListener('change', this.handleScrubChange);
        this.refresh();
    }

    refresh() {
        this.clearTimer();
        this.track.querySelectorAll('.autoplay-clone').forEach(clone => clone.remove());
        this.items = Array.from(this.track.querySelectorAll(this.itemSelector));
        this.currentIndex = 0;
        this.isWrapping = false;

        if (this.items.length > 1) {
            const firstClone = this.items[0].cloneNode(true);
            firstClone.classList.add('autoplay-clone');
            firstClone.setAttribute('aria-hidden', 'true');
            firstClone.tabIndex = -1;
            this.track.append(firstClone);
        }

        this.applyTransform(0, false);
        this.updateState();
        this.scheduleNext();
    }

    handleVisibility() {
        if (document.hidden) {
            this.clearTimer();
            return;
        }
        this.scheduleNext();
    }

    handleTransitionEnd(event) {
        if (event.target !== this.track || event.propertyName !== 'transform' || !this.isWrapping) return;
        this.isWrapping = false;
        this.currentIndex = 0;
        this.applyTransform(0, false);
        this.updateState();
        requestAnimationFrame(() => this.scheduleNext());
    }

    handleScrubInput(event) {
        this.clearTimer();
        this.isWrapping = false;
        this.currentIndex = Number(event.target.value) || 0;
        this.applyTransform(this.currentIndex, false);
        this.updateState();
    }

    handleScrubChange() {
        this.scheduleNext();
    }

    scheduleNext() {
        this.clearTimer();
        if (this.items.length < 2 || document.hidden) return;
        this.timer = window.setTimeout(() => this.advance(), this.intervalMs);
    }

    advance() {
        this.clearTimer();
        if (this.currentIndex === this.items.length - 1) {
            this.isWrapping = true;
            this.applyTransform(this.items.length, true);
            return;
        }

        this.currentIndex = getNextAutoplayIndex(this.currentIndex, this.items.length);
        this.applyTransform(this.currentIndex, true);
        this.updateState();
        this.scheduleNext();
    }

    applyTransform(index, animate) {
        this.track.style.transition = animate
            ? `transform ${this.transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none';
        this.track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    }

    updateState() {
        this.items.forEach((item, index) => {
            const isCurrent = index === this.currentIndex;
            item.setAttribute('aria-hidden', String(!isCurrent));
            item.tabIndex = isCurrent ? 0 : -1;
        });

        const total = this.items.length;
        const current = total > 0 ? this.currentIndex + 1 : 0;
        this.scrubber.min = '0';
        this.scrubber.max = String(Math.max(0, total - 1));
        this.scrubber.value = String(this.currentIndex);
        this.scrubber.disabled = total < 2;
        this.scrubber.setAttribute('aria-valuetext', `${current} / ${total}`);
        this.scrubber.style.setProperty('--position', `${getScrubberPosition(this.currentIndex, total)}%`);
        this.positionLabel.textContent = `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    clearTimer() {
        if (this.timer !== null) window.clearTimeout(this.timer);
        this.timer = null;
    }
}
