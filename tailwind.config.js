/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        aeropay: {
          dark: '#7A131A',
          red: '#A51C24',
          accent: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
