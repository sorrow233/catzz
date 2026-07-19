import ImpressionsProgress, { getScrubberIndex } from './ImpressionsProgress.mjs';

export function getNextAutoplayIndex(currentIndex, itemCount) {
    if (!Number.isInteger(itemCount) || itemCount <= 0) return 0;
    return (Math.max(0, currentIndex) + 1) % itemCount;
}

export default class AutoplayRail {
    constructor({
        track,
        scrubber,
        progress,
        positionLabel,
        intervalMs = 7_200,
        transitionMs = 1_400,
        itemSelector = '.rail-item'
    }) {
        this.track = track;
        this.scrubber = scrubber;
        this.progressControl = new ImpressionsProgress({
            element: progress,
            scrubber,
            positionLabel
        });
        this.intervalMs = intervalMs;
        this.transitionMs = transitionMs;
        this.itemSelector = itemSelector;
        this.items = [];
        this.currentIndex = 0;
        this.visualIndex = -1;
        this.timer = null;
        this.isWrapping = false;
        this.isPointerScrubbing = false;
        this.isIntersecting = true;
        this.observer = null;

        this.handleVisibility = this.handleVisibility.bind(this);
        this.handleIntersection = this.handleIntersection.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
        this.handleScrubStart = this.handleScrubStart.bind(this);
        this.handleScrubInput = this.handleScrubInput.bind(this);
        this.handleScrubEnd = this.handleScrubEnd.bind(this);
    }

    connect() {
        document.addEventListener('visibilitychange', this.handleVisibility);
        this.track.addEventListener('transitionend', this.handleTransitionEnd);
        this.scrubber.addEventListener('pointerdown', this.handleScrubStart);
        this.scrubber.addEventListener('input', this.handleScrubInput);
        this.scrubber.addEventListener('change', this.handleScrubEnd);
        this.scrubber.addEventListener('pointerup', this.handleScrubEnd);
        this.scrubber.addEventListener('pointercancel', this.handleScrubEnd);
        this.progressControl.connect();
        this.observeVisibility();
        this.refresh();
    }

    observeVisibility() {
        if (!('IntersectionObserver' in window)) return;
        this.observer = new IntersectionObserver(this.handleIntersection);
        this.observer.observe(this.track);
    }

    handleIntersection([entry]) {
        this.isIntersecting = entry.isIntersecting;
        if (this.isIntersecting) this.scheduleNext();
        else this.clearTimer();
    }

    refresh() {
        this.clearTimer();
        this.progressControl.cancelReset();
        this.track.querySelectorAll('.autoplay-clone').forEach(clone => clone.remove());
        this.items = Array.from(this.track.querySelectorAll(this.itemSelector));
        this.currentIndex = 0;
        this.visualIndex = -1;
        this.isWrapping = false;
        this.isPointerScrubbing = false;
        this.progressControl.endScrub();

        if (this.items.length > 1) {
            const firstClone = this.items[0].cloneNode(true);
            firstClone.classList.add('autoplay-clone');
            firstClone.setAttribute('aria-hidden', 'true');
            firstClone.tabIndex = -1;
            this.track.append(firstClone);
        }

        this.progressControl.configure(this.items.length);
        this.applyTransform(0, false);
        this.setSlideState(0);
        this.syncControls(0, { animateProgress: false });
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
        if (event.target !== this.track || event.propertyName !== 'transform') return;

        if (!this.isWrapping) {
            this.clearLeavingState();
            return;
        }

        this.isWrapping = false;
        this.currentIndex = 0;
        this.applyTransform(0, false);
        this.setSlideState(0);
        this.syncControls(0, { updateProgress: false });
        this.progressControl.resetToStart();
        requestAnimationFrame(() => this.scheduleNext());
    }

    handleScrubStart() {
        this.clearTimer();
        this.progressControl.cancelReset();
        this.isPointerScrubbing = true;
        this.isWrapping = false;
        this.progressControl.beginScrub();
    }

    handleScrubInput(event) {
        this.clearTimer();
        const position = getScrubberIndex(event.currentTarget.value, this.items.length);
        const nearestIndex = Math.round(position);
        const animate = !this.isPointerScrubbing;

        this.currentIndex = nearestIndex;
        this.isWrapping = false;
        this.applyTransform(position, animate);
        this.setSlideState(nearestIndex);
        this.syncControls(position, {
            activeIndex: nearestIndex,
            animateProgress: animate,
            syncScrubber: false
        });
    }

    handleScrubEnd() {
        if (!this.isPointerScrubbing) {
            this.scheduleNext();
            return;
        }

        const targetIndex = Math.round(this.progressControl.readPosition());
        this.isPointerScrubbing = false;
        this.progressControl.endScrub();
        this.currentIndex = targetIndex;
        this.applyTransform(targetIndex, true);
        this.setSlideState(targetIndex);
        this.syncControls(targetIndex, { animateProgress: true });
        this.scheduleNext();
    }

    scheduleNext() {
        this.clearTimer();
        if (this.items.length < 2 || document.hidden || !this.isIntersecting || this.isPointerScrubbing) return;
        this.timer = window.setTimeout(() => this.advance(), this.intervalMs);
    }

    advance() {
        this.clearTimer();

        if (this.currentIndex === this.items.length - 1) {
            this.isWrapping = true;
            this.setSlideState(this.items.length);
            this.applyTransform(this.items.length, true);
            return;
        }

        this.currentIndex = getNextAutoplayIndex(this.currentIndex, this.items.length);
        this.setSlideState(this.currentIndex);
        this.applyTransform(this.currentIndex, true);
        this.syncControls(this.currentIndex, { animateProgress: true });
        this.scheduleNext();
    }

    applyTransform(index, animate) {
        this.track.style.transition = animate
            ? `transform ${this.transitionMs}ms cubic-bezier(0.76, 0, 0.24, 1)`
            : 'none';
        this.track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    }

    setSlideState(activeIndex) {
        if (activeIndex === this.visualIndex) return;
        const slides = Array.from(this.track.querySelectorAll(this.itemSelector));
        const previousSlide = slides[this.visualIndex];
        const activeSlide = slides[activeIndex];

        slides.forEach(slide => slide.classList.remove('is-active', 'is-leaving'));
        previousSlide?.classList.add('is-leaving');
        activeSlide?.classList.add('is-active');
        this.visualIndex = activeIndex;
    }

    clearLeavingState() {
        this.track.querySelectorAll('.is-leaving').forEach(item => item.classList.remove('is-leaving'));
    }

    syncControls(position, {
        activeIndex = Math.round(position),
        animateProgress = true,
        syncScrubber = true,
        updateProgress = true
    } = {}) {
        const total = this.items.length;
        const safeIndex = total > 0 ? Math.min(total - 1, Math.max(0, activeIndex)) : 0;

        this.items.forEach((item, index) => {
            const isCurrent = index === safeIndex;
            item.setAttribute('aria-hidden', String(!isCurrent));
            item.tabIndex = isCurrent ? 0 : -1;
        });

        this.progressControl.sync(position, safeIndex, {
            animate: animateProgress,
            syncScrubber,
            updateProgress
        });
    }

    clearTimer() {
        if (this.timer !== null) window.clearTimeout(this.timer);
        this.timer = null;
    }
}
