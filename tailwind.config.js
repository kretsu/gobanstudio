/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        goban: {
          light: '#f5deb3',
          wood: '#e8c187',
          kaya: '#dfb170',
          darkwood: '#c7924d',
          dark: '#1e2024',
          panel: '#282c34',
        }
      },
      boxShadow: {
        'stone-black': '2px 3px 5px rgba(0, 0, 0, 0.6), inset 1px 1px 3px rgba(255, 255, 255, 0.25)',
        'stone-white': '2px 3px 5px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.9)',
        'board': '0 20px 40px -15px rgba(0,0,0,0.5), 0 0 1px 1px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
}
