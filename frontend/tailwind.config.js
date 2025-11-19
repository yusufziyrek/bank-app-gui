/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1162d4',
        secondary: '#28A745',
        accent: '#DC3545',
        'background-light': '#f6f7f8',
        'background-dark': '#101822',
        'surface-light': '#ffffff',
        'surface-dark': '#1a2431',
        'neutral-light-bg': '#E9ECEF',
        'neutral-dark-bg': '#212529',
        'neutral-text-light': '#212529',
        'neutral-text-dark': '#F8F9FA',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

