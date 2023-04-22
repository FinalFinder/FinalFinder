/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "gray-1": "#212121",
        "gray-2": "#1C1C1C",
        "cyan-1": "#009999",
        "cyan-2": "#006666",
        blue: "#1C4F82",
        orange: "#CF6708",
        yellow: "#FFB800"
      },
      fontFamily: {
        "secular-one": ["var(--font-secular-one)", "serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
