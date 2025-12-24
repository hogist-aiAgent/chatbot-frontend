/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hogist: {
          50: '#fcf5f5',
          100: '#fae8e8',
          500: '#9c4a4a', // Your brand color
          600: '#7d3b3b',
          chat: '#dcf8c6',
        }
      }
    },
  },
  plugins: [],
}