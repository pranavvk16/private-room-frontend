/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui"],
        body: ['"Inter"', "ui-sans-serif", "system-ui"],
      },
      colors: {
        dusk: {
          900: "#0b1021",
          800: "#111735",
          700: "#1c244d",
          600: "#263262",
          500: "#3a4a88",
        },
      },
    },
  },
  plugins: [],
};
