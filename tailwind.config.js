/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        // ATLAS Navy (Horizon primary)
        navy: {
          DEFAULT: '#022D5E',
          dark: '#022650',
          link: '#034A9B',
        },
        // ATLAS Turquesa (Pulse primary)
        turquesa: {
          DEFAULT: '#2EB0CB',
          dark: '#2798B0',
          subtle: '#6ECFE0',
        },
        // Neutros UI
        ink: '#111827',
        'text-secondary': '#6B7280',
        'icon-muted': '#9CA3AF',
        border: '#E5E7EB',
        'bg-base': '#F8FAFC',
        surface: '#FFFFFF',
        // Semánticos
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
        // Icon states
        'icon-inactive': '#6B7280',
        'icon-disabled': '#CBD5E1',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}