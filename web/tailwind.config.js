/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e5f5',
          100: '#e1bee7',
          500: '#9c27b0',
          600: '#8e24aa',
          700: '#7b1fa2',
        },
      },
    },
  },
  plugins: [],
};

