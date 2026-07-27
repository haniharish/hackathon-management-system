/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#01472e',
        sage: '#ccd5ae',
        olive: '#e9edc9',
        cream: '#fefae0',
        moss: '#a3b18a',
      },
      boxShadow: {
        premium: '0 30px 80px rgba(1, 71, 46, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
