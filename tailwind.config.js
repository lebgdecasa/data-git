/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Warm editorial color tokens for The Wellness Billion.
      colors: {
        paper: '#FBF7F0', // page background, warm bone
        sand: '#F3EADC', // cards / alt sections
        ink: '#241F1B', // headings, espresso
        body: '#4A423B', // body text, warm brown-grey
        terracotta: {
          DEFAULT: '#C2603A', // primary accent / buttons
          hover: '#A84E2C',
        },
        gold: '#D9A441', // secondary accent, used sparingly
        line: '#E4D9C8', // borders / rules
        teal: '#14BEC1', // EPI teal, cool whisper accent for tiny details only
      },
      fontFamily: {
        // Display serif carries the editorial feel.
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        // Warm humanist sans for body + UI.
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        // Soft warm shadows.
        soft: '0 18px 40px -24px rgba(36, 31, 27, 0.35)',
        lift: '0 28px 60px -28px rgba(36, 31, 27, 0.45)',
      },
      maxWidth: {
        editorial: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
}
