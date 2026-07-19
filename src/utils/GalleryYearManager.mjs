import MasonryGrid from './MasonryGrid.mjs';

export function getArtworkYear(createdAt) {
    const year = new Date(createdAt).getUTCFullYear();
    return Number.isInteger(year) ? year : null;
}

export default class GalleryYearManager {
    constructor(container, formatCountLabel) {
        this.container = container;
        this.formatCountLabel = formatCountLabel;
        this.sections = new Map();
    }

    append(year, totalCount, html) {
        const section = this.ensureSection(year, totalCount);
        const previousItemCount = section.grid.children.length;
        section.grid.insertAdjacentHTML('beforeend', html);
        const newItems = Array.from(section.grid.children).slice(previousItemCount);
        section.masonry.syncItems(newItems);
    }

    updateLabels(formatCountLabel = this.formatCountLabel) {
        this.formatCountLabel = formatCountLabel;
        for (const section of this.sections.values()) {
            section.countLabel.textContent = this.formatCountLabel(section.totalCount);
        }
    }

    ensureSection(year, totalCount) {
        if (this.sections.has(year)) return this.sections.get(year);

        const element = document.createElement('section');
        element.className = 'gallery-year-section';
        element.dataset.year = String(year);
        element.innerHTML = `
            <div class="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
                <h3 class="text-3xl md:text-4xl font-serif font-light text-primary leading-none">${year}</h3>
                <span class="gallery-year-count text-[10px] md:text-xs font-mono text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap"></span>
                <div class="h-px flex-1 bg-primary/10"></div>
            </div>
            <div class="gallery-masonry grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>
        `;

        const grid = element.querySelector('.gallery-masonry');
        const countLabel = element.querySelector('.gallery-year-count');
        const masonry = new MasonryGrid(grid);
        const section = { element, grid, countLabel, masonry, totalCount };
        countLabel.textContent = this.formatCountLabel(totalCount);

        const nextSection = Array.from(this.container.children).find(child => {
            return Number(child.dataset.year) < year;
        });
        this.container.insertBefore(element, nextSection || null);
        masonry.connect();
        this.sections.set(year, section);
        return section;
    }
}
