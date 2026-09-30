/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#4f46e5',
        accent: '#06b6d4',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'glow-indigo': '0 12px 30px -4px rgba(79, 70, 229, 0.35)',
        'glow-cyan': '0 12px 30px -4px rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
};