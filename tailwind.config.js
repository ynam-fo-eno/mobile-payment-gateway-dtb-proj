/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
          dtb: {
          red: '#991b1b',
          orange: '#f05d22',
          yellow: '#f1b719',
          navy: '#000052',
          white: '#f8f9fa',
          green: "#90EE90",
        },
      },
    },
  },
  plugins: [],
}