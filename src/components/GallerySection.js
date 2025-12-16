export default class GallerySection {
    constructor() {
        this.galleryData = [
            {
                image: 'https://pic.k-on.live/file/1735037730200_image.png',
                title: '猫咪日记',
                description: '慵懒午后的时光'
            },
            {
                image: 'https://source.unsplash.com/random/800x600?cat,2',
                title: '街角遇见',
                description: '城市中的小确幸'
            },
            {
                image: 'https://source.unsplash.com/random/800x600?cat,3',
                title: '雨天私语',
                description: '温暖的避风港'
            },
            {
                image: 'https://source.unsplash.com/random/800x600?cat,4',
                title: '阳光漫步',
                description: '慢节奏的生活'
            }
        ];
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-[#f8f9fa] py-20 px-5 md:px-10 flex flex-col items-center';

        this.element.innerHTML = `
            <div class="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-[1000px] w-full p-5 md:p-10">
                ${this.galleryData.map((item, index) => `
                    <div class="gallery-item flex flex-col gap-5 cursor-pointer group" data-index="${index}">
                        <div class="w-full aspect-video rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                            <img 
                                src="${item.image}" 
                                alt="${item.title}"
                                loading="lazy"
                                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onerror="this.src='https://via.placeholder.com/800x600?text=Image+Not+Found'"
                            >
                        </div>
                        <div class="gallery-text flex flex-col gap-1.5 px-2.5">
                            <h3 class="text-base text-gray-800 font-normal group-hover:text-secondary transition-colors">${item.title}</h3>
                            <p class="text-sm text-gray-500 font-light">${item.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Lightbox Modal -->
            <div id="lightbox" class="fixed inset-0 bg-black/90 hidden z-50 flex justify-center items-center opacity-0 transition-opacity duration-300 cursor-pointer p-5">
                <div class="relative max-w-5xl w-full flex flex-col items-center" id="lightbox-content">
                    <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl">
                    <h3 id="lightbox-title" class="text-white text-xl mt-4 font-light tracking-widest"></h3>
                    <p id="lightbox-desc" class="text-gray-400 text-sm mt-2 font-light"></p>
                </div>
            </div>
        `;

        return this.element;
    }

    mount() {
        this.bindEvents();
    }

    bindEvents() {
        const items = this.element.querySelectorAll('.gallery-item');
        const lightbox = this.element.querySelector('#lightbox');
        const lightboxImg = this.element.querySelector('#lightbox-img');
        const lightboxTitle = this.element.querySelector('#lightbox-title');
        const lightboxDesc = this.element.querySelector('#lightbox-desc');

        items.forEach(item => {
            item.addEventListener('click', () => {
                const index = item.dataset.index;
                const data = this.galleryData[index];

                lightboxImg.src = data.image;
                lightboxTitle.textContent = data.title;
                lightboxDesc.textContent = data.description;

                lightbox.classList.remove('hidden');
                // Small delay to allow display:block to apply before opacity transition
                requestAnimationFrame(() => {
                    lightbox.classList.remove('opacity-0');
                    lightbox.classList.add('opacity-100');
                });
            });
        });

        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('opacity-100');
            lightbox.classList.add('opacity-0');
            setTimeout(() => {
                lightbox.classList.add('hidden');
            }, 300);
        });
    }
}
