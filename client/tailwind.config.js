/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        left: '#3b82f6',   // blue-500
        right: '#ef4444',  // red-500
        center: '#8b5cf6', // violet-500
      },
    },
  },
  plugins: [],
};
