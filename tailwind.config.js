/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0c10',
        'bg-card': '#13131a',
        'bg-card-hover': '#1a1a24',
        'bg-elevated': '#1e1e2a',
        rose: {
          DEFAULT: '#e8556a',
          light: '#f07080',
          dark: '#c93f54',
          muted: 'rgba(232,85,106,0.15)',
          glow: 'rgba(232,85,106,0.3)',
        },
        cream: {
          DEFAULT: '#f0ede8',
          muted: '#b8b4ae',
          dim: '#7a776f',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e0c068',
          muted: 'rgba(201,168,76,0.2)',
        },
        border: {
          DEFAULT: 'rgba(240,237,232,0.08)',
          light: 'rgba(240,237,232,0.15)',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-rose': 'pulseRose 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        pulseRose: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
