import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { selectRecentActivities } from '../utils/activity.mjs';
import { createActivityViewModel } from '../utils/activityView.mjs';
import AutoplayRail from '../utils/AutoplayRail.mjs';

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
                <div class="flex items-center gap-4 md:gap-5 mb-8 md:mb-10">
                    <p data-impressions-eyebrow class="text-[10px] font-mono tracking-[0.3em] text-[#172126]/55 uppercase">${i18n.t('impressions.eyebrow')}</p>
                    <span class="w-8 md:w-12 h-px bg-[#172126]/20"></span>
                    <h2 data-impressions-title class="text-[9px] md:text-[10px] font-mono font-normal tracking-[0.3em] text-[#172126]/30 uppercase">${i18n.t('impressions.title')}</h2>
                </div>

                <div id="impressions-rail" aria-roledescription="carousel" class="flex overflow-hidden touch-pan-y">
                    <div class="loading-text w-full py-32 text-center text-[#172126]/30 font-mono text-xs tracking-wider">${i18n.t('impressions.loading')}</div>
                </div>

                <div class="h-px bg-[#172126]/12 mt-7 overflow-hidden">
                    <div id="impressions-progress" class="h-full bg-[#172126]/65 origin-left scale-x-0"></div>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.rail = new AutoplayRail({
            container: this.element.querySelector('#impressions-rail'),
            progress: this.element.querySelector('#impressions-progress'),
            intervalMs: 6_500
        });
        this.rail.connect();
        this.fetchData();
    }

    updateLabels() {
        if (!this.element) return;
        this.element.querySelector('[data-impressions-title]').textContent = i18n.t('impressions.title');
        this.element.querySelector('[data-impressions-eyebrow]').textContent = i18n.t('impressions.eyebrow');
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
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" draggable="false" class="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]">
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
