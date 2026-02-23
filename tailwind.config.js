/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        display: ['Archivo Black', 'sans-serif'],
      },
      colors: {
        purple: '#834bf1',
        yellow: '#ffde59',
      }
    },
  },
  plugins: [],
}
