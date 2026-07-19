import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { selectVideoActivities } from '../utils/activity.mjs';
import { createActivityViewModel } from '../utils/activityView.mjs';
import HorizontalRail from '../utils/HorizontalRail.mjs';

export default class VideoSection {
    constructor() {
        this.items = [];
        this.rail = null;
        window.addEventListener('languageChanged', () => {
            this.updateLabels();
            this.renderItems();
        });
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full py-24 md:py-32 bg-[#111619] text-white overflow-hidden';
        this.element.innerHTML = `
            <div class="max-w-[1600px] mx-auto px-5 md:px-10">
                <div class="flex items-end justify-between gap-6 mb-12 md:mb-16">
                    <div>
                        <p data-videos-eyebrow class="text-[10px] md:text-xs font-mono tracking-[0.32em] text-white/38 uppercase mb-4">${i18n.t('videos.eyebrow')}</p>
                        <h2 data-videos-title class="font-art text-5xl md:text-7xl lg:text-8xl font-normal leading-none tracking-[0.025em]">${i18n.t('videos.title')}</h2>
                    </div>
                    <div class="flex items-center gap-3 md:gap-5">
                        <span id="videos-counter" class="hidden sm:block font-mono text-xs tracking-[0.2em] text-white/40">00 / 00</span>
                        <button id="videos-previous" aria-label="${i18n.t('videos.previous')}" class="p-3 md:p-4 rounded-full border border-white/18 hover:bg-white hover:text-[#111619] transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <button id="videos-next" aria-label="${i18n.t('videos.next')}" class="p-3 md:p-4 rounded-full border border-white/18 hover:bg-white hover:text-[#111619] transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>

                <div id="videos-rail" class="flex gap-6 md:gap-9 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 md:-mx-10 px-5 md:px-10">
                    <div class="loading-text w-full py-28 text-center text-white/30 font-mono text-xs tracking-wider">${i18n.t('videos.loading')}</div>
                </div>

                <div class="flex items-center gap-5 mt-10">
                    <div class="h-px bg-white/14 flex-1 overflow-hidden">
                        <div id="videos-progress" class="h-full bg-white origin-left scale-x-0 transition-transform duration-500"></div>
                    </div>
                    <span data-videos-drag class="font-mono text-[10px] tracking-[0.28em] text-white/32 uppercase">${i18n.t('videos.drag')}</span>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.rail = new HorizontalRail({
            container: this.element.querySelector('#videos-rail'),
            previousButton: this.element.querySelector('#videos-previous'),
            nextButton: this.element.querySelector('#videos-next'),
            counter: this.element.querySelector('#videos-counter'),
            progress: this.element.querySelector('#videos-progress')
        });
        this.rail.connect();
        this.fetchData();
    }

    updateLabels() {
        if (!this.element) return;
        this.element.querySelector('[data-videos-title]').textContent = i18n.t('videos.title');
        this.element.querySelector('[data-videos-eyebrow]').textContent = i18n.t('videos.eyebrow');
        this.element.querySelector('[data-videos-drag]').textContent = i18n.t('videos.drag');
        this.element.querySelector('#videos-previous').setAttribute('aria-label', i18n.t('videos.previous'));
        this.element.querySelector('#videos-next').setAttribute('aria-label', i18n.t('videos.next'));
    }

    async fetchData() {
        const container = this.element.querySelector('#videos-rail');
        try {
            const response = await fetch('/gallery.json');
            if (!response.ok) throw new Error('Failed to load video works');
            const data = await response.json();
            this.items = selectVideoActivities(data).map(createActivityViewModel);
            this.renderItems();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="w-full py-28 text-center text-white/35">${i18n.t('videos.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element?.querySelector('#videos-rail');
        if (!container) return;
        if (this.items.length === 0) {
            container.innerHTML = `<div class="w-full py-28 text-center text-white/35">${i18n.t('videos.empty')}</div>`;
            this.rail?.refresh();
            return;
        }

        container.innerHTML = this.items.map((item, index) => `
            <a class="rail-item snap-center shrink-0 w-[84vw] sm:w-[62vw] lg:w-[46vw] max-w-[760px] group" href="${escapeHtml(safeExternalUrl(item.videoUrl))}" target="_blank" rel="noopener noreferrer">
                <div class="relative aspect-video overflow-hidden bg-white/5 mb-6">
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover opacity-80 transition-all duration-[1200ms] group-hover:opacity-100 group-hover:scale-[1.025]">
                    <div class="absolute inset-0 bg-black/12"></div>
                    <span class="absolute top-5 left-5 px-3 py-1.5 border border-white/25 bg-black/20 backdrop-blur-sm text-[9px] font-mono tracking-[0.24em] text-white/75">${item.platform}</span>
                    <span class="absolute inset-0 m-auto w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/55 bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white group-hover:text-[#111619]">
                        <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </span>
                </div>
                <div class="flex gap-5 md:gap-8 items-start border-t border-white/14 pt-5">
                    <span class="font-mono text-[10px] tracking-[0.2em] text-white/32 pt-1">${String(index + 1).padStart(2, '0')}</span>
                    <div class="min-w-0 flex-1">
                        <div class="flex justify-between gap-5 mb-3">
                            <h3 class="font-art text-2xl md:text-3xl leading-tight">${escapeHtml(item.title)}</h3>
                            <span class="shrink-0 font-mono text-[10px] tracking-[0.15em] text-white/35 pt-2">${item.date}</span>
                        </div>
                        <p class="text-sm text-white/45 leading-relaxed line-clamp-2">${escapeHtml(item.description)}</p>
                    </div>
                </div>
            </a>
        `).join('');
        this.rail?.refresh();
    }
}
