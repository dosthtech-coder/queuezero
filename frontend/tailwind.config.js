/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    teal: '#005f73',
                    navy: '#0a9396',
                    dark: '#001219',
                    orange: '#bb3e03',
                    warning: '#ee9b00'
                }
            },
            fontFamily: {
                sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
