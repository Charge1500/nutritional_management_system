/ @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          50: '#effcf6',
          100: '#c6f7e2',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        food: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        status: {
          draft: '#64748b',
          pending: '#f59e0b',
          approved: '#10b981',
          rejected: '#ef4444',
        },
        surface: '#ffffff',
        background: '#f8fafc',
        content: '#0f172a',
        'content-muted': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}