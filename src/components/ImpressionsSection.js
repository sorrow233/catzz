import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { selectRecentActivities } from '../utils/activity.mjs';
import { createActivityViewModel } from '../utils/activityView.mjs';
import AutoplayRail from '../utils/AutoplayRail.mjs';
import { loadGalleryData } from '../utils/contentData.mjs';
import '../styles/impressions.css';

export default class ImpressionsSection {
    constructor() {
        this.items = [];
        this.rail = null;
        this.MAX_ITEMS = 6;
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
                <div class="flex items-center gap-4 md:gap-5 mb-8 md:mb-10">
                    <p data-impressions-eyebrow class="text-[10px] font-mono tracking-[0.3em] text-[#172126]/55 uppercase">${i18n.t('impressions.eyebrow')}</p>
                    <span class="w-8 md:w-12 h-px bg-[#172126]/20"></span>
                    <h2 data-impressions-title class="text-[9px] md:text-[10px] font-mono font-normal tracking-[0.3em] text-[#172126]/30 uppercase">${i18n.t('impressions.title')}</h2>
                </div>

                <div id="impressions-viewport" aria-roledescription="carousel" class="overflow-hidden touch-pan-y">
                    <div id="impressions-track" class="impressions-track flex">
                        <div class="loading-text w-full shrink-0 py-32 text-center text-[#172126]/30 font-mono text-xs tracking-wider">${i18n.t('impressions.loading')}</div>
                    </div>
                </div>

                <div class="flex items-center gap-4 md:gap-6 mt-5">
                    <div id="impressions-progress" class="impressions-progress min-w-0 flex-1">
                        <span class="impressions-progress-fill" aria-hidden="true"></span>
                        <span class="impressions-progress-dot" aria-hidden="true"></span>
                        <input id="impressions-scrubber" class="impressions-scrubber" type="range" min="0" max="0" value="0" step="1" aria-label="${i18n.t('impressions.progress')}">
                    </div>
                    <span id="impressions-position" class="w-14 text-right font-mono text-[9px] tracking-[0.18em] text-[#172126]/36">00 / 00</span>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.rail = new AutoplayRail({
            track: this.element.querySelector('#impressions-track'),
            scrubber: this.element.querySelector('#impressions-scrubber'),
            progress: this.element.querySelector('#impressions-progress'),
            positionLabel: this.element.querySelector('#impressions-position'),
            intervalMs: 7_200,
            transitionMs: 1_400
        });
        this.rail.connect();
        this.fetchData();
    }

    updateLabels() {
        if (!this.element) return;
        this.element.querySelector('[data-impressions-title]').textContent = i18n.t('impressions.title');
        this.element.querySelector('[data-impressions-eyebrow]').textContent = i18n.t('impressions.eyebrow');
        this.element.querySelector('#impressions-scrubber').setAttribute('aria-label', i18n.t('impressions.progress'));
    }

    async fetchData() {
        const container = this.element.querySelector('#impressions-track');
        try {
            const data = await loadGalleryData();
            this.items = selectRecentActivities(data, this.MAX_ITEMS).map(createActivityViewModel);
            this.renderItems();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="w-full py-32 text-center text-[#172126]/35">${i18n.t('impressions.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element?.querySelector('#impressions-track');
        if (!container) return;
        if (this.items.length === 0) {
            container.innerHTML = `<div class="w-full py-32 text-center text-[#172126]/35">${i18n.t('impressions.empty')}</div>`;
            this.rail?.refresh();
            return;
        }

        container.innerHTML = this.items.map(item => `
            <a class="rail-item impressions-slide shrink-0 w-full grid md:grid-cols-[minmax(0,1.9fr)_minmax(250px,0.65fr)] gap-7 md:gap-12 lg:gap-16 group" href="${escapeHtml(safeExternalUrl(item.artworkUrl))}" target="_blank" rel="noopener noreferrer">
                <div class="impressions-media relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#d9d7d1]">
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" draggable="false" class="impressions-image w-full h-full object-cover">
                </div>
                <div class="impressions-copy flex flex-col justify-center py-2 md:py-8 min-h-[190px] md:min-h-0">
                    <span class="font-mono text-[10px] tracking-[0.22em] text-[#172126]/38 uppercase mb-6">${item.date}</span>
                    <div>
                        <h3 class="font-art text-3xl md:text-4xl lg:text-5xl leading-[1.02] mb-8">${escapeHtml(item.title)}</h3>
                        <span aria-hidden="true" class="block w-9 h-px bg-[#172126]/45 transition-all duration-700 ease-out group-hover:w-14 group-hover:bg-[#172126]/75"></span>
                    </div>
                </div>
            </a>
        `).join('');
        this.rail?.refresh();
    }
}
