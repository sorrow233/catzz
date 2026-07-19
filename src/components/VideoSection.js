import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { createVideoViewModel } from '../utils/videoView.mjs';
import HorizontalRail from '../utils/HorizontalRail.mjs';
import '../styles/video-rail.css';

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
        this.element.className = 'w-full py-24 md:py-36 lg:py-40 bg-[#e9edef] text-[#172126] overflow-hidden';
        this.element.innerHTML = `
            <div class="max-w-[1600px] mx-auto px-5 md:px-10">
                <div class="flex items-center justify-between gap-6 pb-10 mb-14 md:pb-12 md:mb-16 border-b border-[#172126]/10">
                    <div class="flex items-center gap-4 md:gap-5">
                        <p data-videos-eyebrow class="text-[10px] font-mono tracking-[0.3em] text-[#172126]/55 uppercase">${i18n.t('videos.eyebrow')}</p>
                        <span class="w-8 md:w-12 h-px bg-[#172126]/20"></span>
                        <h2 data-videos-title class="text-[9px] md:text-[10px] font-mono font-normal tracking-[0.3em] text-[#172126]/30 uppercase">${i18n.t('videos.title')}</h2>
                    </div>
                    <span id="videos-counter" class="font-mono text-[10px] tracking-[0.2em] text-[#172126]/38">00 / 00</span>
                </div>

                <div id="videos-rail" class="videos-rail flex gap-6 md:gap-10 lg:gap-12 overflow-x-auto scrollbar-hide">
                    <div class="loading-text w-full py-28 text-center text-[#172126]/30 font-mono text-xs tracking-wider">${i18n.t('videos.loading')}</div>
                </div>

                <div class="flex items-center gap-5 mt-14 md:mt-20">
                    <div id="videos-progress" class="videos-progress min-w-0 flex-1">
                        <span id="videos-date-label" class="videos-date-label" aria-hidden="true">--.--</span>
                        <input id="videos-scrubber" class="videos-scrubber" type="range" min="0" max="1000" value="0" step="1" aria-label="${i18n.t('videos.progress')}">
                    </div>
                    <span id="videos-edge-date" class="w-10 text-right font-mono text-[9px] tracking-[0.18em] text-[#172126]/32">--.--</span>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.rail = new HorizontalRail({
            container: this.element.querySelector('#videos-rail'),
            counter: this.element.querySelector('#videos-counter'),
            scrubber: this.element.querySelector('#videos-scrubber'),
            progress: this.element.querySelector('#videos-progress'),
            dateLabel: this.element.querySelector('#videos-date-label'),
            edgeDateLabel: this.element.querySelector('#videos-edge-date')
        });
        this.rail.connect();
        this.fetchData();
    }

    updateLabels() {
        if (!this.element) return;
        this.element.querySelector('[data-videos-title]').textContent = i18n.t('videos.title');
        this.element.querySelector('[data-videos-eyebrow]').textContent = i18n.t('videos.eyebrow');
        this.element.querySelector('#videos-scrubber').setAttribute('aria-label', i18n.t('videos.progress'));
    }

    async fetchData() {
        const container = this.element.querySelector('#videos-rail');
        try {
            const response = await fetch('/videos.json');
            if (!response.ok) throw new Error('Failed to load video works');
            const data = await response.json();
            this.items = data.map(createVideoViewModel);
            this.renderItems();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="w-full py-28 text-center text-[#172126]/35">${i18n.t('videos.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element?.querySelector('#videos-rail');
        if (!container) return;
        if (this.items.length === 0) {
            container.innerHTML = `<div class="w-full py-28 text-center text-[#172126]/35">${i18n.t('videos.empty')}</div>`;
            this.rail?.refresh();
            return;
        }

        container.innerHTML = this.items.map((item, index) => `
            <a class="rail-item snap-start shrink-0 w-[82vw] sm:w-[52vw] lg:w-[32vw] max-w-[520px] group" data-month="${escapeHtml(item.month)}" href="${escapeHtml(safeExternalUrl(item.videoUrl))}" target="_blank" rel="noopener noreferrer">
                <div class="relative aspect-video overflow-hidden bg-[#d8dee1] mb-5">
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover opacity-90 transition-all duration-[1000ms] group-hover:opacity-100 group-hover:scale-[1.02]">
                    <div class="absolute inset-0 bg-[#172126]/8"></div>
                    <span class="absolute bottom-4 right-4 px-2 py-1 bg-[#172126]/70 text-[9px] font-mono tracking-[0.12em] text-white/85">${escapeHtml(item.duration)}</span>
                    <span class="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white/80 text-[#172126] backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-105">
                        <svg class="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </span>
                </div>
                <div class="border-t border-[#172126]/12 pt-4">
                    <div class="flex justify-between gap-5 mb-3 font-mono text-[9px] tracking-[0.16em] text-[#172126]/35">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        <span>${item.date}</span>
                    </div>
                    <h3 class="font-serif text-xl md:text-2xl leading-snug line-clamp-2 min-h-[3.2em] text-[#172126]/90">${escapeHtml(item.title)}</h3>
                </div>
            </a>
        `).join('');
        this.rail?.refresh();
    }
}
