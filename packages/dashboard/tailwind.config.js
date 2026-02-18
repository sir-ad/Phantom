/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                matrix: {
                    bg: '#0D1117',
                    card: '#161B22',
                    border: '#30363D',
                    primary: '#00FF41',
                    text: '#E6EDF3',
                    muted: '#8B949E',
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
