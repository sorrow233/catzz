export class RainEffect {
    constructor(containerElement) {
        this.container = containerElement;
        this.canvas = null;
        this.ctx = null;
        this.raindrops = [];
        this.animationId = null;
        this.dpr = window.devicePixelRatio || 1;
        this.isIntersecting = true;
        this.isPageVisible = !document.hidden;
        this.observer = null;

        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        this.handleVisibility = this.handleVisibility.bind(this);

        this.init();
    }

    init() {
        // Create canvas if it doesn't exist
        let canvas = this.container.querySelector('#rain-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'rain-canvas';
            canvas.className = 'absolute inset-0 z-50 pointer-events-none w-full h-full opacity-60';
            // Insert as first child or append if empty
            if (this.container.firstChild) {
                this.container.insertBefore(canvas, this.container.firstChild);
            } else {
                this.container.appendChild(canvas);
            }
        }
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('resize', this.resize);
        document.addEventListener('visibilitychange', this.handleVisibility);
        this.resize();

        this.createRaindrops();
        this.observeVisibility();
        this.syncAnimation();
    }

    resize() {
        if (!this.canvas) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        // Update drops width limit
        if (this.raindrops) {
            this.raindrops.forEach(d => d.w = this.width);
        }
    }

    observeVisibility() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver(([entry]) => {
            this.isIntersecting = entry.isIntersecting;
            this.syncAnimation();
        });
        this.observer.observe(this.container);
    }

    handleVisibility() {
        this.isPageVisible = !document.hidden;
        this.syncAnimation();
    }

    syncAnimation() {
        if (this.isIntersecting && this.isPageVisible) {
            if (this.animationId === null) this.animationId = requestAnimationFrame(this.animate);
            return;
        }

        if (this.animationId !== null) cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }

    createRaindrops() {
        this.raindrops = [];
        const count = 80;

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

        for (let i = 0; i < count; i++) {
            this.raindrops.push(new Raindrop(this.width, this.height));
        }
    }

    animate() {
        this.animationId = null;
        if (!this.ctx || !this.isIntersecting || !this.isPageVisible) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.raindrops.forEach(d => {
            d.w = this.width;
            d.update(this.height);
            d.draw(this.ctx);
        });
        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        if (this.animationId !== null) cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.observer?.disconnect();
        window.removeEventListener('resize', this.resize);
        document.removeEventListener('visibilitychange', this.handleVisibility);
    }
}
