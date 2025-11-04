import { flavors } from '@catppuccin/palette'

// Catppuccin Macchiato color palette
export const macchiato = flavors.macchiato.colors

// NextUI theme configuration with Catppuccin Macchiato colors
export const nextUITheme = {
  colors: {
    background: macchiato.base.hex,
    foreground: macchiato.text.hex,
    primary: {
      50: macchiato.blue.hex,
      100: macchiato.blue.hex,
      200: macchiato.blue.hex,
      300: macchiato.blue.hex,
      400: macchiato.blue.hex,
      500: macchiato.blue.hex,
      600: macchiato.blue.hex,
      700: macchiato.blue.hex,
      800: macchiato.blue.hex,
      900: macchiato.blue.hex,
      DEFAULT: macchiato.blue.hex,
      foreground: macchiato.crust.hex,
    },
    secondary: {
      50: macchiato.mauve.hex,
      100: macchiato.mauve.hex,
      200: macchiato.mauve.hex,
      300: macchiato.mauve.hex,
      400: macchiato.mauve.hex,
      500: macchiato.mauve.hex,
      600: macchiato.mauve.hex,
      700: macchiato.mauve.hex,
      800: macchiato.mauve.hex,
      900: macchiato.mauve.hex,
      DEFAULT: macchiato.mauve.hex,
      foreground: macchiato.crust.hex,
    },
    success: {
      DEFAULT: macchiato.green.hex,
      foreground: macchiato.crust.hex,
    },
    warning: {
      DEFAULT: macchiato.yellow.hex,
      foreground: macchiato.crust.hex,
    },
    danger: {
      DEFAULT: macchiato.red.hex,
      foreground: macchiato.crust.hex,
    },
    default: {
      50: macchiato.surface0.hex,
      100: macchiato.surface0.hex,
      200: macchiato.surface0.hex,
      300: macchiato.surface1.hex,
      400: macchiato.surface1.hex,
      500: macchiato.surface2.hex,
      600: macchiato.surface2.hex,
      700: macchiato.overlay0.hex,
      800: macchiato.overlay1.hex,
      900: macchiato.overlay2.hex,
      DEFAULT: macchiato.surface0.hex,
      foreground: macchiato.text.hex,
    },
  },
  layout: {
    radius: {
      small: '8px',
      medium: '12px',
      large: '16px',
    },
  },
}

// Export Catppuccin colors for direct use in Tailwind
export const catppuccinColors = {
  base: macchiato.base.hex,
  mantle: macchiato.mantle.hex,
  crust: macchiato.crust.hex,
  text: macchiato.text.hex,
  subtext0: macchiato.subtext0.hex,
  subtext1: macchiato.subtext1.hex,
  overlay0: macchiato.overlay0.hex,
  overlay1: macchiato.overlay1.hex,
  overlay2: macchiato.overlay2.hex,
  surface0: macchiato.surface0.hex,
  surface1: macchiato.surface1.hex,
  surface2: macchiato.surface2.hex,
  blue: macchiato.blue.hex,
  lavender: macchiato.lavender.hex,
  sapphire: macchiato.sapphire.hex,
  sky: macchiato.sky.hex,
  teal: macchiato.teal.hex,
  green: macchiato.green.hex,
  yellow: macchiato.yellow.hex,
  peach: macchiato.peach.hex,
  maroon: macchiato.maroon.hex,
  red: macchiato.red.hex,
  mauve: macchiato.mauve.hex,
  pink: macchiato.pink.hex,
  flamingo: macchiato.flamingo.hex,
  rosewater: macchiato.rosewater.hex,
}
