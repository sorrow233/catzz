import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import { extractVideoUrl, selectRecentActivities } from '../utils/activity.mjs';

export default class TimelineSection {
    constructor() {
        this.timelineData = [];
        this.MAX_ITEMS = 12;
        window.addEventListener('languageChanged', () => {
            this.updateLabels();
            this.renderItems();
        });
    }

    updateLabels() {
        if (!this.element) return;
        const title = this.element.querySelector('h2');
        const loading = this.element.querySelector('.loading-text');
        if (title) title.textContent = i18n.t('timeline.title');
        if (loading) loading.textContent = i18n.t('timeline.loading');
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full py-20 bg-gradient-to-b from-[#f9f9f9] to-white relative overflow-hidden';

        this.element.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div class="mb-12 flex items-end justify-between px-2">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-serif font-light text-primary mb-2">${i18n.t('timeline.title')}</h2>
                        <div class="w-16 h-0.5 bg-primary/20"></div>
                    </div>
                    
                    <!-- Navigation Buttons -->
                    <div class="hidden md:flex gap-2">
                        <button id="scroll-left" class="p-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 text-primary disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button id="scroll-right" class="p-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 text-primary disabled:opacity-30 disabled:cursor-not-allowed">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- Scroll Container -->
                <div id="timeline-scroll-container" class="flex gap-6 overflow-x-auto pb-12 pt-4 px-2 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
                    <!-- Loading State -->
                    <div class="loading-text w-full text-center text-gray-300 font-mono text-sm tracking-wider py-20">${i18n.t('timeline.loading')}</div>
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

        // Setup scroll buttons
        setTimeout(() => {
            const container = this.element.querySelector('#timeline-scroll-container');
            const leftBtn = this.element.querySelector('#scroll-left');
            const rightBtn = this.element.querySelector('#scroll-right');

            if (leftBtn && rightBtn && container) {
                leftBtn.addEventListener('click', () => {
                    container.scrollBy({ left: -400, behavior: 'smooth' });
                });
                rightBtn.addEventListener('click', () => {
                    container.scrollBy({ left: 400, behavior: 'smooth' });
                });
            }
        }, 0);

        return this.element;
    }

    mount() {
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
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');

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
            if (container) container.innerHTML = `<div class="text-center text-gray-400 w-full">${i18n.t('timeline.failed')}</div>`;
        }
    }

    renderItems() {
        const container = this.element.querySelector('#timeline-scroll-container');
        if (!container) return;

        // If no videos found, clear list
        if (this.timelineData.length === 0) {
            container.innerHTML = `<div class="text-center text-gray-400 w-full">${i18n.t('timeline.empty')}</div>`;
            return;
        }

        container.innerHTML = this.timelineData.map(item => `
            <a class="snap-start shrink-0 w-[85vw] md:w-[400px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col h-full" href="${escapeHtml(safeExternalUrl(item.url))}" target="_blank" rel="noopener noreferrer">
                <!-- Thumbnail -->
                <div class="relative h-48 md:h-56 overflow-hidden">
                    <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">
                    
                    <!-- Play Icon Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="${item.isVideo ? 'M8 5v14l11-7z' : 'M4 5h16v14H4z M6 16l4-5 3 3 2-2 3 4z'}"/></svg>
                        </div>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-baseline gap-3 mb-2">
                         <span class="text-xs font-bold text-secondary font-mono bg-secondary/5 px-2 py-1 rounded-md">${item.date}</span>
                    </div>
                    
                    <h3 class="text-lg font-serif text-[#2c3e50] group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-2">${escapeHtml(item.title)}</h3>
                    
                    <p class="text-sm text-gray-500 font-light leading-relaxed line-clamp-3 mb-4 flex-grow">
                        ${escapeHtml(item.desc)}
                    </p>
                    
                    <div class="pt-4 border-t border-gray-50 flex items-center text-xs font-medium text-gray-400 group-hover:text-secondary transition-colors duration-300 uppercase tracking-widest mt-auto">
                        <span>${i18n.t(item.isVideo ? 'timeline.watchVideo' : 'timeline.viewArtwork')}</span>
                        <svg class="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                </div>
            </a>
        `).join('');
    }
}
