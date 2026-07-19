import { i18n } from '../utils/i18n.js';
import { RainEffect } from './RainEffect.js';
import { Carousel } from './Carousel.js';

export default class HeroSection {
    constructor() {
        // Hero State
        this.updateQuotes();
        this.currentQuoteIndex = 0;
        this.quoteInterval = null;
        this.rainEffect = null;
        this.carousel = null;

        this.slides = [
            { image: "https://blog.catzz.work/file/1765900357798_1-1.png" },
            { image: "https://blog.catzz.work/file/1765900363060_72668704_PAIN.jpg" },
            { image: "https://blog.catzz.work/file/1765900369016_137779301_Solitude.jpg" }
        ];

        // Shared Listeners
        window.addEventListener('languageChanged', () => {
            this.updateQuotes();
            this.updateDOM();
        });
    }

    updateQuotes() {
        this.prefixes = i18n.t('hero.prefixes');
        this.suffixes = i18n.t('hero.suffixes');
    }

    updateDOM() {
        // Update Hero Text
        const prefix = this.element.querySelector('.prefix');
        const typedQuotes = this.element.querySelector('.typed-quotes');
        if (prefix && typedQuotes) {
            prefix.textContent = this.prefixes[this.currentQuoteIndex];
            typedQuotes.textContent = this.suffixes[this.currentQuoteIndex];
        }
    }

    render() {
        this.element = document.createElement('section');
        // Split screen: Column on mobile, Row on Desktop
        this.element.className = 'w-full h-screen flex flex-col md:flex-row bg-white relative overflow-hidden font-serif';

        // Inline styles for specific animations
        const style = document.createElement('style');
        style.textContent = `
            .hero-font-sc { font-family: 'Noto Serif SC', serif; }
            
            /* Airy Fade Animations for Text */
            @keyframes softFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes softFadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-5px); blur(1px); } }
            .text-prefix-in { animation: softFadeIn 1.2s ease-out forwards; }
            .text-quotes-in { animation: softFadeIn 1.2s ease-out 0.3s forwards; }
            .text-out { animation: softFadeOut 1.2s ease-in forwards; }
            
            .icon-hover:hover { transform: translateY(-3px); color: #000; }

            /* Carousel Transitions */
            .carousel-slide { transition: opacity 1.2s cubic-bezier(0.45, 0, 0.55, 1), transform 1.4s cubic-bezier(0.25, 1, 0.5, 1); }
            .slide-active { opacity: 1; z-index: 10; transform: scale(1); }
            .slide-inactive { opacity: 0; z-index: 0; transform: scale(1.05); }
            
            .caption-active { opacity: 1; transform: translateY(0); transition: all 1s ease-out 0.3s; }
            .caption-inactive { opacity: 0; transform: translateY(10px); transition: all 0.5s ease-in; }
        `;
        this.element.appendChild(style);

        this.element.innerHTML += `
            <!-- Left Panel for Rain Effect is implicitly the container itself or a child? 
                 RainEffect appends #rain-canvas to root element. 
            -->

            <!-- LEFT PANEL: Atmosphere / Data -->
            <div class="relative w-full md:w-5/12 h-1/2 md:h-full flex flex-col items-center justify-center bg-white z-10 px-6 order-2 md:order-1 border-r border-gray-50">
                
                <!-- Content -->
                <div class="relative z-10 flex flex-col items-center text-center w-full">
                    <h1 class="text-4xl md:text-6xl font-thin tracking-[0.2em] mb-10 text-gray-800 hero-font-sc opacity-90">Catzz</h1>
                    
                    <!-- Dynamic Text -->
                    <div class="h-16 flex flex-col items-center justify-center text-xs md:text-sm text-gray-500 font-light tracking-[0.3em] hero-font-sc space-y-2">
                        <span class="prefix inline-block opacity-0"></span>
                        <span class="typed-quotes inline-block opacity-0"></span>
                    </div>

                    <!-- Social Icons -->
                    <div class="mt-16 flex gap-8 opacity-0 animate-[softFadeIn_1s_ease-out_1s_forwards]">
                        <a href="https://www.pixiv.net/users/1056186/artworks?p=1" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.18 8.04c-.45 2.1-2.92 4.2-6.52 4.2h-1.5v3.42H6.9V6h4.5c2.4 0 4.8.6 5.78 2.04z"/><path d="M9.16 8.34h1.95c1.23 0 2.1.42 2.37 1.2.24.81-.48 1.83-2.16 1.83h-2.16V8.34z"/></svg></a>
                        <a href="https://space.bilibili.com/308124" target="_blank" rel="noopener noreferrer" class="text-gray-300 transition-all duration-300 icon-hover"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 4.6h.85c1.5.05 2.77 1.35 2.77 2.9v10.37c0 1.63-1.32 2.95-2.95 2.95H5.52c-1.63 0-2.95-1.32-2.95-2.95V7.55c0-1.63 1.32-2.95 2.95-2.95h12.3zM8 1.9l2.23 1.9.24.3H13.6l.2-.24 2.15-1.92c.6-.54.67-1.46.13-2.06-.5-.57-1.38-.63-2-.13L12 1.7 9.87-.27c-.6-.5-1.48-.44-2 .13-.54.6-.47 1.52.13 2.03zM7.22 8.8c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm9.56 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg></a>
                        <a href="https://x.com/2gonode" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.3L14.32 10.5l8.5 11.25h-6.65l-5.2-6.82-5.96 6.82H1.68l7.73-8.83L.98 2.25h6.83l4.7 6.23 4.57-6.23h1.16zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg></a>
                    </div>
                </div>

                <!-- Scroll Indicator -->
                <div class="absolute bottom-6 animate-bounce cursor-pointer opacity-30 hover:opacity-80 transition-opacity z-20" id="scroll-btn">
                     <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
            </div>

            <!-- RIGHT PANEL: Visuals / Carousel -->
            <div class="w-full md:w-7/12 h-1/2 md:h-full relative overflow-hidden bg-gray-100 order-1 md:order-2 group cursor-pointer" id="carousel-container">
                ${this.slides.map((slide, index) => `
                    <div class="absolute inset-0 w-full h-full carousel-slide ${index === 0 ? 'slide-active' : 'slide-inactive'}" data-index="${index}">
                        <img src="${slide.image}" class="w-full h-full object-cover" alt="Art ${index}">
                        <div class="absolute inset-0 bg-black/10 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"></div>
                        
                        <!-- Caption Overlay (Bottom Right) -->
                        <div class="absolute bottom-8 right-8 max-w-[80%] text-right ${index === 0 ? 'caption-active' : 'caption-inactive'}">
                            <p class="slide-caption text-xs md:text-sm font-light tracking-widest text-white/90 drop-shadow-md font-serif-sc">
                                ${i18n.t('carousel.slides')[index]}
                            </p>
                        </div>
                    </div>
                `).join('')}

                <!-- Navigation Zones -->
                <div class="absolute inset-y-0 left-0 w-1/6 z-20 cursor-w-resize" id="prev-area"></div>
                <div class="absolute inset-y-0 right-0 w-1/6 z-20 cursor-e-resize" id="next-area"></div>

                <!-- Pagination -->
                <div class="absolute bottom-8 left-8 z-30 flex items-center gap-3">
                     <span class="text-[10px] text-white/70 tracking-widest font-mono" id="current-slide-num">01</span>
                     <div class="w-12 h-[1px] bg-white/30 overflow-hidden"><div id="slide-progress" class="h-full w-0 bg-white shadow-[0_0_10px_white]"></div></div>
                     <span class="text-[10px] text-white/40 tracking-widest font-mono">03</span>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.initQuoteCycling();

        // Initialize Modules
        this.rainEffect = new RainEffect(this.element);
        this.carousel = new Carousel(this.element, this.slides);

        const scrollBtn = this.element.querySelector('#scroll-btn');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                const nextSection = this.element.nextElementSibling;
                if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // --- Quote Cycling Logic (Keep here as it's simple) ---
    initQuoteCycling() {
        const prefix = this.element.querySelector('.prefix');
        const typedQuotes = this.element.querySelector('.typed-quotes');

        if (!prefix || !typedQuotes) return;

        prefix.textContent = this.prefixes[0];
        typedQuotes.textContent = this.suffixes[0];
        prefix.classList.add('text-prefix-in');
        typedQuotes.classList.add('text-quotes-in');

        const update = () => {
            prefix.classList.remove('text-prefix-in', 'text-quotes-in');
            typedQuotes.classList.remove('text-prefix-in', 'text-quotes-in');
            prefix.classList.add('text-out');
            typedQuotes.classList.add('text-out');

            setTimeout(() => {
                this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.prefixes.length;
                prefix.textContent = this.prefixes[this.currentQuoteIndex];
                typedQuotes.textContent = this.suffixes[this.currentQuoteIndex];
                prefix.classList.remove('text-out');
                typedQuotes.classList.remove('text-out');
                // Force reflow
                void prefix.offsetWidth;
                prefix.classList.add('text-prefix-in');
                typedQuotes.classList.add('text-quotes-in');
            }, 1200);
        };
        this.quoteInterval = setInterval(update, 5000);
    }

    destroy() {
        if (this.quoteInterval) clearInterval(this.quoteInterval);
        if (this.rainEffect) this.rainEffect.destroy();
        if (this.carousel) this.carousel.destroy();
    }
}
