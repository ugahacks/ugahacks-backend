/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      screens: {
        'smh': {'raw': '(max-height: 668px))'} // from here: https://stackoverflow.com/questions/61915143/how-can-i-apply-a-media-query-to-height-and-width-using-tailwind
      },
    },
  },
  plugins: [],
}
