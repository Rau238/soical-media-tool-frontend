const plugin = require('tailwindcss/plugin');

module.exports = {
  content:  ["./src/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'frontend': {
          primary: 'var(--frontend-primary)',
          secondary: 'var(--frontend-secondary)',
          accent: 'var(--frontend-accent)',
          background: 'var(--frontend-background)',
          foreground: 'var(--frontend-foreground)',
          muted: 'var(--frontend-muted)',
          'muted-foreground': 'var(--frontend-muted-foreground)',
          border: 'var(--frontend-border)',
          dark: 'var(--frontend-dark)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
				heading: ['Poppins', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-frontend': 'linear-gradient(to top, #cc208e 0%, #6713d2 100%)',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        'bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.5s ease-out',
        'slide-out': 'slide-out 0.5s ease-in',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--frontend-foreground)',
            h1: { fontFamily: 'Montserrat, sans-serif' },
            h2: { fontFamily: 'Montserrat, sans-serif' },
            h3: { fontFamily: 'Montserrat, sans-serif' },
          },
        },
      },
    },
  },

};
