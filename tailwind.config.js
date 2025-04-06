/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E40AF",
        accent: "#60A5FA",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 