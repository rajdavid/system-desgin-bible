/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF9F5',
          100: '#F5F1E9',
          200: '#EADFCB',
        },
        ink: {
          900: '#1A1A1A',
          800: '#2A2A2A',
          700: '#3F3F3F',
          600: '#595959',
          500: '#737373',
          400: '#9A9A9A',
          300: '#C4C4C4',
          200: '#E5E3DE',
          100: '#EFEDE8',
        },
        rust: {
          50: '#FAF0EC',
          100: '#F3D9CF',
          500: '#C4643A',
          600: '#A54F26',
          700: '#843E1C',
        },
        teal: {
          50: '#E5F3EE',
          100: '#C1E3D6',
          500: '#2D8B66',
          600: '#1F6D50',
          700: '#145038',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
