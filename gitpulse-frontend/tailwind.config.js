/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e1e7ff',
          200: '#c8d2ff',
          300: '#a2b3ff',
          400: '#758aff',
          500: '#485bff',
          600: '#2c39ff',
          700: '#1b22ff',
          800: '#151bce',
          900: '#151ca3',
          950: '#0b0c60',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
