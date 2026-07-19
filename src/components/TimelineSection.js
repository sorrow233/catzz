import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { extractVideoUrl, selectRecentActivities } from '../utils/activity.mjs';
import HorizontalRail from '../utils/HorizontalRail.mjs';

export default class TimelineSection {
    constructor() {
        this.timelineData = [];
        this.MAX_ITEMS = 12;
        this.rail = null;
        window.addEventListener('languageChanged', () => {
            this.updateLabels();
            this.renderItems();
        });
    }

    updateLabels() {
        if (!this.element) return;
        const title = this.element.querySelector('h2');
        const loading = this.element.querySelector('.loading-text');
        const eyebrow = this.element.querySelector('.timeline-eyebrow');
        const drag = this.element.querySelector('.timeline-drag');
        const previous = this.element.querySelector('#scroll-left');
        const next = this.element.querySelector('#scroll-right');
        if (title) title.textContent = i18n.t('timeline.title');
        if (loading) loading.textContent = i18n.t('timeline.loading');
        if (eyebrow) eyebrow.textContent = i18n.t('timeline.eyebrow');
        if (drag) drag.textContent = i18n.t('timeline.drag');
        if (previous) previous.setAttribute('aria-label', i18n.t('timeline.previous'));
        if (next) next.setAttribute('aria-label', i18n.t('timeline.next'));
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full py-24 md:py-32 bg-[#10171b] text-white relative overflow-hidden';

        this.element.innerHTML = `
            <div class="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[#2b5362]/20 blur-3xl pointer-events-none"></div>
            <div class="max-w-[1600px] mx-auto px-5 md:px-10 relative z-10">
                <div class="mb-12 md:mb-16 flex items-end justify-between gap-8">
                    <div>
                        <p class="timeline-eyebrow text-[10px] md:text-xs font-mono tracking-[0.35em] text-white/40 uppercase mb-4">${i18n.t('timeline.eyebrow')}</p>
                        <h2 class="font-art text-5xl md:text-7xl lg:text-8xl font-normal tracking-[0.04em] leading-none">${i18n.t('timeline.title')}</h2>
                    </div>

                    <div class="flex items-center gap-3 md:gap-5">
                        <span id="timeline-counter" class="hidden sm:block font-mono text-xs tracking-[0.2em] text-white/45">00 / 00</span>
                        <button id="scroll-left" aria-label="${i18n.t('timeline.previous')}" class="p-3 md:p-4 rounded-full border border-white/20 hover:bg-white hover:text-[#10171b] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button id="scroll-right" aria-label="${i18n.t('timeline.next')}" class="p-3 md:p-4 rounded-full border border-white/20 hover:bg-white hover:text-[#10171b] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <div id="timeline-scroll-container" class="flex gap-5 md:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 md:-mx-10 px-5 md:px-10 pb-8">
                    <div class="loading-text w-full text-center text-white/30 font-mono text-sm tracking-wider py-32">${i18n.t('timeline.loading')}</div>
                </div>

                <div class="flex items-center gap-5 mt-2">
                    <div class="h-px bg-white/15 flex-1 overflow-hidden">
                        <div id="timeline-progress" class="h-full bg-white origin-left scale-x-0 transition-transform duration-500"></div>
                    </div>
                    <span class="timeline-drag font-mono text-[10px] tracking-[0.3em] text-white/35 uppercase">${i18n.t('timeline.drag')}</span>
                </div>
            </div>
            
            <style>
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            </style>
        `;

        return this.element;
    }

    mount() {
        this.rail = new HorizontalRail({
            container: this.element.querySelector('#timeline-scroll-container'),
            previousButton: this.element.querySelector('#scroll-left'),
            nextButton: this.element.querySelector('#scroll-right'),
            counter: this.element.querySelector('#timeline-counter'),
            progress: this.element.querySelector('#timeline-progress')
        });
        this.rail.connect();
        this.fetchData();
    }

    async fetchData() {
        try {
            const response = await fetch('/gallery.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();

            this.timelineData = selectRecentActivities(data, this.MAX_ITEMS).map(item => {
                const videoUrl = extractVideoUrl(item.description);
                // Decode HTML entities in description for clean text
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description || '';
                const cleanDesc = (tempDiv.textContent || tempDiv.innerText || '')
                    .replace(/https?:\/\/\S+/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                const usefulDescription = /^~*$/.test(cleanDesc)
                    ? (item.tags || []).slice(0, 4).join(' · ')
                    : cleanDesc;

                const dateObj = new Date(item.created_at);
                const year = dateObj.getUTCFullYear();
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getUTCDate()).padStart(2, '0');

                return {
                    id: item.id,
                    title: item.title,
                    date: `${year}.${month}.${day}`,
                    thumbnail: item.url,
                    url: videoUrl || item.pixiv_url,
                    isVideo: Boolean(videoUrl),
                    desc: usefulDescription.slice(0, 100) + (usefulDescription.length > 100 ? '...' : '')
                };
            });

            this.renderItems();
        } catch (e) {
            console.error(e);
            const container = this.element.querySelector('#timeline-scroll-container');
            if (container) container.innerHTML = `<div class="text-center text-white/40 w-full py-32">${i18n.t('timeline.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element.querySelector('#timeline-scroll-container');
        if (!container) return;

        if (this.timelineData.length === 0) {
            container.innerHTML = `<div class="text-center text-white/40 w-full py-32">${i18n.t('timeline.empty')}</div>`;
            return;
        }

        container.innerHTML = this.timelineData.map((item, index) => `
            <a class="timeline-item snap-center shrink-0 relative w-[88vw] sm:w-[76vw] lg:w-[64vw] max-w-[1080px] aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group bg-[#1b2429]" href="${escapeHtml(safeExternalUrl(item.url))}" target="_blank" rel="noopener noreferrer">
                <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/30"></div>
                <div class="absolute inset-0 p-6 md:p-10 lg:p-12 flex flex-col justify-between">
                    <div class="flex items-center justify-between font-mono text-[10px] md:text-xs tracking-[0.22em] text-white/65 uppercase">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        <span>${item.date}</span>
                    </div>
                    <div class="max-w-3xl">
                        <p class="text-[10px] md:text-xs font-mono tracking-[0.25em] text-white/55 uppercase mb-4">${i18n.t(item.isVideo ? 'timeline.watchVideo' : 'timeline.viewArtwork')}</p>
                        <h3 class="font-art text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[0.98] tracking-[0.01em] mb-4 md:mb-6">${escapeHtml(item.title)}</h3>
                        <div class="flex items-end justify-between gap-6">
                            <p class="hidden sm:block text-sm md:text-base text-white/65 font-light leading-relaxed max-w-2xl line-clamp-2">${escapeHtml(item.desc)}</p>
                            <span class="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/35 flex items-center justify-center group-hover:bg-white group-hover:text-[#10171b] transition-all duration-300">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14m-5-5 5 5-5 5"/></svg>
                            </span>
                        </div>
                    </div>
                </div>
            </a>
        `).join('');
        this.rail?.refresh();
    }
}
