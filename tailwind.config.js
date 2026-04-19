/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          50:  '#0C0C0D',
          100: '#111113',
          200: '#18181B',
          300: '#202023',
          400: '#2A2A2E',
          500: '#3A3A40',
          600: '#52525E',
          700: '#71717E',
          800: '#A0A0B2',
          900: '#E4E0D8',
        },
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
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'confetti': 'confetti 0.8s ease-out forwards',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(196, 100, 58, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(196, 100, 58, 0.6)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: 1 },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: 0 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
