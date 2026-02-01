/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'system-bg': '#000000',
        'system-text': '#FFFFFF',
        'system-border': '#FFFFFF',
        'system-hover': '#1a1a1a',
        'system-active': '#2a2a2a',
      },
    },
  },
  plugins: [],
}
