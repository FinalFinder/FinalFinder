/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "gray-1": "#212121",
        "gray-2": "#1C1C1C",
      },
      fontFamily: {
        "secular-one": ["var(--font-secular-one)", "serif"],
      },
    },
  },
  plugins: [],
};
