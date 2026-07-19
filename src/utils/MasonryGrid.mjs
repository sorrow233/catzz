export function calculateMasonrySpan(contentHeight, rowHeight, rowGap) {
    if (![contentHeight, rowHeight, rowGap].every(Number.isFinite) || rowHeight <= 0) {
        return 1;
    }

    return Math.max(1, Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap)));
}

export default class MasonryGrid {
    constructor(grid) {
        this.grid = grid;
        this.frameId = null;
        this.lastWidth = 0;
        this.resizeObserver = null;
        this.handleImageEvent = this.handleImageEvent.bind(this);
    }

    connect() {
        this.grid.addEventListener('load', this.handleImageEvent, true);
        this.grid.addEventListener('error', this.handleImageEvent, true);

        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                const width = entries[0]?.contentRect.width || 0;
                if (Math.abs(width - this.lastWidth) < 1) return;
                this.lastWidth = width;
                this.scheduleAll();
            });
            this.resizeObserver.observe(this.grid);
        } else {
            window.addEventListener('resize', () => this.scheduleAll(), { passive: true });
        }
    }

    syncItems(items) {
        for (const item of items) {
            const image = item.querySelector('img');
            if (!image?.complete) continue;

            if (image.naturalWidth > 0) {
                item.classList.remove('opacity-0');
                this.resizeItem(item);
            } else {
                item.hidden = true;
            }
        }
    }

    handleImageEvent(event) {
        if (!(event.target instanceof HTMLImageElement)) return;
        const item = event.target.closest('.gallery-item');
        if (!item) return;

        if (event.type === 'error') {
            item.hidden = true;
            return;
        }

        item.classList.remove('opacity-0');
        this.resizeItem(item);
    }

    scheduleAll() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = requestAnimationFrame(() => {
            this.frameId = null;
            this.grid.querySelectorAll('.gallery-item:not([hidden])').forEach(item => {
                this.resizeItem(item);
            });
        });
    }

    resizeItem(item) {
        const content = item.firstElementChild;
        if (!content) return;

        const gridStyle = getComputedStyle(this.grid);
        const rowHeight = Number.parseFloat(gridStyle.gridAutoRows);
        const rowGap = Number.parseFloat(gridStyle.rowGap) || 0;
        const contentHeight = content.getBoundingClientRect().height;
        item.style.gridRowEnd = `span ${calculateMasonrySpan(contentHeight, rowHeight, rowGap)}`;
    }
}
