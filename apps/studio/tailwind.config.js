/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#0a0c10',
        charcoal: '#12151b',
        glass: 'rgba(255, 255, 255, 0.05)',
        accent: '#38bdf8'
      }
    }
  },
  plugins: []
}
