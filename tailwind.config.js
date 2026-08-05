/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
          dtb: {
          red: '#d2232a',
          orange: '#f05d22',
          yellow: '#f1b719',
          navy: '#1d252d',
          white: '#f8f9fa'
        },
      },
    },
  },
  plugins: [],
}