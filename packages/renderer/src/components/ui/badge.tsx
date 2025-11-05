import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ease-soft-spring focus:outline-none focus:ring-2 focus:ring-ring/45 focus:ring-offset-2 focus:ring-offset-background backdrop-blur-md',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-catppuccin-blue/90 text-primary-foreground shadow-glow-sm hover:bg-catppuccin-blue',
        secondary:
          'border-transparent bg-catppuccin-mauve/85 text-secondary-foreground hover:bg-catppuccin-mauve',
        destructive:
          'border-transparent bg-catppuccin-red/90 text-destructive-foreground shadow-glow hover:bg-catppuccin-red',
        outline:
          'border-border/70 text-text-muted hover:border-catppuccin-blue hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
