/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2c3e50',
                secondary: '#3498db',
                accent: '#e74c3c',
                text: '#2c3e50',
                bg: '#f8f9fa',
            },
            fontFamily: {
                serif: ['"Noto Serif SC"', 'serif'],
                hand: ['"LXGW WenKai TC"', '"Noto Serif SC"', 'serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
            }
        },
    },
    plugins: [],
}
