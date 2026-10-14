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
        canvas: {
          void: '#02040a',
          base: '#040711',
          subtle: '#080d1e',
          card: 'rgba(13, 21, 39, 0.75)',
          elevated: 'rgba(18, 28, 52, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
        },
        electric: {
          mint: '#00f5a0',
          emerald: '#10b981',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          violet: '#8b5cf6',
          purple: '#a855f7',
          amber: '#fbbf24',
          coral: '#ff5c8a',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-slab': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.4)',
        'glow-mint': '0 0 35px -5px rgba(0, 245, 160, 0.35)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.35)',
        'glow-amber': '0 0 35px -5px rgba(251, 191, 36, 0.35)',
        'glow-coral': '0 0 35px -5px rgba(255, 92, 138, 0.35)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
