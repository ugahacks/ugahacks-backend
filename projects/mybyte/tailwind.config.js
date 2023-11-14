const colors = require("tailwindcss/colors");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      smh: { raw: "(min-height: 668px)" }, // from here: https://stackoverflow.com/questions/61915143/how-can-i-apply-a-media-query-to-height-and-width-using-tailwind
    },
    extend: {
      letterSpacing: {
        "5px": "5px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      colors: {
        primary: {
          50: "#FEEDEC",
          100: "#FDDCD9",
          200: "#FBBDB7",
          300: "#F89990",
          400: "#F67A6F",
          500: "#F4574A",
          600: "#F0210F",
          700: "#B2190B",
          800: "#781107",
          900: "#3A0804",
          950: "#1D0402",
        },
      },
    },
  },
  plugins: [],
};
