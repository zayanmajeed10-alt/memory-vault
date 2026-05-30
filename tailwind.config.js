/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#0a0a0b',
          900: '#121214',
          800: '#1c1c1f',
          100: '#e4e4e7',
          50: '#fafafa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'], 
      },
      animation: {
        'ambient-shift': 'ambient 15s ease-in-out infinite',
      },
      keyframes: {
        ambient: {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)', opacity: '0.3' },
          '50%': { transform: 'scale(1.05) translate(20px, -20px)', opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}