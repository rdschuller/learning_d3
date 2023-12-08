/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jasmine: "#F4D58D",
        oxford: "#001427",
        murrey: "#82204A",
        veridian: "#4E937A",
        fawn: "#FFC07F"
      },
      fontFamily: {
        'rozha': ['RozhaOne', 'sans-serif'],
        'questrial': ['Questrial', 'sans-serif']
      }
    },
  },
  plugins: [],
}