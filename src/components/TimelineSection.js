export default class TimelineSection {
    constructor() {
        this.videos = [
            {
                title: "-The Waiting- 绘画过程",
                thumbnail: "https://pic.k-on.live/file/1735115804878_screenshot-225.795.png",
                date: "2024-06-11",
                url: "https://www.bilibili.com/video/BV1ss421u7Bg/"
            },
            {
                title: "【创作】深夜画画时光",
                thumbnail: "",
                date: "2024-01-10",
                url: "" // Handle empty URL gracefully if needed
            }
        ];
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'w-full min-h-screen bg-bg py-20 px-5 flex justify-center';

        this.element.innerHTML = `
            <div class="video-container max-w-6xl w-full px-5 md:px-20 relative">
                <div class="video-list relative flex flex-col gap-10 py-5">
                    <!-- Vertical Line -->
                    <div class="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:-translate-x-1/2"></div>
                    
                    ${this.videos.map((video, index) => this.renderVideoItem(video, index)).join('')}
                </div>
            </div>
        `;
        return this.element;
    }

    renderVideoItem(video, index) {
        // Handle empty thumbnail or URL
        const hasUrl = video.url && video.url.length > 0;
        const cursorClass = hasUrl ? 'cursor-pointer hover:-translate-y-1.5' : 'cursor-default opacity-80';
        const displaySide = index % 2 === 0 ? 'md:ml-auto md:text-left' : 'md:mr-auto md:text-right md:flex-row-reverse';
        // Connectors
        const connectorSide = index % 2 === 0 ? 'md:-left-10' : 'md:-right-10';
        // On mobile, everything is left aligned, line is at left-5.
        // Item is w-full pl-10.

        return `
            <div class="video-item w-full md:w-[calc(50%-40px)] ml-10 md:mx-0 flex flex-col gap-2 relative transition-transform duration-300 ${cursorClass} ${index % 2 !== 0 ? 'md:items-end' : ''} ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}" 
                 ${hasUrl ? `onclick="window.open('${video.url}', '_blank')"` : ''}>
                
                <!-- Connector Line (Desktop) -->
                <div class="hidden md:block absolute top-[100px] w-10 h-0.5 bg-gray-400 ${connectorSide}"></div>
                
                <!-- Connector Line (Mobile) -->
                <div class="block md:hidden absolute top-[80px] -left-10 w-5 h-0.5 bg-gray-400"></div>

                <div class="video-info mb-2 ${index % 2 !== 0 ? 'md:text-right' : 'text-left'}">
                    <h3 class="text-sm font-medium text-primary leading-tight hover:text-secondary transition-colors">${video.title}</h3>
                    <span class="text-xs text-gray-500 leading-tight">${video.date}</span>
                </div>

                <div class="video-thumbnail w-full h-48 md:h-[196px] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-gray-100">
                    ${video.thumbnail ?
                `<img src="${video.thumbnail}" alt="${video.title}" loading="lazy" class="w-full h-full object-cover">` :
                `<div class="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 font-light">No Preview</div>`
            }
                </div>
            </div>
        `;
    }
}
