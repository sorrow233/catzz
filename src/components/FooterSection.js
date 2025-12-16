export default class FooterSection {
    render() {
        this.element = document.createElement('footer');
        this.element.className = 'w-full py-10 bg-bg flex justify-center items-center text-xs text-gray-400 font-light tracking-wider';
        this.element.innerHTML = `
            <p>&copy; ${new Date().getFullYear()} Catzz. All rights reserved.</p>
        `;
        return this.element;
    }
}
