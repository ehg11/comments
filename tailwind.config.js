/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    minHeight: {
      '0': '0',
      '1/4': '25%',
      '1/3': '33%',
      '1/2': '50%',
      '3/4': '75%',
      'full': '100%',
    },
    extend: {
      fontFamily: {
        sorabold: ["Sora-Bold", "sans-serif"],
        sora: ["Sora", "sans-serif"],
      }
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("child", "& > *")
    }
  ],
}