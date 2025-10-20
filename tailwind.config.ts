import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // CRITICAL - Enable dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'float-slow': 'float 20s ease-in-out infinite',
        'float-slower': 'float 25s ease-in-out infinite',
        'float-reverse': 'float 22s ease-in-out infinite reverse',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'gridMove': 'gridMove 20s linear infinite',
        'floatRandom': 'floatRandom 20s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(5deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(-5deg)' },
        },
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        floatRandom: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, -20px)' },
          '50%': { transform: 'translate(-15px, 15px)' },
          '75%': { transform: 'translate(15px, 10px)' },
        },
      },
      colors: {
        elegant: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1a1a',
        },
        cinema: {
          bg: '#0a0a0a',
          accent: '#e50914',
          gold: '#ffd700',
        },
        editorial: {
          bg: '#ffffff',
          text: '#1a1a1a',
          accent: '#2563eb',
        },
        terminal: {
          bg: '#0d1117',
          green: '#00ff41',
          blue: '#58a6ff',
          purple: '#bc8cff',
        },
        journal: {
          bg: '#fef6e4',
          accent: '#f582ae',
          text: '#001858',
        },
      },
    },
  },
  plugins: [],
}
export default config
