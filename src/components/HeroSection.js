export default class HeroSection {
    constructor() {
        this.prefixes = ["清凉雨夜", "脆弱雨伞", "街边电话", "路旁雨滩"];
        this.suffixes = ["温暖过谁的心", "保护了谁前行", "少女心伤忧郁", "天空触手可及"];
        this.currentIndex = 0;
        this.poemShown = false;
        this.intervalId = null;
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full h-screen bg-white flex flex-col justify-between items-center relative overflow-hidden p-0';

        this.element.innerHTML = `
            <div class="flex-1 w-full flex flex-col justify-center items-center mt-[10vh]">
                <h1 class="text-5xl font-light tracking-[0.2em] opacity-80 mb-5 font-serif text-primary">Catzz</h1>
                
                <p class="slogon text-base tracking-[0.1em] opacity-60 mt-2 font-mono h-[1.5em] relative flex justify-center items-center">
                    <span class="prefix inline-block min-w-[4em] text-right mr-2 opacity-0"></span>
                    <span class="typed-quotes inline-block min-w-[8em] text-left ml-2 opacity-0"></span>
                </p>

                <div class="poem-container mt-10 opacity-0 pointer-events-none flex flex-col items-center">
                    <p class="poem-line text-base my-2 opacity-0 font-hand text-text transform translate-y-5">人应阳光向上，但原谅时而脆弱</p>
                    <p class="poem-line text-base my-2 opacity-0 font-hand text-text transform translate-y-5">雨水是否协同音律，夜色或否夹杂酒精</p>
                    <p class="poem-line text-base my-2 opacity-0 font-hand text-text transform translate-y-5">忧郁的梦没有终点，她又以何种姿态存在着</p>
                </div>

                <div class="social-container mt-10 opacity-0 pointer-events-none transition-opacity duration-300 flex flex-col items-center gap-5">
                    <div class="social-icons flex justify-center gap-5 mt-10">
                        <a href="https://www.pixiv.net/tags/catzz/artworks?s_mode=s_tag" target="_blank" class="block w-10 h-10 hover:scale-110 transition-transform social-icon opacity-0">
                            <img src="https://pic.k-on.live/file/1739126210411_pixiv-computer-icons-fan-art-clip-art-others-3b77f70b6ecc2d7ca1740f8eddf55c2d.png" alt="Pixiv" class="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity">
                        </a>
                        <a href="https://space.bilibili.com/308124" target="_blank" class="block w-10 h-10 hover:scale-110 transition-transform social-icon opacity-0">
                            <img src="https://pic.k-on.live/file/1739126150560_image.png" alt="Bilibili" class="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity">
                        </a>
                        <a href="https://x.com/2gonode" target="_blank" class="block w-10 h-10 hover:scale-110 transition-transform social-icon opacity-0">
                            <img src="https://pic.k-on.live/file/1739126238987_image.png" alt="X" class="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity">
                        </a>
                    </div>
                </div>
            </div>

            <div class="bottom-group flex flex-col items-center mb-8 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div class="scroll-indicator animate-bounce-slow opacity-60 cursor-pointer p-2">
                    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-primary">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                </div>
                <div class="bottom-text text-sm opacity-60 whitespace-nowrap tracking-wider text-center text-[#8e8e8e] font-light font-hand mt-2">
                    雨夜、忧郁、少女
                </div>
            </div>
        `;

        return this.element;
    }

    mount() {
        this.cacheDOM();
        this.initAnimations();
        this.bindEvents();
    }

    cacheDOM() {
        this.prefixEl = this.element.querySelector('.prefix');
        this.quotesEl = this.element.querySelector('.typed-quotes');
        this.poemContainer = this.element.querySelector('.poem-container');
        this.poemLines = this.element.querySelectorAll('.poem-line');
        this.socialContainer = this.element.querySelector('.social-container');
        this.scrollIndicator = this.element.querySelector('.scroll-indicator');
    }

    bindEvents() {
        this.scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }

    initAnimations() {
        // Initial state
        this.prefixEl.textContent = this.prefixes[0];
        this.quotesEl.textContent = this.suffixes[0];

        this.prefixEl.classList.add('animate-melancholy-in-prefix');
        this.quotesEl.classList.add('animate-melancholy-in-quotes');

        this.startTypingLoop();
    }

    startTypingLoop() {
        this.intervalId = setInterval(() => {
            this.updateQuote();
        }, 3000);
    }

    updateQuote() {
        // Fade out
        this.prefixEl.classList.remove('animate-melancholy-in-prefix');
        this.quotesEl.classList.remove('animate-melancholy-in-quotes');

        this.prefixEl.classList.add('animate-melancholy-out');
        this.quotesEl.classList.add('animate-melancholy-out');

        setTimeout(() => {
            // Update text
            this.currentIndex = (this.currentIndex + 1) % this.prefixes.length;
            this.prefixEl.textContent = this.prefixes[this.currentIndex];
            this.quotesEl.textContent = this.suffixes[this.currentIndex];

            // Reset classes for fade in
            this.prefixEl.classList.remove('animate-melancholy-out');
            this.quotesEl.classList.remove('animate-melancholy-out');

            this.prefixEl.classList.add('animate-melancholy-in-prefix');
            this.quotesEl.classList.add('animate-melancholy-in-quotes');

            // Trigger poem sequence once at end of loop
            if (this.currentIndex === this.prefixes.length - 1 && !this.poemShown) {
                this.poemShown = true;
                setTimeout(() => this.showPoem(), 2000);
            }
        }, 1200); // Match CSS animation duration
    }

    showPoem() {
        this.poemContainer.style.opacity = '1';
        this.poemContainer.style.pointerEvents = 'auto'; // Make interactive if needed
        this.poemContainer.classList.add('transition-opacity', 'duration-1000');

        // Fade in lines
        this.poemLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('animate-fade-in-line');
            }, index * 2000);
        });

        const totalDuration = this.poemLines.length * 2000 + 5000;

        // Fade out lines & show social
        setTimeout(() => {
            this.poemLines.forEach((line, index) => {
                setTimeout(() => {
                    line.classList.remove('animate-fade-in-line');
                    line.classList.add('animate-fade-out-line');
                }, index * 300);
            });

            setTimeout(() => {
                this.poemContainer.style.display = 'none';
                this.socialContainer.classList.remove('opacity-0', 'pointer-events-none');
                this.socialContainer.classList.add('opacity-100', 'pointer-events-auto');

                // Animate icons
                const icons = this.socialContainer.querySelectorAll('.social-icon');
                icons.forEach((icon, idx) => {
                    setTimeout(() => {
                        icon.classList.add('animate-show-icon');
                    }, idx * 200);
                });
            }, 1000);
        }, totalDuration);
    }
}
