/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './auth/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './supabaseClient.ts',
    './store.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          from: { opacity: '0', transform: 'translateY(-5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
