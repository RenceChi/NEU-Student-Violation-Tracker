/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neu: {
          red:     "#C8102E",
          navy:    "#1a1a2e",
          gold:    "#F5A623",
          surface: "#F7F7F8",
          muted:   "#6B7280",
        },
      },
    },
  },
  plugins: [],
};