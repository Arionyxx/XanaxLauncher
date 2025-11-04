# Changelog

## [Unreleased]

### Added - NextUI and Catppuccin Macchiato Theme

- Integrated NextUI v2 component library
- Added Catppuccin Macchiato color theme
- Implemented basic app layout with sidebar navigation
- Added Framer Motion animations for smooth transitions

#### Dependencies Added

- `@nextui-org/react` (v2.6.11) - UI component library
- `framer-motion` (v12.23.24) - Animation library
- `@catppuccin/palette` (v1.7.1) - Catppuccin color palette

#### New Files

- `src/config/theme.ts` - Catppuccin Macchiato color configuration and NextUI theme mapping
- `src/app/providers.tsx` - NextUI provider wrapper component

#### Modified Files

- `tailwind.config.ts` - Added NextUI plugin and Catppuccin color extensions
- `src/app/globals.css` - Updated with Catppuccin Macchiato color variables
- `src/app/layout.tsx` - Integrated NextUI provider and dark mode
- `src/app/page.tsx` - Complete rewrite with sidebar layout and placeholder sections

#### Features

- **Sidebar Navigation**: Home, Catalog, Downloads, Settings sections
- **Dark Theme**: Catppuccin Macchiato color scheme throughout
- **Animations**:
  - Sidebar slides in from left on load
  - Content sections fade in when switching
- **Responsive Layout**: Flexbox-based layout with responsive cards
- **Placeholder Content**: Basic structure for all main sections

#### Theme Colors

- Base: #24273a
- Mantle: #1e2030
- Text: #cad3f5
- Primary (Blue): Catppuccin Blue
- Secondary (Mauve): Catppuccin Mauve
- Success: Catppuccin Green
- Warning: Catppuccin Yellow
- Danger: Catppuccin Red
