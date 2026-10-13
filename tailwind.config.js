/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(0.9)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.15)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'float-up': 'floatUp 1.1s ease-out forwards',
        'pop-in': 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    },
  },
  plugins: [],
}
