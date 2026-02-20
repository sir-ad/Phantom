/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                background: '#09090b',
                foreground: '#e4e4e7',
                primary: '#22c55e',
                secondary: '#f59e0b',
                muted: '#27272a',
                'muted-foreground': '#a1a1aa',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'blink': 'blink 1s step-end infinite',
            },
            keyframes: {
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [],
};
