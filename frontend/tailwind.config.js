/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brandPrimary: '#1D4ED8',
        brandSecondary: '#9333EA',
        brandAccent: '#F59E0B',
        brandNeutral: {
          DEFAULT: '#374151',
          dark: '#9CA3AF',
        },
        status: {
          notStarted: 'gray.500',
          workingOnIt: 'yellow.500',
          complete: 'green.500'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        'status-check': 'status-check 0.3s ease-in-out',
      },
      keyframes: {
        'status-check': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

