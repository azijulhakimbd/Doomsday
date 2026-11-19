/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#080d18",
        panel: "#111a2a",
        accent: "#b91c1c",
        gold: "#f5c56a",
      },
    },
  },
  plugins: [],
};
