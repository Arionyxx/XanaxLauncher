import type { Config } from 'tailwindcss'

import { flavors } from '@catppuccin/palette'

type CatppuccinColor = {
  hsl: {
    h: number
    s: number
    l: number
  }
  [key: string]: unknown
}

const toHsl = (color: CatppuccinColor) =>
  `${Math.round(color.hsl.h)} ${Math.round(color.hsl.s * 100)}% ${Math.round(
    color.hsl.l * 100
  )}%`

const macchiato = flavors.macchiato.colors as Record<string, CatppuccinColor>

const catppuccinPalette = Object.fromEntries(
  Object.entries(macchiato).map(([key, value]) => [key, `hsl(${toHsl(value)})`])
)

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        surface: {
          0: 'hsl(var(--surface-0))',
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
        },
        overlay: {
          0: 'hsl(var(--overlay-0))',
          1: 'hsl(var(--overlay-1))',
          2: 'hsl(var(--overlay-2))',
        },
        text: {
          muted: 'hsl(var(--text-muted))',
          subtle: 'hsl(var(--text-subtle))',
        },
        catppuccin: catppuccinPalette,
      },
      boxShadow: {
        glow: '0 0 0 1px hsl(var(--ring) / 0.35), 0 25px 65px -35px hsl(var(--ring) / 0.6)',
        'glow-sm':
          '0 0 0 1px hsl(var(--ring) / 0.3), 0 10px 30px -20px hsl(var(--ring) / 0.45)',
        'inner-glow': 'inset 0 1px 0 0 hsl(var(--foreground) / 0.1)',
      },
      backgroundImage: {
        'macchiato-radial':
          'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(circle at 80% 0%, hsl(var(--secondary) / 0.12), transparent 50%), radial-gradient(circle at 50% 100%, hsl(var(--accent) / 0.12), transparent 55%)',
        'macchiato-linear':
          'linear-gradient(135deg, hsl(var(--surface-2) / 0.5), hsl(var(--surface-0) / 0.8))',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up-fade': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '0.35' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 320ms ease-out',
        'slide-up-fade': 'slide-up-fade 400ms ease',
        'scale-in': 'scale-in 280ms ease-out',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        shine: 'shine 1.8s linear infinite',
      },
      transitionTimingFunction: {
        'soft-spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
