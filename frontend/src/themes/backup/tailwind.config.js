/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/**/*.js"
  ],
  theme: {
    extend: {
      // Module colors - keeping existing identity
      colors: {
        // ZION Module Colors
        family: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        news: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#2563eb',
        },
        journal: {
          DEFAULT: '#8b5cf6',
          light: '#ede9fe',
          dark: '#7c3aed',
        },
        services: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        organizations: {
          DEFAULT: '#f97316',
          light: '#ffedd5',
          dark: '#ea580c',
        },
        marketplace: {
          DEFAULT: '#ec4899',
          light: '#fce7f3',
          dark: '#db2777',
        },
        finance: {
          DEFAULT: '#eab308',
          light: '#fef9c3',
          dark: '#ca8a04',
        },
        events: {
          DEFAULT: '#06b6d4',
          light: '#cffafe',
          dark: '#0891b2',
        },
        // shadcn/ui color system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("flowbite/plugin")
  ],
};
