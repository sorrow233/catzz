import { i18n } from '../utils/i18n.js';
import { escapeHtml, safeExternalUrl } from '../utils/html.js';
import GalleryYearManager, { getArtworkYear } from '../utils/GalleryYearManager.mjs';
import GalleryYearRail from '../utils/GalleryYearRail.mjs';
import YearJumpController from '../utils/YearJumpController.mjs';
import { getArtworkLayout } from '../utils/artworkLayout.mjs';
import { loadGalleryData } from '../utils/contentData.mjs';
import '../styles/gallery-year-rail.css';

export default class GallerySection {
    constructor() {
        this.galleryData = [];
        this.visibleCount = 0;
        this.BATCH_SIZE = 15;
        this.observer = null;
        this.yearManager = null;
        this.yearRail = null;
        this.yearJump = null;
        this.yearStats = new Map();

        window.addEventListener('languageChanged', () => {
            this.updateLabels();
        });
    }

    /**
     * Generates an optimized image URL using wsrv.nl
     * @param {string} url - Original image URL
     * @param {number} width - Target width
     * @returns {string} Optimized URL
     */
    getOptimizedUrl(url, width = 800) {
        if (!url) return '';
        if (url.startsWith('/')) return url;
        // Remove https:// for the proxy path if needed, but wsrv supports full URLs usually.
        // wsrv.nl syntax: https://wsrv.nl/?url=...&w=...&output=webp
        const encodedUrl = encodeURIComponent(url);
        // Bump quality to 85 for better thumbnails
        return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&q=85&output=webp`;
    }

    updateLabels() {
        if (!this.element) return;
        const title = this.element.querySelector('#gallery-title');
        const subtitle = this.element.querySelector('#gallery-subtitle');

        if (title) title.textContent = i18n.t('gallery.title');
        if (subtitle) subtitle.textContent = i18n.t('gallery.subtitle');
        this.yearManager?.updateLabels(stats => this.formatStats(stats));
        this.updateTotalStats();
        // Update lightbox link if open
        const lightboxLink = document.getElementById('lightbox-link');
        if (lightboxLink) lightboxLink.textContent = i18n.t('gallery.viewOriginal');
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-[#f8f9fa] py-24 px-4 sm:px-8 xl:pl-28 xl:pr-8 relative';

        this.element.innerHTML = `
            <nav id="gallery-year-rail" aria-label="Artwork years" class="year-rail hidden xl:flex fixed left-7 top-1/2 -translate-y-1/2 z-40 flex-col opacity-0 pointer-events-none"></nav>

            <div class="max-w-[1600px] mx-auto relative z-10">
                <!-- Header -->
                <div class="mb-12 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md z-30 py-4 -mx-4 px-4 md:mx-0 md:px-0 transition-all duration-300" id="gallery-header">
                    <h2 id="gallery-title" class="font-art text-5xl md:text-7xl font-normal text-primary mb-3 tracking-[0.04em]">${i18n.t('gallery.title')}</h2>
                    <p class="text-[10px] md:text-xs font-mono text-gray-400 tracking-[0.25em] uppercase flex flex-wrap gap-x-5 gap-y-1">
                        <span id="gallery-subtitle">${i18n.t('gallery.subtitle')}</span>
                        <span id="gallery-total" class="text-primary/45"></span>
                    </p>
                </div>

                <!-- Year-grouped Masonry Grids -->
                <div id="gallery-years" class="min-h-[50vh]">
                    <!-- Year sections injected here -->
                </div>

                <!-- Loading Sentinel -->
                <div id="gallery-sentinel" class="w-full h-20 flex justify-center items-center mt-12 opacity-0 transition-opacity duration-300">
                    <div class="flex gap-1">
                        <div class="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                        <div class="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
            
            <!-- Lightbox Modal -->
            <div id="lightbox" class="fixed inset-0 bg-white/95 backdrop-blur-xl hidden z-[100] transition-opacity duration-300 opacity-0">
                <div class="absolute inset-0 flex flex-col justify-center items-center p-4 md:p-8">
                    <!-- Image Container -->
                    <div class="relative max-w-full max-h-[85vh] shadow-2xl rounded-sm overflow-hidden transform scale-95 transition-transform duration-500" id="lightbox-img-container">
                        <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[85vh] object-contain block">
                    </div>

                    <!-- Info Bar -->
                    <div class="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 transform translate-y-full transition-transform duration-300 flex justify-between items-center" id="lightbox-info">
                        <div>
                            <h3 id="lightbox-title" class="text-xl font-serif text-primary mb-1"></h3>
                            <p id="lightbox-tags" class="text-xs font-mono text-gray-500 uppercase tracking-wider"></p>
                        </div>
                        <a id="lightbox-link" href="#" target="_blank" rel="noopener noreferrer" class="px-6 py-2 bg-primary text-white text-xs font-bold tracking-widest uppercase hover:bg-secondary transition-colors duration-300 rounded-full">
                            ${i18n.t('gallery.viewOriginal')}
                        </a>
                    </div>

                    <!-- Close Button -->
                    <button id="lightbox-close" class="absolute top-6 right-6 p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-primary z-50">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <style>
                .gallery-masonry {
                    display: grid;
                    grid-auto-rows: 8px;
                    column-gap: 1.5rem;
                    row-gap: 1.5rem;
                    align-items: start;
                }
                @media (min-width: 768px) {
                    .gallery-item--wide { grid-column: span 2; }
                }
                .gallery-year-section + .gallery-year-section { margin-top: 5rem; }
                .gallery-year-section { scroll-margin-top: 8.5rem; }
            </style>
        `;

        return this.element;
    }

    mount() {
        this.yearManager = new GalleryYearManager(
            this.element.querySelector('#gallery-years'),
            stats => this.formatStats(stats)
        );
        this.yearRail = new GalleryYearRail({
            container: this.element.querySelector('#gallery-year-rail'),
            galleryElement: this.element,
            onSelect: year => this.jumpToYear(year)
        });
        this.yearRail.connect();
        this.yearJump = new YearJumpController({
            layoutRoot: this.element.querySelector('#gallery-years'),
            stickyHeader: this.element.querySelector('#gallery-header')
        });
        this.fetchData();
        this.bindEvents();
        this.setupIntersectionObserver();
    }

    async fetchData() {
        try {
            const data = await loadGalleryData();
            // Sort by date (newest first)
            this.galleryData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.yearStats = this.galleryData.reduce((statsByYear, item) => {
                const year = getArtworkYear(item.created_at);
                if (year === null) return statsByYear;
                if (!statsByYear.has(year)) statsByYear.set(year, { images: 0, postIds: new Set() });
                const stats = statsByYear.get(year);
                stats.images += 1;
                stats.postIds.add(item.id);
                return statsByYear;
            }, new Map());
            this.yearRail.setYears([...this.yearStats.keys()]);
            this.updateTotalStats();

            this.renderMoreItems();
        } catch (error) {
            console.error('Error loading gallery data:', error);
            const years = this.element.querySelector('#gallery-years');
            if (years) years.innerHTML = `<p class="text-center text-gray-400 font-serif w-full py-20">${i18n.t('gallery.failed')}</p>`;
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.renderMoreItems();
                }
            });
        }, options);

        const sentinel = this.element.querySelector('#gallery-sentinel');
        if (sentinel) this.observer.observe(sentinel);
    }

    renderMoreItems() {
        const sentinel = this.element.querySelector('#gallery-sentinel');

        if (this.visibleCount >= this.galleryData.length) {
            sentinel.classList.add('hidden'); // Hide loader if all done
            return;
        } else {
            sentinel.classList.remove('hidden');
        }

        // Show loader animation
        sentinel.classList.remove('opacity-0');

        const nextBatch = this.galleryData.slice(this.visibleCount, this.visibleCount + this.BATCH_SIZE);

        // Small delay to simulate loading or just ensure smoothness
        // Actually direct render is better for perf, animation handles visual smoothness

        const itemsByYear = new Map();
        nextBatch.forEach((item, index) => {
            const globalIndex = this.visibleCount + index;
            const year = getArtworkYear(item.created_at);
            if (year === null) return;
            if (!itemsByYear.has(year)) itemsByYear.set(year, []);
            itemsByYear.get(year).push(this.renderGalleryItem(item, globalIndex, index));
        });

        for (const [year, itemHtml] of itemsByYear) {
            const stats = this.yearStats.get(year) || { images: itemHtml.length, postIds: new Set() };
            this.yearManager.append(year, stats, itemHtml.join(''));
            this.yearRail.registerSection(year, this.yearManager.getSection(year));
        }

        this.visibleCount += nextBatch.length;

        if (this.visibleCount >= this.galleryData.length) {
            sentinel.classList.add('opacity-0');
        }
    }

    jumpToYear(year) {
        while (!this.yearManager.getSection(year) && this.visibleCount < this.galleryData.length) {
            this.renderMoreItems();
        }

        const section = this.yearManager.getSection(year);
        if (!section) return;
        this.yearJump.jumpTo(section);
    }

    renderGalleryItem(item, globalIndex, batchIndex) {
        const originalUrl = String(item.url || '');
        const loadingAttribute = globalIndex < 4 ? 'eager' : 'lazy';
        const imageWidth = Number(item.width) > 0 ? Number(item.width) : 600;
        const imageHeight = Number(item.height) > 0 ? Number(item.height) : 400;
        const layout = getArtworkLayout(imageWidth, imageHeight);
        const imagePath = this.getOptimizedUrl(originalUrl, layout === 'wide' ? 1200 : 600);

        const pageBadge = Number(item.page_count) > 1
            ? `<span class="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-mono tracking-wider text-white/85">P ${String((Number(item.page_index) || 0) + 1).padStart(2, '0')} / ${String(item.page_count).padStart(2, '0')}</span>`
            : '';

        return `
                <div class="gallery-item ${layout === 'wide' ? 'gallery-item--wide' : ''} opacity-0 transition-opacity duration-500 ease-out"
                     data-index="${globalIndex}"
                     data-layout="${layout}"
                     style="transition-delay: ${batchIndex * 30}ms">
                     
                    <div class="relative rounded-2xl overflow-hidden group cursor-zoom-in bg-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                        ${pageBadge}
                        <img 
                            src="${escapeHtml(imagePath)}"
                            data-original="${escapeHtml(originalUrl)}"
                            alt="${escapeHtml(item.title)}"
                            loading="${loadingAttribute}"
                            decoding="async"
                            width="${imageWidth}"
                            height="${imageHeight}"
                            class="w-full h-auto block transform transition-transform duration-700 group-hover:scale-105 bg-gray-200"
                        >
                        
                        <!-- Hover Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <h3 class="text-white font-serif text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">${escapeHtml(item.title)}</h3>
                            <div class="text-white/80 text-xs font-mono mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                ${escapeHtml((item.tags || []).slice(0, 2).join(' / '))}
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    formatStats(stats) {
        return `${stats?.images || 0} ${i18n.t('gallery.images')}`;
    }

    updateTotalStats() {
        const total = this.element?.querySelector('#gallery-total');
        if (!total || this.galleryData.length === 0) return;
        total.textContent = this.formatStats({
            images: this.galleryData.length,
            postIds: new Set(this.galleryData.map(item => item.id))
        });
    }

    bindEvents() {
        const lightbox = this.element.querySelector('#lightbox');
        const lightboxImg = this.element.querySelector('#lightbox-img');
        const lightboxLink = this.element.querySelector('#lightbox-link');
        const lightboxTitle = this.element.querySelector('#lightbox-title');
        const lightboxTags = this.element.querySelector('#lightbox-tags');
        const lightboxInfo = this.element.querySelector('#lightbox-info');
        const lightboxImgContainer = this.element.querySelector('#lightbox-img-container');
        const grid = this.element.querySelector('#gallery-years');
        const closeBtn = this.element.querySelector('#lightbox-close');

        // Open Lightbox
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const clickedIndex = Number(item.dataset.index);
                const itemData = this.galleryData[clickedIndex];

                if (!itemData) return;



                // For lightbox, use higher quality but still optimized if possible, or original if preferred.
                // Let's use a large optimized version for speed, e.g. 1600px width.
                // Or use the original if the user really wants the raw file.
                // Given the goal is performance, let's try a high-quality WebP first.
                // const imagePath = itemData.original_url_display || itemData.url;
                const originalUrl = itemData.url;
                const imagePath = originalUrl; // Use direct URL, no proxy for max quality

                lightboxImg.src = imagePath;
                lightboxTitle.textContent = itemData.title;
                lightboxTags.textContent = (itemData.tags || []).join(' / ');
                lightboxLink.href = safeExternalUrl(itemData.pixiv_url);

                lightbox.classList.remove('hidden');
                document.body.style.overflow = 'hidden';

                // Intro Animation
                requestAnimationFrame(() => {
                    lightbox.classList.remove('opacity-0');
                    lightboxImgContainer.classList.remove('scale-95');
                    lightboxInfo.classList.remove('translate-y-full');
                });
            }
        });

        // Close functions
        const closeLightbox = () => {
            lightbox.classList.add('opacity-0');
            lightboxImgContainer.classList.add('scale-95');
            lightboxInfo.classList.add('translate-y-full');
            document.body.style.overflow = '';

            setTimeout(() => {
                lightbox.classList.add('hidden');
                lightboxImg.src = '';
            }, 300);
        };

        closeBtn.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
        });
    }
}
