/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        'canvas-parchment': 'var(--color-canvas-parchment)',
        ink: 'var(--color-ink)',
        'body-ink': 'var(--color-ink)',
        'muted-ink': 'var(--color-muted-ink)',
        'muted-soft': 'var(--color-muted-soft)',
        primary: {
          50: 'rgba(0, 102, 204, 0.1)',
          500: '#0066cc', // Action Blue
          600: '#0071e3', // Focus Blue
          700: '#0055aa',
        },
        'primary-focus': '#0071e3',
        'primary-on-dark': '#2997ff', // Sky Link Blue
        'surface-tile-1': '#272729',
        'surface-tile-2': '#2a2a2c',
        'surface-tile-3': '#252527',
        'surface-black': '#000000',
        hairline: 'var(--color-hairline)',
        'hairline-soft': 'var(--color-hairline-soft)',
        'border-strong': 'var(--color-border-strong)',
        'divider-soft': 'var(--color-divider-soft)',
        'error-red': '#ff453a', // Apple red
        
        // Legacy theme variable mapping to prevent visual breakage and map cleanly
        background: 'var(--color-canvas-parchment)',
        surface: 'var(--color-canvas)',
        'surface-hover': 'var(--color-surface-soft)',
        border: 'var(--color-hairline)',
        accent: {
          cyan: '#0066cc',
          emerald: '#30d158', // Apple green
          purple: '#af52de', // Apple purple
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        'apple-tight': '-0.022em',
        'apple-headline': '-0.011em',
      },
      boxShadow: {
        airbnb: 'var(--color-shadow-airbnb)',
        'apple-product': 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0',
      },
    },
  },
  plugins: [],
};
