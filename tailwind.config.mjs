import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: "#FF6B6B",
        tiffany: "#4ECDC4",
        lemon: "#FFE66D",
        primary: {
          DEFAULT: "#FF6B6B",
          light: "#FF9A8B",
          dark: "#E85555",
        },
        secondary: {
          DEFAULT: "#4ECDC4",
          light: "#7FDED8",
          dark: "#3AAFA9",
        },
        accent: {
          DEFAULT: "#FFE66D",
          light: "#FFF59D",
          dark: "#FFCC33",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF9A8B 0%, #FF6B6B 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, #E85555 0%, #B24242 100%)',
        'gradient-nav': 'linear-gradient(90deg, #4ECDC4 0%, #7FDED8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFE66D 0%, #FFCC33 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.coral"), 0 0 20px theme("colors.coral")',
        'neon-tiffany': '0 0 5px theme("colors.tiffany"), 0 0 20px theme("colors.tiffany")',
        'neon-lemon': '0 0 5px theme("colors.lemon"), 0 0 20px theme("colors.lemon")',
      },
    },
  },
  plugins: [
    heroui(),
    function ({ addUtilities }) {
      const newUtilities = {
        '.no-scrollbar::-webkit-scrollbar': {
          'display': 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};