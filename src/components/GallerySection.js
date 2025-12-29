import { i18n } from '../utils/i18n.js';

export default class GallerySection {
    constructor() {
        this.galleryData = [];
        this.visibleCount = 0;
        this.BATCH_SIZE = 20;
        window.addEventListener('languageChanged', () => {
            this.updateLabels();
            this.renderVisibleItems(); // Re-render current batch to update static text if needed
        });
    }

    updateLabels() {
        if (!this.element) return;
        const title = this.element.querySelector('h2');
        const subtitle = this.element.querySelector('p.font-mono');
        const loadMoreBtn = this.element.querySelector('#load-more-btn');
        const allLoadedText = this.element.querySelector('#all-loaded-text');
        const viewOriginal = this.element.querySelector('#lightbox-link');

        if (title) title.textContent = i18n.t('gallery.title');
        if (subtitle) subtitle.textContent = i18n.t('gallery.subtitle');
        if (loadMoreBtn) loadMoreBtn.textContent = i18n.t('gallery.loadMore');
        if (allLoadedText) allLoadedText.textContent = i18n.t('gallery.allLoaded');
        if (viewOriginal) viewOriginal.textContent = i18n.t('gallery.viewOriginal');
    }

    renderVisibleItems() {
        // This is a bit complex as we have masonry. 
        // For simplicity, let's just update the specific text elements in the grid if needed.
        // Actually, titles are NOT translated, so the only thing that might change in items is the "original_url_display" or labels.
        // But the prompt says "Gallery names original", which I interpreted as item titles.
        // Let's just update the static labels for now.
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-[#f9f9f9] py-24 px-4 sm:px-8 flex flex-col items-center relative';

        // Magazine-style Decorations
        this.element.innerHTML = `
            <!-- Background Grids/Lines -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style="background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 40px 40px;">
            </div>
            
            <div class="w-full max-w-[1400px] relative z-10">
                <!-- Section Header -->
                <div class="mb-16 pl-2 md:pl-4 border-l-2 border-primary/20">
                    <h2 class="text-3xl md:text-4xl font-serif font-light tracking-widest text-primary mb-2">${i18n.t('gallery.title')}</h2>
                    <p class="text-xs md:text-sm font-mono text-gray-400 tracking-[0.2em] uppercase">${i18n.t('gallery.subtitle')}</p>
                </div>

                <!-- Masonry Grid -->
                <div id="gallery-grid" class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                </div>

                <!-- Load More Button -->
                <div id="load-more-container" class="mt-20 text-center hidden">
                    <button id="load-more-btn" class="px-8 py-3 bg-white border border-gray-200 hover:border-black text-gray-500 hover:text-black font-serif tracking-widest text-sm transition-all duration-300 uppercase">
                        ${i18n.t('gallery.loadMore')}
                    </button>
                    <p class="mt-2 text-[10px] text-gray-400 font-mono tracking-widest hidden" id="all-loaded-text">${i18n.t('gallery.allLoaded')}</p>
                </div>
            </div>
            
            <!-- Lightbox Modal -->
            <div id="lightbox" class="fixed inset-0 bg-[#f9f9f9]/95 hidden z-[100] flex justify-center items-center opacity-0 transition-opacity duration-500 cursor-zoom-out">
                <div class="relative w-full h-full flex flex-col justify-center items-center p-4 md:p-10" id="lightbox-content">
                    <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[80vh] object-contain shadow-2xl transition-transform duration-500 scale-95">
                    
                    <div class="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                        <h3 id="lightbox-title" class="text-xl md:text-2xl font-serif text-primary tracking-widest mb-2"></h3>
                        <p id="lightbox-desc" class="text-xs font-mono text-gray-500 tracking-wider bg-white/50 inline-block px-2 py-1 rounded"></p>
                        <a id="lightbox-link" href="#" target="_blank" class="pointer-events-auto mt-4 inline-block text-xs uppercase tracking-[0.2em] text-primary border-b border-primary hover:opacity-50 transition-opacity pb-0.5">${i18n.t('gallery.viewOriginal')}</a>
                    </div>

                    <!-- Close Button -->
                    <button class="absolute top-8 right-8 text-primary hover:opacity-50 transition-opacity p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        return this.element;
    }

    mount() {
        this.fetchData();
        this.bindEvents();
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
            grid.innerHTML = `<p class="text-center text-gray-400 font-serif border border-gray-200 p-8">${i18n.t('gallery.failed')}</p>`;
        }
    }

    renderMoreItems() {
        const grid = this.element.querySelector('#gallery-grid');
        const loadMoreContainer = this.element.querySelector('#load-more-container');
        const loadMoreBtn = this.element.querySelector('#load-more-btn');
        const allLoadedText = this.element.querySelector('#all-loaded-text');

        const nextBatch = this.galleryData.slice(this.visibleCount, this.visibleCount + this.BATCH_SIZE);

        if (nextBatch.length === 0) {
            loadMoreBtn.classList.add('hidden');
            allLoadedText.classList.remove('hidden');
            return;
        }

        const html = nextBatch.map((item, index) => {
            const globalIndex = this.visibleCount + index;
            // Use remote url (ignore local thumbnail_url as it may not exist on server)
            const imagePath = item.url;
            const date = new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '.');

            return `
                <div class="gallery-item break-inside-avoid mb-12 group cursor-zoom-in" data-index="${globalIndex}">
                    <div class="relative overflow-hidden bg-gray-100 mb-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]">
                        <img 
                            src="${imagePath}" 
                            alt="${item.title}"
                            loading="lazy"
                            class="w-full h-auto block transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.02]"
                            onerror="this.parentElement.style.display='none'"
                        >
                        
                        <!-- Overlay on hover -->
                        <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                    </div>
                    
                    <div class="flex flex-col items-start px-1">
                        <div class="flex items-baseline justify-between w-full border-b border-gray-100 pb-2 mb-2">
                            <h3 class="text-sm font-serif text-primary tracking-wide leading-relaxed group-hover:text-[#3498db] transition-colors">${item.title}</h3>
                            <span class="text-[10px] font-mono text-gray-400 ml-2 tracking-wider shrink-0">${date}</span>
                        </div>
                        <div class="text-[10px] text-gray-400 font-light line-clamp-2 leading-relaxed tracking-wide opacity-0 transform -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                            ${item.tags.slice(0, 3).join(' / ')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.insertAdjacentHTML('beforeend', html);
        this.visibleCount += nextBatch.length;

        // Toggle Load More Display
        loadMoreContainer.classList.remove('hidden');
        if (this.visibleCount >= this.galleryData.length) {
            loadMoreBtn.classList.add('hidden');
            allLoadedText.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.remove('hidden');
            allLoadedText.classList.add('hidden');
        }
    }

    bindEvents() {
        const lightbox = this.element.querySelector('#lightbox');
        const lightboxImg = this.element.querySelector('#lightbox-img');
        const lightboxTitle = this.element.querySelector('#lightbox-title');
        const lightboxDesc = this.element.querySelector('#lightbox-desc');
        const lightboxLink = this.element.querySelector('#lightbox-link');
        const grid = this.element.querySelector('#gallery-grid');
        const loadMoreBtn = this.element.querySelector('#load-more-btn');

        // Load More Click
        loadMoreBtn.addEventListener('click', () => {
            this.renderMoreItems();
        });

        // Event Delegation for Gallery Items (Lightbox Open)
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const index = item.dataset.index;
                const data = this.galleryData[index];
                if (!data) return;

                const imagePath = data.original_url_display || data.url;

                lightboxImg.src = imagePath;
                lightboxTitle.textContent = data.title;
                lightboxDesc.textContent = data.tags.join('   ');
                lightboxLink.href = data.pixiv_url;

                lightbox.classList.remove('hidden');
                document.body.style.overflow = 'hidden';

                requestAnimationFrame(() => {
                    lightbox.classList.remove('opacity-0');
                    lightbox.classList.add('opacity-100');
                    lightboxImg.classList.remove('scale-95');
                    lightboxImg.classList.add('scale-100');
                });
            }
        });

        // Close when clicking background
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg && e.target !== lightboxLink && !lightboxLink.contains(e.target)) {
                lightbox.classList.remove('opacity-100');
                lightbox.classList.add('opacity-0');
                lightboxImg.classList.remove('scale-100');
                lightboxImg.classList.add('scale-95');

                document.body.style.overflow = '';

                setTimeout(() => {
                    lightbox.classList.add('hidden');
                    lightboxImg.src = ''; // Clear source
                }, 500);
            }
        });
    }
}
