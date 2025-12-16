export default class CarouselSection {
    constructor() {
        this.slides = [
            {
                image: "https://blog.catzz.work/file/1765900357798_1-1.png",
                text: "人应阳光向上，但原谅时而脆弱"
            },
            {
                image: "https://blog.catzz.work/file/1765900363060_72668704_PAIN.jpg",
                text: "雨水是否协同音律，夜色或否夹杂酒精"
            },
            {
                image: "https://blog.catzz.work/file/1765900369016_137779301_Solitude.jpg",
                text: "忧郁的梦没有终点，她又以何种姿态存在着"
            }
        ];
        this.currentIndex = 0;
        this.interval = null;
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full bg-white py-24 flex flex-col items-center overflow-hidden';

        this.element.innerHTML = `
            <style>
                .font-serif-sc { font-family: 'Noto Serif SC', serif; }
                
                /* Snappier, more "film-like" transition */
                .carousel-slide { 
                    transition: opacity 1.2s cubic-bezier(0.45, 0, 0.55, 1), transform 1.4s cubic-bezier(0.25, 1, 0.5, 1); 
                }
                
                .text-reveal {
                    transition: opacity 1.0s ease-out, transform 1.0s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                
                .slide-active { opacity: 1; z-index: 10; transform: scale(1); }
                .slide-inactive { opacity: 0; z-index: 0; transform: scale(1.03); } /* Subtle zoom out on exit */
                
                .text-active { opacity: 1; transform: translateY(0); }
                .text-inactive { opacity: 0; transform: translateY(10px); }
                
                .progress-bar { transition: width 6000ms linear; }
            </style>

            <!-- Main Content Container: Cinematic Width -->
            <div class="w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-7xl px-4 flex flex-col items-start">
                
                 <!-- Image Container -->
                <div class="relative w-full aspect-video md:aspect-[2.35/1] rounded-sm overflow-hidden shadow-sm group cursor-pointer" id="carousel-container">
                    <!-- Slides -->
                    ${this.slides.map((slide, index) => `
                        <div class="absolute inset-0 w-full h-full carousel-slide ${index === 0 ? 'slide-active' : 'slide-inactive'}" data-index="${index}">
                            <img src="${slide.image}" class="w-full h-full object-cover" alt="Art ${index}">
                            <!-- Extremely subtle grain/overlay for texture -->
                            <div class="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
                        </div>
                    `).join('')}

                    <!-- Navigation Zones -->
                    <div class="absolute inset-y-0 left-0 w-1/5 z-20 cursor-w-resize" id="prev-area"></div>
                    <div class="absolute inset-y-0 right-0 w-1/5 z-20 cursor-e-resize" id="next-area"></div>
                </div>

                <!-- Artistic Info Section (Below Left) -->
                <!-- Layout: Index Number + Text separated by line -->
                <div class="mt-8 w-full flex items-start justify-between relative pl-1">
                     
                     <div class="flex flex-col items-start gap-3">
                        <!-- Dynamic Text -->
                        <div class="h-10 relative w-full max-w-4xl">
                             ${this.slides.map((slide, index) => `
                                <p class="absolute left-0 top-0 text-gray-500 font-serif-sc font-thin text-[11px] tracking-[0.3em] whitespace-nowrap text-reveal ${index === 0 ? 'text-active' : 'text-inactive'}" data-index="${index}">
                                    ${slide.text}
                                </p>
                            `).join('')}
                        </div>
                     </div>

                     <!-- Pagination / Index (Artistic style: 01 / 03) -->
                     <div class="flex items-center gap-4 text-[10px] tracking-[0.2em] font-serif-sc text-gray-400 font-thin">
                        <span id="current-index">01</span>
                        <div class="w-12 h-[1px] bg-gray-200 relative overflow-hidden">
                             <div id="progress-indicator" class="absolute left-0 top-0 h-full bg-gray-400 w-0"></div>
                        </div>
                        <span>0${this.slides.length}</span>
                     </div>
                </div>

            </div>
        `;

        return this.element;
    }

    mount() {
        const slides = this.element.querySelectorAll('.carousel-slide');
        const captions = this.element.querySelectorAll('.text-reveal');
        const currentIndexDisplay = this.element.querySelector('#current-index');
        const progressIndicator = this.element.querySelector('#progress-indicator');
        const container = this.element.querySelector('#carousel-container');
        const prevArea = this.element.querySelector('#prev-area');
        const nextArea = this.element.querySelector('#next-area');

        // Reset progress bar animation
        const resetProgress = () => {
            progressIndicator.style.transition = 'none';
            progressIndicator.style.width = '0%';
            setTimeout(() => {
                progressIndicator.style.transition = 'width 6000ms linear';
                progressIndicator.style.width = '100%';
            }, 50);
        };

        const updateCarousel = (index) => {
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;

            // Slides
            slides.forEach(slide => {
                const i = parseInt(slide.dataset.index);
                if (i === index) {
                    slide.classList.remove('slide-inactive');
                    slide.classList.add('slide-active');
                } else {
                    slide.classList.remove('slide-active');
                    slide.classList.add('slide-inactive');
                }
            });

            // Text
            captions.forEach(caption => {
                const i = parseInt(caption.dataset.index);
                if (i === index) {
                    caption.classList.remove('text-inactive');
                    caption.classList.add('text-active');
                } else {
                    caption.classList.remove('text-active');
                    caption.classList.add('text-inactive');
                }
            });

            // Index Number
            currentIndexDisplay.textContent = `0${index + 1}`;

            this.currentIndex = index;
            resetProgress();
        };

        const startAutoPlay = () => {
            resetProgress();
            this.interval = setInterval(() => {
                updateCarousel(this.currentIndex + 1);
            }, 6000);
        };

        const stopAutoPlay = () => {
            if (this.interval) clearInterval(this.interval);
            progressIndicator.style.transition = 'none';
            progressIndicator.style.width = '0%';
        };

        // Start
        startAutoPlay();

        // Interactions
        prevArea.addEventListener('click', () => {
            stopAutoPlay();
            updateCarousel(this.currentIndex - 1);
            startAutoPlay();
        });

        nextArea.addEventListener('click', () => {
            stopAutoPlay();
            updateCarousel(this.currentIndex + 1);
            startAutoPlay();
        });

        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }
}
