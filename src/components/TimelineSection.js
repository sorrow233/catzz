export default class TimelineSection {
    constructor() {
        this.timelineData = [];
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-[#f9f9f9] py-24 px-4 flex justify-center relative overflow-hidden';

        // Background decoration
        this.element.innerHTML = `
            <div class="absolute right-0 top-0 w-1/3 h-full bg-gray-50 -z-0 transform skew-x-12 opacity-50 pointer-events-none"></div>
            
            <div class="video-container max-w-5xl w-full px-4 md:px-10 relative z-10">
                <div class="mb-16 text-center">
                   <h2 class="text-2xl font-serif font-light tracking-widest text-primary mb-2">TIMELINE</h2>
                   <div class="w-10 h-0.5 bg-primary/20 mx-auto"></div>
                </div>

                <div class="video-list relative flex flex-col gap-16 py-5" id="timeline-list">
                    <!-- Vertical Line -->
                    <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-300 transform md:-translate-x-1/2"></div>
                    
                    <!-- Loading State -->
                     <div class="animate-pulse w-full text-center text-gray-300 font-mono text-sm tracking-wider">Loading history...</div>
                </div>
            </div>
        `;
        return this.element;
    }

    mount() {
        this.fetchData();
    }

    async fetchData() {
        try {
            const response = await fetch('pixiv_data/metadata.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();

            // Filter items that have video links in description
            this.timelineData = data.filter(item => {
                return (item.description && (
                    item.description.includes('bilibili.com') ||
                    item.description.includes('youtu.be') ||
                    item.description.includes('youtube.com')
                ));
            }).map(item => {
                // Extract Link
                let url = '';
                const billiMatch = item.description.match(/https?:\/\/(www\.)?bilibili\.com\/video\/[a-zA-Z0-9]+/);
                const ytMatch = item.description.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/);

                if (billiMatch) url = billiMatch[0];
                else if (ytMatch) url = ytMatch[0];

                // Decode HTML entities in description for clean text
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description;
                const cleanDesc = tempDiv.textContent || tempDiv.innerText || '';

                const dateObj = new Date(item.created_at);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');

                return {
                    id: item.id,
                    title: item.title,
                    date: `${year}.${month}.${day}`,
                    thumbnail: `pixiv_data/${item.local_path}`,
                    url: url,
                    desc: cleanDesc.slice(0, 100) + (cleanDesc.length > 100 ? '...' : '')
                };
            }).sort((a, b) => new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'))); // Newest first

            this.renderItems();
        } catch (e) {
            console.error(e);
            this.element.querySelector('#timeline-list').innerHTML = `<div class="text-center text-gray-400">Failed to load timeline.</div>`;
        }
    }

    renderItems() {
        const list = this.element.querySelector('#timeline-list');

        // If no videos found, clear list
        if (this.timelineData.length === 0) {
            list.innerHTML = `<div class="text-center text-gray-400">No video entries found in metadata.</div>`;
            return;
        }

        list.innerHTML = `
            <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-300 transform md:-translate-x-1/2"></div>
            ${this.timelineData.map((item, index) => {
            const isLeft = index % 2 === 0;
            // Mobile: Always left aligned content (timeline at left)
            // Desktop: Alternating

            return `
                <div class="relative w-full md:w-[calc(50%-40px)] ml-14 md:mx-0 ${isLeft ? 'md:mr-auto md:pr-10 md:text-right' : 'md:ml-auto md:pl-10 md:text-left'} flex flex-col gap-2 group">
                    
                    <!-- Dot on timeline -->
                    <div class="absolute top-0 w-3 h-3 bg-white border-2 border-gray-400 rounded-full z-10 
                        left-[-38px] md:left-auto ${isLeft ? 'md:right-[-46px]' : 'md:left-[-46px]'} 
                        group-hover:border-secondary group-hover:scale-125 transition-all duration-300">
                    </div>

                    <!-- Date & Title Header -->
            <div class="flex items-center gap-4 mb-2">
                <div class="w-3 h-3 rounded-full bg-secondary ring-4 ring-blue-50/50 shrink-0"></div> <!-- Dot -->
                <div>
                     <span class="text-sm font-bold text-gray-400 font-mono block leading-none mb-1">${item.date}</span>
                     <h3 class="text-xl md:text-2xl font-serif text-[#2c3e50] group-hover:text-secondary transition-colors duration-300 cursor-pointer" onclick="window.open('${item.url}', '_blank')">${item.title}</h3>
                </div>
            </div>
                        <p class="text-xs text-gray-500 font-light mt-2 opacity-80 line-clamp-2 max-w-md">
                            ${item.desc}
                        </p>

                    <div class="w-full h-40 md:h-48 mt-3 rounded-sm overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-lg cursor-pointer grayscale group-hover:grayscale-0" onclick="window.open('${item.url}', '_blank')">
                        <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">
                    </div>
                </div>
                `;
        }).join('')}
        `;
    }
}
