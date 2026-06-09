/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Dark palette drawn from the Wellness Billion podcast logo:
      // deep navy background, electric-blue accent, warm cream text.
      // Token names are kept as roles (paper = page surface, ink = primary
      // text, terracotta = primary accent) even though the values are now cool.
      colors: {
        paper: '#0C1E38', // page background, deep navy
        sand: '#15294A', // raised surface / alt sections / cards (lighter navy)
        navy: '#091627', // deepest band (gradients, footers)
        ink: '#F4ECDB', // primary text / headings, warm cream
        cream: '#F4ECDB', // explicit light token for text/elements on accent
        body: '#AAB6C9', // secondary text, muted slate-blue
        terracotta: {
          DEFAULT: '#2F8FE2', // primary accent, electric blue (the "BILLION" blue)
          hover: '#4AA3EE', // brighter blue for link/hover
        },
        gold: '#5FB1EE', // secondary accent, light azure (used sparingly)
        line: '#2A4670', // borders / rules on dark
        teal: '#14BEC1', // cool whisper accent for tiny details only
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
        // Deep shadows for the dark theme.
        soft: '0 18px 40px -24px rgba(3, 8, 18, 0.7)',
        lift: '0 28px 60px -28px rgba(3, 8, 18, 0.85)',
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
