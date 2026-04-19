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
          50:  '#08080A',
          100: '#0E0E11',
          200: '#141418',
          300: '#1A1A1F',
          400: '#222228',
          500: '#2E2E36',
          600: '#44444F',
          700: '#6B6B7A',
          800: '#9A9AAD',
          900: '#E8E4DC',
        },
        cream: {
          50: '#FDFCF9',
          100: '#F7F4ED',
          200: '#EADFCB',
        },
        ink: {
          900: '#171717',
          800: '#262626',
          700: '#3B3B3B',
          600: '#555555',
          500: '#707070',
          400: '#969696',
          300: '#BFBFBF',
          200: '#E2E0DB',
          100: '#F0EDE7',
        },
        rust: {
          50: '#FEF3EE',
          100: '#FCDFC9',
          200: '#F5B896',
          300: '#EE9468',
          400: '#E57A47',
          500: '#D4643A',
          600: '#B84E26',
          700: '#8E3B1A',
        },
        teal: {
          50: '#ECFDF5',
          100: '#C6F6D5',
          200: '#7BE0A8',
          300: '#3CB880',
          400: '#2A9D6E',
          500: '#1E7A54',
          600: '#165E3F',
          700: '#104530',
        },
        accent: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'confetti': 'confetti 0.8s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 100, 58, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(212, 100, 58, 0.5)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: 1 },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: 0 },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(212, 100, 58, 0.15)',
        'glow-md': '0 0 30px rgba(212, 100, 58, 0.2)',
        'glow-lg': '0 0 60px rgba(212, 100, 58, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
