/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#000000',
          secondary: '#111111',
          card: '#1a1a1a',
          surface: '#1c1c1c',
        },
        accent: {
          yellow: '#F5C518',
          'yellow-dark': '#D4A916',
          green: '#4CAF50',
          red: '#E53935',
          blue: '#2196F3',
          purple: '#9C27B0',
          orange: '#FF9800',
        },
        surface: {
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.06)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#888888',
          muted: '#555555',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
