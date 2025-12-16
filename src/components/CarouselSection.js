export default class CarouselSection {
    constructor() {
        this.slides = [
            {
                image: "pixiv_data/images/138045922_感觉有点冷可以开始放寒假了吗.jpg",
                text: "人应阳光向上，但原谅时而脆弱"
            },
            {
                image: "pixiv_data/images/72668704_PAIN.jpg",
                text: "雨水是否协同音律，夜色或否夹杂酒精"
            },
            {
                image: "pixiv_data/images/137779301_Solitude.jpg",
                text: "忧郁的梦没有终点，她又以何种姿态存在着"
            }
        ];
        this.currentIndex = 0;
        this.interval = null;
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full bg-white py-20 flex flex-col items-center overflow-hidden';

        // P2 Reference style: Large image area, text below.
        // Using "delicate" animation style (cross-fade + subtle scale)
        this.element.innerHTML = `
            <style>
                .font-art { font-family: 'LXGWWenKai', 'Noto Serif SC', serif; }
                .slide-active { opacity: 1; z-index: 10; transform: scale(1); }
                .slide-next { opacity: 0; z-index: 1; transform: scale(1.05); } 
                /* Note: tailwind scale defaults are good, but we want custom timing */
                .carousel-slide { transition: opacity 1.5s ease-in-out, transform 1.5s ease-out; }
            </style>

            <div class="w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-6xl px-4">
                
                 <!-- Main Image Container -->
                <div class="relative w-full aspect-video md:aspect-[2/1] rounded-xl overflow-hidden shadow-lg group cursor-pointer" id="carousel-container">
                    <!-- Slides (Absolute Positioning for Cross-fade) -->
                    ${this.slides.map((slide, index) => `
                        <div class="absolute inset-0 w-full h-full carousel-slide ${index === 0 ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}" data-index="${index}">
                            <img src="${slide.image}" class="w-full h-full object-cover" alt="Art ${index}">
                            <!-- Subtle overlay for depth, optional -->
                            <div class="absolute inset-0 bg-black/10"></div>
                        </div>
                    `).join('')}

                    <!-- Navigation Hits (Invisible but clickable areas for L/R) -->
                    <div class="absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer" id="prev-area"></div>
                    <div class="absolute inset-y-0 right-0 w-1/4 z-30 cursor-pointer" id="next-area"></div>

                    <!-- Dot Indicators (Overlaid at bottom) -->
                    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-40">
                         ${this.slides.map((_, index) => `
                            <button class="w-1.5 h-1.5 rounded-full transition-all duration-500 nav-dot ${index === 0 ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}" data-index="${index}"></button>
                        `).join('')}
                    </div>
                </div>

                <!-- Text Area (Below Image - Artistic & Delicate) -->
                <div class="mt-8 text-center h-16 relative">
                     ${this.slides.map((slide, index) => `
                        <p class="absolute inset-x-0 top-0 text-gray-600 font-art text-sm md:text-base tracking-[0.15em] transition-all duration-1000 slide-caption ${index === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}" data-index="${index}">
                            ${slide.text}
                        </p>
                    `).join('')}
                </div>

            </div>
        `;

        return this.element;
    }

    mount() {
        const slides = this.element.querySelectorAll('.carousel-slide');
        const captions = this.element.querySelectorAll('.slide-caption');
        const dots = this.element.querySelectorAll('.nav-dot');
        const container = this.element.querySelector('#carousel-container');
        const prevArea = this.element.querySelector('#prev-area');
        const nextArea = this.element.querySelector('#next-area');

        const updateCarousel = (index) => {
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;

            // Fade Out/In Slides
            slides.forEach(slide => {
                const i = parseInt(slide.dataset.index);
                if (i === index) {
                    slide.classList.remove('opacity-0', 'scale-105', 'z-0');
                    slide.classList.add('opacity-100', 'scale-100', 'z-10');
                } else {
                    slide.classList.remove('opacity-100', 'scale-100', 'z-10');
                    slide.classList.add('opacity-0', 'scale-105', 'z-0');
                }
            });

            // Fade Text
            captions.forEach(caption => {
                const i = parseInt(caption.dataset.index);
                if (i === index) {
                    caption.classList.remove('opacity-0', 'translate-y-4');
                    caption.classList.add('opacity-100', 'translate-y-0');
                } else {
                    caption.classList.remove('opacity-100', 'translate-y-0');
                    caption.classList.add('opacity-0', 'translate-y-4');
                }
            });

            // Update Dots
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.remove('bg-white/50', 'w-1.5');
                    dot.classList.add('bg-white', 'w-6');
                } else {
                    dot.classList.add('bg-white/50', 'w-1.5');
                    dot.classList.remove('bg-white', 'w-6');
                }
            });

            this.currentIndex = index;
        };

        const startAutoPlay = () => {
            this.interval = setInterval(() => {
                updateCarousel(this.currentIndex + 1);
            }, 6000); // Slower, more relaxed interval
        };

        const stopAutoPlay = () => {
            if (this.interval) clearInterval(this.interval);
        };

        startAutoPlay();

        // Interaction
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

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoPlay();
                updateCarousel(index);
                startAutoPlay();
            });
        });

        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }
}
