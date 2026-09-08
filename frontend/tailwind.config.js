/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Reference Palette
        'forest-green': '#073F34',
        'deep-green': '#022C25',
        'ivory': '#F7F4EC',
        'cream': '#EFE8D8',
        'champagne': '#C9A86A',
        'gold-light': '#DFC58E',
        'text-dark': '#16352F',

        // Teranga Brand System (preserved for full compatibility)
        teranga: {
          green: {
            50: '#f2f7f5',
            100: '#e1ede8',
            200: '#c5dbd1',
            300: '#9dbf10',
            400: '#6f9d8a',
            500: '#4e826e',
            600: '#3c6756',
            750: '#073F34', // Forest green
            800: '#022C25', // Deep green
            850: '#02231e',
            900: '#011814',
            950: '#000e0c',
          },
          gold: {
            50: '#fdfbf7',
            100: '#f7f2e6',
            200: '#eedfbe',
            300: '#DFC58E', // Gold light
            450: '#C9A86A', // Champagne gold
            500: '#b89454',
            600: '#9b7b41',
            700: '#7a5f32',
            800: '#5a4524',
            900: '#3c2e17',
          },
          beige: {
            50: '#fcfbf8',
            100: '#F7F4EC', // Ivory
            200: '#EFE8D8', // Cream
            300: '#e4d8be',
            400: '#cfbea0',
            500: '#b39f7d',
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            650: '#374151',
            700: '#1f2937',
            800: '#16352F', // Text dark
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(2, 44, 37, 0.08), 0 0 1px 1px rgba(201, 168, 106, 0.15)',
        'luxury-lg': '0 25px 50px -12px rgba(2, 44, 37, 0.16), 0 0 1px 1px rgba(201, 168, 106, 0.25)',
        'gold-glow': '0 0 25px rgba(201, 168, 106, 0.35)',
      },
      backgroundImage: {
        'luxury-pattern': "radial-gradient(circle, rgba(201, 168, 106, 0.08) 1px, transparent 1px)",
        'gold-gradient': "linear-gradient(135deg, #DFC58E 0%, #C9A86A 50%, #B28E4D 100%)",
        'dark-gradient': "linear-gradient(180deg, #073F34 0%, #022C25 100%)",
      }
    },
  },
  plugins: [],
}
