/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Doctor badge background & text safelist to ensure dynamic rendering works reliably
    'bg-indigo-50', 'text-indigo-700', 'border-indigo-200', 'bg-indigo-100', 'text-indigo-800',
    'bg-sky-50', 'text-sky-700', 'border-sky-200', 'bg-sky-100', 'text-sky-800',
    'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-emerald-100', 'text-emerald-800',
    'bg-amber-50', 'text-amber-700', 'border-amber-200', 'bg-amber-100', 'text-amber-800',
    'bg-rose-50', 'text-rose-700', 'border-rose-200', 'bg-rose-100', 'text-rose-800',
    'bg-purple-50', 'text-purple-700', 'border-purple-200', 'bg-purple-100', 'text-purple-800',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151e2e',
          950: '#0b1120',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'clinical': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
};
