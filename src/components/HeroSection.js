export default class HeroSection {
    constructor() {
        this.prefixes = ["清凉雨夜", "脆弱雨伞", "街边电话", "路旁雨滩"];
        this.suffixes = ["温暖过谁的心", "保护了谁前行", "少女心伤忧郁", "天空触手可及"];
        this.currentIndex = 0;
        this.quoteInterval = null;
        this.rainAnimationId = null;
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden font-serif';

        // Inject custom styles
        const style = document.createElement('style');
        style.textContent = `
            .hero-font-sc { font-family: 'Noto Serif SC', serif; }
            
            /* Airy Fade Animations */
            @keyframes softFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes softFadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-5px); blur(1px); } }
            
            .text-prefix-in { animation: softFadeIn 1.2s ease-out forwards; }
            .text-quotes-in { animation: softFadeIn 1.2s ease-out 0.3s forwards; }
            .text-out { animation: softFadeOut 1.2s ease-in forwards; }
            
            .icon-hover:hover { transform: translateY(-3px); color: #000; }
        `;
        this.element.appendChild(style);

        this.element.innerHTML += `
             <!-- Rain Canvas -->
            <canvas id="rain-canvas" class="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-60"></canvas>

            <!-- Main Content Container -->
            <div class="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl px-4 text-center">
                
                <!-- Title - Clean & Large -->
                <h1 class="text-5xl md:text-7xl font-extralight tracking-[0.2em] mb-12 text-gray-800 hero-font-sc opacity-80">Catzz</h1>
                
                <!-- Dynamic Typing Text - Small, Spaced, Artistic -->
                <!-- Removed WenKai. Using Serif for premium magazine feel. Text-sm for delicacy. -->
                <div class="h-8 flex items-center justify-center text-sm md:text-base text-gray-500 font-light tracking-[0.4em] hero-font-sc">
                    <span class="prefix inline-block mr-4 opacity-0"></span>
                    <span class="typed-quotes inline-block opacity-0"></span>
                </div>

                <!-- Social Icons - SVG - Clean Row -->
                <div class="mt-20 flex gap-12 opacity-0 animate-[softFadeIn_1s_ease-out_1s_forwards]">
                    <!-- Pixiv (Updated Link & Icon) -->
                    <a href="https://www.pixiv.net/users/1056186/artworks?p=1" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover" aria-label="Pixiv">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                           <!-- Pixiv 'P' Logo Path (Approximate/Standard) -->
                           <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.18 8.04c-.45 2.1-2.92 4.2-6.52 4.2h-1.5v3.42H6.9V6h4.5c2.4 0 4.8.6 5.78 2.04z"/> 
                           <path d="M9.16 8.34h1.95c1.23 0 2.1.42 2.37 1.2.24.81-.48 1.83-2.16 1.83h-2.16V8.34z"/>
                        </svg>
                    </a>
                    
                    <!-- Bilibili -->
                    <a href="https://space.bilibili.com/308124" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover" aria-label="Bilibili">
                       <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.8 4.6h.85c1.5.05 2.77 1.35 2.77 2.9v10.37c0 1.63-1.32 2.95-2.95 2.95H5.52c-1.63 0-2.95-1.32-2.95-2.95V7.55c0-1.63 1.32-2.95 2.95-2.95h12.3zM8 1.9l2.23 1.9.24.3H13.6l.2-.24 2.15-1.92c.6-.54.67-1.46.13-2.06-.5-.57-1.38-.63-2-.13L12 1.7 9.87-.27c-.6-.5-1.48-.44-2 .13-.54.6-.47 1.52.13 2.03zM7.22 8.8c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm9.56 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                       </svg>
                    </a>

                    <!-- X (Twitter) -->
                    <a href="https://x.com/2gonode" target="_blank" class="text-gray-300 transition-all duration-300 icon-hover" aria-label="X">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M18.24 2.25h3.3L14.32 10.5l8.5 11.25h-6.65l-5.2-6.82-5.96 6.82H1.68l7.73-8.83L.98 2.25h6.83l4.7 6.23 4.57-6.23h1.16zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/>
                        </svg>
                    </a>
                </div>

            </div>

             <!-- Scroll Indicator - Very Subtle -->
            <div class="absolute bottom-12 animate-bounce cursor-pointer opacity-20 hover:opacity-80 transition-opacity">
                 <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                 </svg>
            </div>
        `;

        return this.element;
    }

    mount() {
        this.initRain();

        const prefix = this.element.querySelector('.prefix');
        const typedQuotes = this.element.querySelector('.typed-quotes');
        const scrollIndicator = this.element.querySelector('.animate-bounce');

        // Initial setup
        prefix.textContent = this.prefixes[0];
        typedQuotes.textContent = this.suffixes[0];
        prefix.classList.add('text-prefix-in');
        typedQuotes.classList.add('text-quotes-in');

        const updateQuote = () => {
            // Soft Fade Out
            prefix.classList.remove('text-prefix-in');
            typedQuotes.classList.remove('text-quotes-in');
            prefix.classList.add('text-out');
            typedQuotes.classList.add('text-out');

            setTimeout(() => {
                this.currentIndex = (this.currentIndex + 1) % this.prefixes.length;
                prefix.textContent = this.prefixes[this.currentIndex];
                typedQuotes.textContent = this.suffixes[this.currentIndex];

                prefix.classList.remove('text-out');
                typedQuotes.classList.remove('text-out');
                prefix.classList.add('text-prefix-in');
                typedQuotes.classList.add('text-quotes-in');

            }, 1200);
        };

        this.quoteInterval = setInterval(updateQuote, 5000); // Even slower

        scrollIndicator.addEventListener('click', () => {
            const nextSection = this.element.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    initRain() {
        const canvas = this.element.querySelector('#rain-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Handle Retina
        const dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        };
        resize();

        const raindrops = [];
        const count = 60; // Sparse rain for airy feel

        class Raindrop {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // Start spread out
            }

            reset() {
                this.x = Math.random() * width;
                this.y = -20;
                this.length = Math.random() * 15 + 5;
                this.speed = Math.random() * 3 + 2; // Slower
                this.opacity = Math.random() * 0.2 + 0.05; // Very faint
            }

            draw() {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + this.length);
                // Subtle blue-gray for white background
                ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            update() {
                this.y += this.speed;
                if (this.y > height) {
                    this.reset();
                }
            }
        }

        for (let i = 0; i < count; i++) {
            raindrops.push(new Raindrop());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            raindrops.forEach(drop => {
                drop.update();
                drop.draw();
            });
            this.rainAnimationId = requestAnimationFrame(animate);
        };

        animate();
        window.addEventListener('resize', resize);
    }
}
