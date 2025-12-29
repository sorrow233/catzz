import { i18n } from '../utils/i18n.js';

export class Carousel {
    constructor(containerElement, slides) {
        this.element = containerElement;
        this.slides = slides;
        this.currentSlideIndex = 0;
        this.interval = null;

        this.init();
    }

    init() {
        this.container = this.element.querySelector('#carousel-container');
        this.slideElements = this.element.querySelectorAll('.carousel-slide');
        this.numDisplay = this.element.querySelector('#current-slide-num');
        this.progress = this.element.querySelector('#slide-progress');
        this.nextArea = this.element.querySelector('#next-area');
        this.prevArea = this.element.querySelector('#prev-area');

        this.startAuto();
        this.bindEvents();
    }

    resetProgress() {
        if (!this.progress) return;
        this.progress.style.transition = 'none';
        this.progress.style.width = '0%';
        setTimeout(() => {
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
        this.resetProgress();
        this.interval = setInterval(() => {
            this.updateSlide(this.currentSlideIndex + 1);
        }, 6000);
    }

    stopAuto() {
        clearInterval(this.interval);
        if (this.progress) {
            this.progress.style.transition = 'none';
            this.progress.style.width = '0%';
        }
    }

    bindEvents() {
        if (this.nextArea) {
            this.nextArea.addEventListener('click', () => {
                this.stopAuto();
                this.updateSlide(this.currentSlideIndex + 1);
                this.startAuto();
            });
        }
        if (this.prevArea) {
            this.prevArea.addEventListener('click', () => {
                this.stopAuto();
                this.updateSlide(this.currentSlideIndex - 1);
                this.startAuto();
            });
        }
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.stopAuto());
            this.container.addEventListener('mouseleave', () => this.startAuto());
        }

        // Listen for language changes to update captions
        window.addEventListener('languageChanged', () => this.updateCaptions());
    }

    updateCaptions() {
        const captions = i18n.t('carousel.slides');
        const captionElements = this.element.querySelectorAll('.slide-caption');
        captionElements.forEach((el, index) => {
            el.textContent = captions[index];
        });
    }

    destroy() {
        if (this.interval) clearInterval(this.interval);
        // Note: Event listeners on DOM elements will be removed when elements are removed
        // But the window listener needs to be removed
        // Warning: anonymous function in bindEvents cannot be removed. 
        // Improvement: store reference bound function.
    }
}
