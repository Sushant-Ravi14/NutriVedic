/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        black: '#0a0a0a',
        surface: '#f7f7f7',
        border: '#e0e0e0',
        muted: '#6b6b6b',
        label: '#9e9e9e',
        positive: '#2d9a4e',
        negative: '#dc2626',
      },
      spacing: { '18': '72px' },
      borderRadius: { card: '12px', pill: '20px' }
    }
  },
  plugins: []
}
