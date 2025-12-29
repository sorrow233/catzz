import { i18n } from '../utils/i18n.js';

export default class HeroSection {
    constructor() {
        // Hero State
        this.updateQuotes();
        this.currentQuoteIndex = 0;
        this.quoteInterval = null;
        this.rainAnimationId = null;

        // Carousel State
        this.slides = [
            { image: "https://blog.catzz.work/file/1765900357798_1-1.png" },
            { image: "https://blog.catzz.work/file/1765900363060_72668704_PAIN.jpg" },
            { image: "https://blog.catzz.work/file/1765900369016_137779301_Solitude.jpg" }
        ];
        this.currentSlideIndex = 0;
        this.carouselInterval = null;

        // Shared Listeners
        window.addEventListener('languageChanged', () => {
            this.updateQuotes();
            this.updateDOM();
            this.updateCarouselCaptions();
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

        // Update Lang Switcher UI
        const btns = this.element.querySelectorAll('.lang-btn');
        btns.forEach(btn => {
            if (btn.textContent === 'CN' && i18n.currentLanguage === 'zh') btn.classList.add('active');
            else if (btn.textContent === 'EN' && i18n.currentLanguage === 'en') btn.classList.add('active');
            else if (btn.textContent === 'JP' && i18n.currentLanguage === 'ja') btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    updateCarouselCaptions() {
        const captions = i18n.t('carousel.slides');
        const captionElements = this.element.querySelectorAll('.slide-caption');
        captionElements.forEach((el, index) => {
            // Using innerHTML to preserve the styling wrapper if needed, or just textContent if selecting the text node.
            // In render, I wrap text in a span. Let's update the text inside the span.
            // But wait, in render I do: <p class="slide-caption ..."> ${text} </p>
            // So I can just set textContent of the p, but I need to make sure styling is okay.
            // Actually, in render I used: <p class="slide-caption ..."> ${text} </p>
            // So textContent is fine.
            el.textContent = captions[index];
        });
    }

    render() {
        this.element = document.createElement('section');
        // Split screen: Column on mobile, Row on Desktop
        this.element.className = 'w-full h-screen flex flex-col md:flex-row bg-white relative overflow-hidden font-serif';

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
            
            /* Language Switcher */
            .lang-switcher { cursor: pointer; transition: color 0.3s; }
            .lang-btn:hover, .lang-btn.active { color: #1f2937; font-weight: 500; }

            /* Carousel Transitions */
            .carousel-slide { transition: opacity 1.2s cubic-bezier(0.45, 0, 0.55, 1), transform 1.4s cubic-bezier(0.25, 1, 0.5, 1); }
            .slide-active { opacity: 1; z-index: 10; transform: scale(1); }
            .slide-inactive { opacity: 0; z-index: 0; transform: scale(1.05); }
            
            .caption-active { opacity: 1; transform: translateY(0); transition: all 1s ease-out 0.3s; }
            .caption-inactive { opacity: 0; transform: translateY(10px); transition: all 0.5s ease-in; }
        `;
        this.element.appendChild(style);

        this.element.innerHTML += `
            <!-- LEFT PANEL: Atmosphere / Data -->
            <div class="relative w-full md:w-5/12 h-1/2 md:h-full flex flex-col items-center justify-center bg-white z-10 px-6 order-2 md:order-1 border-r border-gray-50">
                
                <!-- Rain Canvas (Confined to Left Panel for 'Window' effect) -->
                <canvas id="rain-canvas" class="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-60"></canvas>
                
                <!-- Content -->
                <div class="relative z-10 flex flex-col items-center text-center w-full">
                     <!-- Language Switcher (Top Left of Panel) -->
                    <div class="absolute top-[-20vh] md:top-[-30vh] left-0 w-full flex justify-center gap-4 text-xs tracking-widest text-gray-400 hero-font-sc">
                        <span class="lang-btn ${i18n.currentLanguage === 'zh' ? 'active' : ''}" onclick="i18n.setLanguage('zh')">CN</span>
                        <span class="lang-btn ${i18n.currentLanguage === 'en' ? 'active' : ''}" onclick="i18n.setLanguage('en')">EN</span>
                        <span class="lang-btn ${i18n.currentLanguage === 'ja' ? 'active' : ''}" onclick="i18n.setLanguage('ja')">JP</span>
                    </div>

                    <h1 class="text-4xl md:text-6xl font-thin tracking-[0.2em] mb-10 text-gray-800 hero-font-sc opacity-90">Catzz</h1>
                    
                    <!-- Dynamic Text (Preserved 'Street corner phone') -->
                    <div class="h-16 flex flex-col items-center justify-center text-xs md:text-sm text-gray-500 font-light tracking-[0.3em] hero-font-sc space-y-2">
                        <span class="prefix inline-block opacity-0"></span>
                        <span class="typed-quotes inline-block opacity-0"></span>
                    </div>

                    <!-- Social Icons -->
                    <div class="mt-16 flex gap-8 opacity-0 animate-[softFadeIn_1s_ease-out_1s_forwards]">
                        <a href="https://www.pixiv.net/users/1056186/artworks?p=1" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.18 8.04c-.45 2.1-2.92 4.2-6.52 4.2h-1.5v3.42H6.9V6h4.5c2.4 0 4.8.6 5.78 2.04z"/><path d="M9.16 8.34h1.95c1.23 0 2.1.42 2.37 1.2.24.81-.48 1.83-2.16 1.83h-2.16V8.34z"/></svg></a>
                        <a href="https://space.bilibili.com/308124" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 4.6h.85c1.5.05 2.77 1.35 2.77 2.9v10.37c0 1.63-1.32 2.95-2.95 2.95H5.52c-1.63 0-2.95-1.32-2.95-2.95V7.55c0-1.63 1.32-2.95 2.95-2.95h12.3zM8 1.9l2.23 1.9.24.3H13.6l.2-.24 2.15-1.92c.6-.54.67-1.46.13-2.06-.5-.57-1.38-.63-2-.13L12 1.7 9.87-.27c-.6-.5-1.48-.44-2 .13-.54.6-.47 1.52.13 2.03zM7.22 8.8c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm9.56 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg></a>
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
        this.initRain();
        this.initQuoteCycling();
        this.initCarousel();

        const scrollBtn = this.element.querySelector('#scroll-btn');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                const nextSection = this.element.nextElementSibling;
                if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // --- Rain Logic (Optimized for Left Panel) ---
    initRain() {
        this.canvas = this.element.querySelector('#rain-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        const parent = this.canvas.parentElement;
        this.dpr = window.devicePixelRatio || 1;

        const resize = () => {
            if (!this.canvas) return;
            // Use parent dimensions as it is absolute
            const rect = parent.getBoundingClientRect();
            // On initial load, rect might be 0 if display:none, but typically ok.
            // Fallback to wrapper logic if needed.
            this.width = rect.width || parent.clientWidth;
            this.height = rect.height || parent.clientHeight;

            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
        };

        // Initial resize
        resize();

        // Use ResizeObserver for more robust resizing of the panel
        this.resizeObserver = new ResizeObserver(() => resize());
        this.resizeObserver.observe(parent);

        this.raindrops = [];
        const count = 40; // Fewer drops for smaller area
        class Raindrop {
            constructor(w, h) { this.w = w; this.h = h; this.reset(); this.y = Math.random() * h; }
            reset() {
                this.x = Math.random() * this.w;
                this.y = -20;
                this.length = Math.random() * 15 + 5;
                this.speed = Math.random() * 2 + 1.5;
                this.opacity = Math.random() * 0.2 + 0.1;
            }
            update(h) { this.y += this.speed; if (this.y > h) this.reset(); }
            draw(ctx) {
                ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length);
                ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity})`; ctx.lineWidth = 1; ctx.stroke();
            }
        }
        for (let i = 0; i < count; i++) this.raindrops.push(new Raindrop(this.width, this.height));

        const animate = () => {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.raindrops.forEach(d => { d.w = this.width; d.update(this.height); d.draw(this.ctx); });
            this.rainAnimationId = requestAnimationFrame(animate);
        };
        animate();
    }

    // --- Quote Cycling Logic ---
    initQuoteCycling() {
        const prefix = this.element.querySelector('.prefix');
        const typedQuotes = this.element.querySelector('.typed-quotes');

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

    // --- Carousel Logic ---
    initCarousel() {
        const container = this.element.querySelector('#carousel-container');
        const slides = this.element.querySelectorAll('.carousel-slide');

        const numDisplay = this.element.querySelector('#current-slide-num');
        const progress = this.element.querySelector('#slide-progress');
        const nextArea = this.element.querySelector('#next-area');
        const prevArea = this.element.querySelector('#prev-area');

        const resetProgress = () => {
            progress.style.transition = 'none';
            progress.style.width = '0%';
            setTimeout(() => {
                progress.style.transition = 'width 6000ms linear';
                progress.style.width = '100%';
            }, 50);
        };

        const updateSlide = (idx) => {
            if (idx >= this.slides.length) idx = 0;
            if (idx < 0) idx = this.slides.length - 1;
            this.currentSlideIndex = idx;

            slides.forEach(slide => {
                const i = parseInt(slide.dataset.index);
                const captionContainer = slide.querySelector('.absolute.bottom-8'); // The caption wrapper

                if (i === idx) {
                    slide.classList.remove('slide-inactive');
                    slide.classList.add('slide-active');
                    if (captionContainer) {
                        captionContainer.classList.remove('caption-inactive');
                        captionContainer.classList.add('caption-active');
                    }
                } else {
                    slide.classList.remove('slide-active');
                    slide.classList.add('slide-inactive');
                    if (captionContainer) {
                        captionContainer.classList.remove('caption-active');
                        captionContainer.classList.add('caption-inactive');
                    }
                }
            });

            numDisplay.textContent = `0${idx + 1}`;
            resetProgress();
        };

        const startAuto = () => {
            resetProgress();
            this.carouselInterval = setInterval(() => {
                updateSlide(this.currentSlideIndex + 1);
            }, 6000);
        };

        const stopAuto = () => {
            clearInterval(this.carouselInterval);
            progress.style.transition = 'none';
            progress.style.width = '0%';
        };

        startAuto();

        // Events
        nextArea.addEventListener('click', () => { stopAuto(); updateSlide(this.currentSlideIndex + 1); startAuto(); });
        prevArea.addEventListener('click', () => { stopAuto(); updateSlide(this.currentSlideIndex - 1); startAuto(); });
        container.addEventListener('mouseenter', stopAuto);
        container.addEventListener('mouseleave', startAuto);
    }

    destroy() {
        if (this.quoteInterval) clearInterval(this.quoteInterval);
        if (this.carouselInterval) clearInterval(this.carouselInterval);
        if (this.rainAnimationId) cancelAnimationFrame(this.rainAnimationId);
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }
}
