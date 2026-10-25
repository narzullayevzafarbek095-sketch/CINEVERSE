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
        cine: {
          bg: '#08090D',
          card: '#12141C',
          cardHover: '#181C27',
          panel: '#161922',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(139, 92, 246, 0.4)',
          violet: '#8B5CF6',
          violetDark: '#7C3AED',
          violetLight: '#A78BFA',
          cyan: '#00F0FF',
          blue: '#06B6D4',
          electric: '#3B82F6',
          muted: '#94A3B8',
          text: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.35)',
        'glow-combined': '0 0 35px -5px rgba(139, 92, 246, 0.3), 0 0 20px -5px rgba(6, 182, 212, 0.25)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to top, #08090D 0%, rgba(8, 9, 13, 0.8) 50%, rgba(8, 9, 13, 0.3) 100%)',
        'hero-side': 'linear-gradient(to right, #08090D 0%, rgba(8, 9, 13, 0.7) 40%, transparent 100%)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
