import type { Config } from 'tailwindcss'

// House Zine tokens. Hex values mirror the CSS variables in app/globals.css
// (hex here so Tailwind opacity modifiers like bg-riso-yellow/50 work).
const config: Config = {
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1F1EC',
        slip: '#FAFAF7',
        'riso-blue': '#2F4FA2',
        'riso-pink': '#FF4FA3',
        'riso-yellow': '#FFE14A',
        ink: '#1B2350',
        // Errors on paper: the blue ink's warm sibling (about 9:1 on paper).
        'riso-red': '#B3203E',
      },
      fontFamily: {
        display: ['var(--font-anybody)', 'Impact', 'sans-serif'],
        body: ['var(--font-literata)', 'Georgia', 'serif'],
        hand: ['var(--font-reenie)', 'cursive'],
      },
      transitionTimingFunction: {
        zine: 'cubic-bezier(0.22,1,0.36,1)',
      },
      maxWidth: {
        read: '68ch',
      },
    },
  },
  plugins: [],
}

export default config
