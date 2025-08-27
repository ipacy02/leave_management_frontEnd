  /** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customColor: "#EB8921",
        cardcolor: "#1B5A8B",
        HeaderColor: "#1b5a8b",
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
        categorycard: '#45a99b',
      },
    },
    fontFamily: {
      body: ["Poppins", "CustomFont"],
    },
  },
  
  darkMode: 'class', // Enable dark mode using the 'class' option
  variants: {},
  plugins: [],
};