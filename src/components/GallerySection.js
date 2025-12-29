import { i18n } from '../utils/i18n.js';

export default class GallerySection {
    constructor() {
        this.galleryData = [];
        this.visibleCount = 0;
        this.BATCH_SIZE = 15;
        this.observer = null;

        window.addEventListener('languageChanged', () => {
            this.updateLabels();
        });
    }

    updateLabels() {
        if (!this.element) return;
        const title = this.element.querySelector('h2');
        const subtitle = this.element.querySelector('p.font-mono');

        if (title) title.textContent = i18n.t('gallery.title');
        if (subtitle) subtitle.textContent = i18n.t('gallery.subtitle');
        // Update lightbox link if open
        const lightboxLink = document.getElementById('lightbox-link');
        if (lightboxLink) lightboxLink.textContent = i18n.t('gallery.viewOriginal');
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-[#f8f9fa] py-24 px-4 sm:px-8 relative';

        this.element.innerHTML = `
            <div class="max-w-[1600px] mx-auto relative z-10">
                <!-- Header -->
                <div class="mb-12 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md z-30 py-4 -mx-4 px-4 md:mx-0 md:px-0 transition-all duration-300" id="gallery-header">
                    <h2 class="text-4xl md:text-5xl font-serif font-light text-primary mb-2">${i18n.t('gallery.title')}</h2>
                    <p class="text-xs font-mono text-gray-400 tracking-[0.3em] uppercase">${i18n.t('gallery.subtitle')}</p>
                </div>

                <!-- Masonry Grid -->
                <div id="gallery-grid" class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 min-h-[50vh]">
                    <!-- Items injected here -->
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
                        <a id="lightbox-link" href="#" target="_blank" class="px-6 py-2 bg-primary text-white text-xs font-bold tracking-widest uppercase hover:bg-secondary transition-colors duration-300 rounded-full">
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
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            </style>
        `;

        return this.element;
    }

    mount() {
        this.fetchData();
        this.bindEvents();
        this.setupIntersectionObserver();
    }

    async fetchData() {
        try {
            const response = await fetch('/gallery.json');
            if (!response.ok) throw new Error('Failed to load metadata');

            const data = await response.json();
            // Sort by date (newest first)
            this.galleryData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            this.renderMoreItems();
        } catch (error) {
            console.error('Error loading gallery data:', error);
            const grid = this.element.querySelector('#gallery-grid');
            if (grid) grid.innerHTML = `<p class="text-center text-gray-400 font-serif w-full col-span-full py-20">${i18n.t('gallery.failed')}</p>`;
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
        const grid = this.element.querySelector('#gallery-grid');
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

        const html = nextBatch.map((item, index) => {
            const globalIndex = this.visibleCount + index;
            // Use remote url
            const imagePath = item.url;

            return `
                <div class="gallery-item break-inside-avoid mb-6 opacity-0 transition-opacity duration-500 ease-out" 
                     data-index="${globalIndex}" 
                     style="transition-delay: ${index * 30}ms">
                     
                    <div class="relative rounded-2xl overflow-hidden group cursor-zoom-in bg-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                        <img 
                            src="${imagePath}" 
                            alt="${item.title}"
                            loading="lazy"
                            class="w-full h-auto block transform transition-transform duration-700 group-hover:scale-105"
                            onload="this.parentElement.parentElement.classList.remove('opacity-0')"
                            onerror="this.parentElement.parentElement.style.display='none'"
                        >
                        
                        <!-- Hover Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <h3 class="text-white font-serif text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">${item.title}</h3>
                            <div class="text-white/80 text-xs font-mono mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                ${item.tags.slice(0, 2).join(' / ')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.insertAdjacentHTML('beforeend', html);
        this.visibleCount += nextBatch.length;

        if (this.visibleCount >= this.galleryData.length) {
            sentinel.classList.add('opacity-0');
        }
    }

    bindEvents() {
        const lightbox = this.element.querySelector('#lightbox');
        const lightboxImg = this.element.querySelector('#lightbox-img');
        const lightboxLink = this.element.querySelector('#lightbox-link');
        const lightboxTitle = this.element.querySelector('#lightbox-title');
        const lightboxTags = this.element.querySelector('#lightbox-tags');
        const lightboxInfo = this.element.querySelector('#lightbox-info');
        const lightboxImgContainer = this.element.querySelector('#lightbox-img-container');
        const grid = this.element.querySelector('#gallery-grid');
        const closeBtn = this.element.querySelector('#lightbox-close');

        // Open Lightbox
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                // Get all current items, find index of clicked item
                const allItems = Array.from(grid.querySelectorAll('.gallery-item'));
                const clickedIndex = allItems.indexOf(item);
                const itemData = this.galleryData[clickedIndex];

                if (!itemData) return;

                const imagePath = itemData.original_url_display || itemData.url;

                lightboxImg.src = imagePath;
                lightboxTitle.textContent = itemData.title;
                lightboxTags.textContent = itemData.tags.join(' / ');
                lightboxLink.href = itemData.pixiv_url;

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
