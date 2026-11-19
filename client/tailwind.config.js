/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        doom: {
          dark: '#070a0e',
          surface: '#0f1723',
          card: '#141f2e',
          border: '#1f2d42',
          emerald: '#10b981',
          emeraldGlow: '#059669',
          gold: '#f59e0b',
          crimson: '#e11d48',
          accent: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cinematic: ['Cinzel', 'Trajan Pro', 'serif'],
      },
      boxShadow: {
        'doom-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'crimson-glow': '0 0 25px -5px rgba(225, 29, 72, 0.35)',
      },
    },
  },
  plugins: [],
};
