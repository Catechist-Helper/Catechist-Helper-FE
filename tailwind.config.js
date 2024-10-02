/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#422A14",
        text_primary_light: "#fff",
        text_primary_dark: "#000",
      },
    },
  },
  plugins: [],
};
