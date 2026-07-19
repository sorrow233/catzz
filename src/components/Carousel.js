import { i18n } from '../utils/i18n.js';

export class Carousel {
    constructor(containerElement, slides) {
        this.element = containerElement;
        this.slides = slides;
        this.currentSlideIndex = 0;
        this.interval = null;
        this.progressTimer = null;
        this.isIntersecting = true;
        this.isPageVisible = !document.hidden;
        this.isHovering = false;
        this.observer = null;

        this.handleNext = this.handleNext.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleVisibility = this.handleVisibility.bind(this);
        this.handleLanguageChange = this.updateCaptions.bind(this);

        this.init();
    }

    init() {
        this.container = this.element.querySelector('#carousel-container');
        this.slideElements = this.element.querySelectorAll('.carousel-slide');
        this.numDisplay = this.element.querySelector('#current-slide-num');
        this.progress = this.element.querySelector('#slide-progress');
        this.nextArea = this.element.querySelector('#next-area');
        this.prevArea = this.element.querySelector('#prev-area');

        this.bindEvents();
        this.observeVisibility();
        this.syncAutoPlayback();
    }

    resetProgress() {
        if (!this.progress) return;
        this.progress.style.transition = 'none';
        this.progress.style.width = '0%';
        if (this.progressTimer !== null) clearTimeout(this.progressTimer);
        this.progressTimer = setTimeout(() => {
            this.progressTimer = null;
            if (this.progress) {
                this.progress.style.transition = 'width 6000ms linear';
                this.progress.style.width = '100%';
            }
        }, 50);
    }

    updateSlide(idx) {
        if (idx >= this.slides.length) idx = 0;
        if (idx < 0) idx = this.slides.length - 1;
        this.currentSlideIndex = idx;

        this.slideElements.forEach(slide => {
            const i = parseInt(slide.dataset.index);
            const captionContainer = slide.querySelector('.absolute.bottom-8');

            if (i === idx) {
                slide.classList.remove('slide-inactive');
                slide.classList.add('slide-active');
                if (captionContainer) {
                    captionContainer.classList.remove('caption-inactive');
                    captionContainer.classList.add('caption-active');
                }
            } else {
                slide.classList.remove('slide-active');
                slide.classList.add('slide-inactive');
                if (captionContainer) {
                    captionContainer.classList.remove('caption-active');
                    captionContainer.classList.add('caption-inactive');
                }
            }
        });

        if (this.numDisplay) this.numDisplay.textContent = `0${idx + 1}`;
        this.resetProgress();
    }

    startAuto() {
        if (this.interval !== null || !this.shouldAutoPlay()) return;
        this.resetProgress();
        this.interval = setInterval(() => {
            this.updateSlide(this.currentSlideIndex + 1);
        }, 6000);
    }

    stopAuto() {
        if (this.interval !== null) clearInterval(this.interval);
        if (this.progressTimer !== null) clearTimeout(this.progressTimer);
        this.interval = null;
        this.progressTimer = null;
        if (this.progress) {
            this.progress.style.transition = 'none';
            this.progress.style.width = '0%';
        }
    }

    bindEvents() {
        if (this.nextArea) this.nextArea.addEventListener('click', this.handleNext);
        if (this.prevArea) this.prevArea.addEventListener('click', this.handlePrevious);
        if (this.container) {
            this.container.addEventListener('mouseenter', this.handleMouseEnter);
            this.container.addEventListener('mouseleave', this.handleMouseLeave);
        }

        // Listen for language changes to update captions
        window.addEventListener('languageChanged', this.handleLanguageChange);
        document.addEventListener('visibilitychange', this.handleVisibility);
    }

    observeVisibility() {
        if (!('IntersectionObserver' in window) || !this.container) return;

        this.observer = new IntersectionObserver(([entry]) => {
            this.isIntersecting = entry.isIntersecting;
            this.syncAutoPlayback();
        });
        this.observer.observe(this.container);
    }

    shouldAutoPlay() {
        return this.isIntersecting && this.isPageVisible && !this.isHovering;
    }

    syncAutoPlayback() {
        if (this.shouldAutoPlay()) this.startAuto();
        else this.stopAuto();
    }

    handleNext() {
        this.stopAuto();
        this.updateSlide(this.currentSlideIndex + 1);
        this.syncAutoPlayback();
    }

    handlePrevious() {
        this.stopAuto();
        this.updateSlide(this.currentSlideIndex - 1);
        this.syncAutoPlayback();
    }

    handleMouseEnter() {
        this.isHovering = true;
        this.syncAutoPlayback();
    }

    handleMouseLeave() {
        this.isHovering = false;
        this.syncAutoPlayback();
    }

    handleVisibility() {
        this.isPageVisible = !document.hidden;
        this.syncAutoPlayback();
    }

    updateCaptions() {
        const captions = i18n.t('carousel.slides');
        const captionElements = this.element.querySelectorAll('.slide-caption');
        captionElements.forEach((el, index) => {
            el.textContent = captions[index];
        });
    }

    destroy() {
        this.stopAuto();
        this.observer?.disconnect();
        if (this.nextArea) this.nextArea.removeEventListener('click', this.handleNext);
        if (this.prevArea) this.prevArea.removeEventListener('click', this.handlePrevious);
        if (this.container) {
            this.container.removeEventListener('mouseenter', this.handleMouseEnter);
            this.container.removeEventListener('mouseleave', this.handleMouseLeave);
        }
        window.removeEventListener('languageChanged', this.handleLanguageChange);
        document.removeEventListener('visibilitychange', this.handleVisibility);
    }
}
