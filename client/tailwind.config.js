/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a28',
          card: '#16161f',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          violet: '#6c63ff',
          'violet-dim': '#4f48cc',
          coral: '#ff6b6b',
          gold: '#ffd700',
          green: '#4ade80',
          blue: '#60a5fa',
        },
        surface: {
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.05)',
        },
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #6c63ff, #a855f7)',
        'gradient-coral': 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
        'gradient-card': 'linear-gradient(180deg, rgba(108,99,255,0.1) 0%, rgba(10,10,15,0) 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(108,99,255,0.2)',
        'glow-violet': '0 0 20px rgba(108,99,255,0.4)',
        'glow-green': '0 0 16px rgba(74,222,128,0.4)',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
