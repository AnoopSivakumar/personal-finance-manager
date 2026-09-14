/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3ef',
          100: '#dce9e3',
          500: '#173c35',
          600: '#24584e',
          700: '#102d28',
        },
        paper: '#f5f3ed',
        cream: '#fffdf7',
        ink: '#173c35',
        sage: '#b5c9c0',
        lime: '#d9f36b',
        'lime-hover': '#c8e45b',
        terracotta: '#b56a35',
        peach: '#f2a56e',
        'expense-soft': '#f5c5a2',
        line: '#d9d7cf',
      },
    },
  },
  plugins: [],
};
