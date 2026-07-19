import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { selectRecentActivities } from '../utils/activity.mjs';
import { createActivityViewModel } from '../utils/activityView.mjs';
import HorizontalRail from '../utils/HorizontalRail.mjs';

export default class ImpressionsSection {
    constructor() {
        this.items = [];
        this.rail = null;
        this.MAX_ITEMS = 12;
        window.addEventListener('languageChanged', () => {
            this.updateLabels();
            this.renderItems();
        });
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full py-20 md:py-28 bg-[#f2f0eb] text-[#172126] overflow-hidden';
        this.element.innerHTML = `
            <div class="max-w-[1600px] mx-auto px-5 md:px-10">
                <div class="flex items-end justify-between gap-6 mb-10 md:mb-14">
                    <div>
                        <p data-impressions-eyebrow class="text-[10px] font-mono tracking-[0.3em] text-[#172126]/38 uppercase mb-3">${i18n.t('impressions.eyebrow')}</p>
                        <h2 data-impressions-title class="font-art text-4xl md:text-5xl lg:text-6xl font-normal leading-none tracking-[0.025em]">${i18n.t('impressions.title')}</h2>
                    </div>
                    <div class="flex items-center gap-3 md:gap-5">
                        <span id="impressions-counter" class="hidden sm:block font-mono text-xs tracking-[0.2em] text-[#172126]/40">00 / 00</span>
                        <button id="impressions-previous" aria-label="${i18n.t('impressions.previous')}" class="p-3 rounded-full border border-[#172126]/16 hover:bg-[#172126] hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <button id="impressions-next" aria-label="${i18n.t('impressions.next')}" class="p-3 rounded-full border border-[#172126]/16 hover:bg-[#172126] hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>

                <div id="impressions-rail" class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    <div class="loading-text w-full py-32 text-center text-[#172126]/30 font-mono text-xs tracking-wider">${i18n.t('impressions.loading')}</div>
                </div>

                <div class="flex items-center gap-5 mt-7">
                    <div class="h-px bg-[#172126]/15 flex-1 overflow-hidden">
                        <div id="impressions-progress" class="h-full bg-[#172126] origin-left scale-x-0 transition-transform duration-500"></div>
                    </div>
                    <span data-impressions-drag class="font-mono text-[10px] tracking-[0.28em] text-[#172126]/35 uppercase">${i18n.t('impressions.drag')}</span>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.rail = new HorizontalRail({
            container: this.element.querySelector('#impressions-rail'),
            previousButton: this.element.querySelector('#impressions-previous'),
            nextButton: this.element.querySelector('#impressions-next'),
            counter: this.element.querySelector('#impressions-counter'),
            progress: this.element.querySelector('#impressions-progress')
        });
        this.rail.connect();
        this.fetchData();
    }

    updateLabels() {
        if (!this.element) return;
        this.element.querySelector('[data-impressions-title]').textContent = i18n.t('impressions.title');
        this.element.querySelector('[data-impressions-eyebrow]').textContent = i18n.t('impressions.eyebrow');
        this.element.querySelector('[data-impressions-drag]').textContent = i18n.t('impressions.drag');
        this.element.querySelector('#impressions-previous').setAttribute('aria-label', i18n.t('impressions.previous'));
        this.element.querySelector('#impressions-next').setAttribute('aria-label', i18n.t('impressions.next'));
    }

    async fetchData() {
        const container = this.element.querySelector('#impressions-rail');
        try {
            const response = await fetch('/gallery.json');
            if (!response.ok) throw new Error('Failed to load recent impressions');
            const data = await response.json();
            this.items = selectRecentActivities(data, this.MAX_ITEMS).map(createActivityViewModel);
            this.renderItems();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="w-full py-32 text-center text-[#172126]/35">${i18n.t('impressions.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element?.querySelector('#impressions-rail');
        if (!container) return;
        if (this.items.length === 0) {
            container.innerHTML = `<div class="w-full py-32 text-center text-[#172126]/35">${i18n.t('impressions.empty')}</div>`;
            this.rail?.refresh();
            return;
        }

        container.innerHTML = this.items.map(item => `
            <a class="rail-item snap-start shrink-0 w-full grid md:grid-cols-[minmax(0,1.9fr)_minmax(250px,0.65fr)] gap-7 md:gap-12 lg:gap-16 group" href="${escapeHtml(safeExternalUrl(item.artworkUrl))}" target="_blank" rel="noopener noreferrer">
                <div class="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#d9d7d1]">
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]">
                </div>
                <div class="flex flex-col justify-center py-2 md:py-8 min-h-[190px] md:min-h-0">
                    <span class="font-mono text-[10px] tracking-[0.22em] text-[#172126]/38 uppercase mb-6">${item.date}</span>
                    <div>
                        <h3 class="font-art text-3xl md:text-4xl lg:text-5xl leading-[1.02] mb-8">${escapeHtml(item.title)}</h3>
                        <span class="inline-flex items-center gap-3 text-[10px] font-mono tracking-[0.24em] uppercase text-[#172126]/60 group-hover:text-[#172126]">
                            ${i18n.t('impressions.viewArtwork')}
                            <span class="w-9 h-px bg-current transition-all group-hover:w-14"></span>
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
        this.rail?.refresh();
    }
}
