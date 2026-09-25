/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#061C16',
          900: '#072b22',
          800: '#064e3b',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          200: '#a7f3d0',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        brand: {
          deep: '#061C16',
          primary: '#00A86B',
          accent: '#19C37D',
          soft: '#E8F8F0',
          canvas: '#F7FAF8',
          card: '#FFFFFF',
          text: '#111827',
          muted: '#8A9298',
        },
        energy: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#00A86B',
          bright: '#19C37D',
          rose: '#f43f5e',
          indigo: '#6366f1',
          violet: '#8b5cf6'
        }
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '28px',
        'canvas': '32px',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(15, 45, 30, 0.05)',
        'card-hover': '0 14px 40px rgba(15, 45, 30, 0.09)',
        'emerald-glow': '0 4px 20px rgba(0, 168, 107, 0.25)',
        'emerald-glow-lg': '0 8px 30px rgba(0, 168, 107, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
