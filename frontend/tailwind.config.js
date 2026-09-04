/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      },
      fontSize: {
        xs: ['13px', { lineHeight: '1.4' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.5' }],
        md: ['16px', { lineHeight: '1.4' }],
        lg: ['18px', { lineHeight: '1.3' }],
        xl: ['22px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        full: 'var(--radius-full)',
      },
      screens: {
        desktop: '1024px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        ink: {
          900: 'hsl(var(--ink-900))',
          700: 'hsl(var(--ink-700))',
          500: 'hsl(var(--ink-500))',
        },
        surface: {
          muted: 'hsl(var(--surface-muted))',
        },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          bg: 'hsl(var(--destructive-bg))',
        },
        success: { DEFAULT: 'hsl(var(--success))', bg: 'hsl(var(--success-bg))' },
        warning: { DEFAULT: 'hsl(var(--warning))', bg: 'hsl(var(--warning-bg))' },
        info: { DEFAULT: 'hsl(var(--info))', bg: 'hsl(var(--info-bg))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        label: 'var(--label)',
      },
    },
  },
  plugins: [],
}
