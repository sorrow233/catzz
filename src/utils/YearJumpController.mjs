export function calculateYearScrollTop({ scrollY, sectionTop, headerHeight, gap = 24 }) {
    const values = [scrollY, sectionTop, headerHeight, gap];
    if (!values.every(Number.isFinite)) return 0;
    return Math.max(0, scrollY + sectionTop - headerHeight - gap);
}

export default class YearJumpController {
    constructor({ layoutRoot, stickyHeader, maxLockMs = 3_000 }) {
        this.layoutRoot = layoutRoot;
        this.stickyHeader = stickyHeader;
        this.maxLockMs = maxLockMs;
        this.target = null;
        this.resizeObserver = null;
        this.frameId = null;
        this.unlockTimer = null;
        this.cancel = this.cancel.bind(this);
    }

    jumpTo(section) {
        this.cancel();
        this.target = section;

        this.frameId = requestAnimationFrame(() => {
            this.frameId = null;
            if (!this.target) return;
            this.align();

            if ('ResizeObserver' in window) {
                this.resizeObserver = new ResizeObserver(() => this.scheduleAlign());
                this.resizeObserver.observe(this.layoutRoot);
            }

            window.addEventListener('wheel', this.cancel, { passive: true, once: true });
            window.addEventListener('touchstart', this.cancel, { passive: true, once: true });
            window.addEventListener('pointerdown', this.cancel, { passive: true, once: true });
            window.addEventListener('keydown', this.cancel, { once: true });
            this.unlockTimer = window.setTimeout(this.cancel, this.maxLockMs);
        });
    }

    scheduleAlign() {
        if (this.frameId !== null || !this.target) return;
        this.frameId = requestAnimationFrame(() => {
            this.frameId = null;
            this.align();
        });
    }

    align() {
        if (!this.target) return;
        const top = calculateYearScrollTop({
            scrollY: window.scrollY,
            sectionTop: this.target.getBoundingClientRect().top,
            headerHeight: this.stickyHeader.getBoundingClientRect().height
        });
        window.scrollTo({ top, behavior: 'auto' });
    }

    cancel() {
        this.target = null;
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = null;
        if (this.unlockTimer !== null) window.clearTimeout(this.unlockTimer);
        this.unlockTimer = null;
        window.removeEventListener('wheel', this.cancel);
        window.removeEventListener('touchstart', this.cancel);
        window.removeEventListener('pointerdown', this.cancel);
        window.removeEventListener('keydown', this.cancel);
    }
}
