/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50'
        },
        secondary: {
          DEFAULT: '#81C784',
          light: '#A5D6A7'
        },
        bg: {
          DEFAULT: '#F8FCF8'
        },
        gold: '#C9971F'
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(46, 125, 50, 0.12)',
        card: '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 32px rgba(46,125,50,0.16)'
      },
      backdropBlur: {
        glass: '16px'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out both',
        float: 'float 4s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
