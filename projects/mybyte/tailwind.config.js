const colors = require('tailwindcss/colors');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'sm':	'640px',
      'md':	'768px',
      'lg':	'1024px',
      'xl':	'1280px',
      '2xl':	'1536px',
      'smh': {'raw': '(min-height: 668px)'}, // from here: https://stackoverflow.com/questions/61915143/how-can-i-apply-a-media-query-to-height-and-width-using-tailwind
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: colors.red,
      },
    },
  },
  plugins: [],
}
