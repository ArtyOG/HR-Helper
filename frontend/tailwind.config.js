/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#314a3d',
          dark: '#163726',
          light: '#7A3468',
        },
        teal: {
          DEFAULT: '#23737A',
          dark: '#1B5A60',
        },
        gold: '#F4BB2D',
        ice: '#b3f9f5',
        social: '#1877F2',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
};
