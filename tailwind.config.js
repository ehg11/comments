/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sorabold: ["Sora-Bold", "sans-serif"],
        sora: ["Sora", "sans-serif"],
      },
      colors: {
        'light': '#F6F6F7',
        'light_accent': '#61AFA9',
        'main': '#989692',
        'dark_accent': '#92939D',
        'dark': '#474752',
        'primary': '#989692',
        'important': '#474752',
        'success': '#63a864',
        'warning': '#e0972c',
        'danger': '#f44336',
      },
      transitionProperty: {
        'size':'width, height',
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/3': '33%',
        '1/2': '50%',
        '3/4': '75%',
        '5/6': '83.33333%',
        'full': '100%',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("child", "& > *")
    }
  ],
}