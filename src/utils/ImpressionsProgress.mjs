const SCRUBBER_UNITS_PER_ITEM = 100;

export function getScrubberPosition(index, itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 1) return 0;
    return Math.min(100, Math.max(0, (index / (itemCount - 1)) * 100));
}

export function getScrubberMaximum(itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 1) return 0;
    return (itemCount - 1) * SCRUBBER_UNITS_PER_ITEM;
}

export function getScrubberIndex(value, itemCount) {
    const maximumIndex = Math.max(0, itemCount - 1);
    const index = (Number(value) || 0) / SCRUBBER_UNITS_PER_ITEM;
    return Math.min(maximumIndex, Math.max(0, index));
}

export default class ImpressionsProgress {
    constructor({ element, scrubber, positionLabel }) {
        this.element = element;
        this.scrubber = scrubber;
        this.positionLabel = positionLabel;
        this.itemCount = 0;
        this.resetTimer = null;
    }

    connect() {
        this.scrubber.addEventListener('focus', () => this.element.classList.add('is-focused'));
        this.scrubber.addEventListener('blur', () => this.element.classList.remove('is-focused'));
    }

    configure(itemCount) {
        this.cancelReset();
        this.itemCount = itemCount;
        this.scrubber.min = '0';
        this.scrubber.max = String(getScrubberMaximum(itemCount));
        this.scrubber.step = '1';
        this.scrubber.disabled = itemCount < 2;
    }

    readPosition() {
        return getScrubberIndex(this.scrubber.value, this.itemCount);
    }

    beginScrub() {
        this.cancelReset();
        this.element.classList.add('is-scrubbing');
        this.setPosition(this.readPosition(), false);
    }

    endScrub() {
        this.element.classList.remove('is-scrubbing', 'is-immediate');
    }

    sync(position, activeIndex, { animate = true, syncScrubber = true, updateProgress = true } = {}) {
        const safeIndex = this.itemCount > 0
            ? Math.min(this.itemCount - 1, Math.max(0, activeIndex))
            : 0;
        const current = this.itemCount > 0 ? safeIndex + 1 : 0;

        if (syncScrubber) {
            this.scrubber.value = String(position * SCRUBBER_UNITS_PER_ITEM);
        }
        this.scrubber.setAttribute('aria-valuetext', `${current} / ${this.itemCount}`);
        this.positionLabel.textContent = `${String(current).padStart(2, '0')} / ${String(this.itemCount).padStart(2, '0')}`;

        if (updateProgress) this.setPosition(position, animate);
    }

    setPosition(position, animate) {
        if (!animate) this.element.classList.add('is-immediate');
        this.element.style.setProperty('--position', `${getScrubberPosition(position, this.itemCount)}%`);

        if (!animate && !this.element.classList.contains('is-scrubbing')) {
            requestAnimationFrame(() => this.element.classList.remove('is-immediate'));
        }
    }

    resetToStart() {
        this.cancelReset();
        this.element.classList.add('is-resetting');
        this.resetTimer = window.setTimeout(() => {
            this.element.style.setProperty('--position', '0%');
            requestAnimationFrame(() => {
                this.element.classList.remove('is-resetting');
                this.resetTimer = null;
            });
        }, 260);
    }

    cancelReset() {
        if (this.resetTimer !== null) window.clearTimeout(this.resetTimer);
        this.resetTimer = null;
        this.element.classList.remove('is-resetting', 'is-immediate');
    }
}
