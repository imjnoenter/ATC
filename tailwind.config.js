/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        beige: '#F0EBE3',
        'warm-gray': '#8B8480',
        'warm-gray-light': '#C5C0BB',
        'warm-gray-dark': '#5A5450',
        accent: '#7A9E7E',
        'accent-light': '#A8C4AB',
        'accent-dark': '#5C7E60',
        'blue-soft': '#8BA7C7',
        'blue-light': '#B8CCDE',
        danger: '#C47A7A',
        'danger-light': '#E8B4B4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        cozy: '0 2px 12px 0 rgba(139,132,128,0.10)',
        'cozy-md': '0 4px 20px 0 rgba(139,132,128,0.14)',
      },
    },
  },
  plugins: [],
}
