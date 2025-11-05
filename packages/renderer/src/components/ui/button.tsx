import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-soft-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:rounded-[inherit] before:bg-white/15 before:opacity-0 before:transition before:duration-500 before:ease-soft-spring hover:before:translate-x-[120%] hover:before:opacity-20',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-catppuccin-blue to-catppuccin-sapphire text-primary-foreground shadow-glow hover:shadow-glow-sm',
        destructive:
          'bg-gradient-to-br from-catppuccin-red to-catppuccin-maroon text-destructive-foreground shadow-glow hover:shadow-glow-sm',
        outline:
          'border border-border/70 bg-surface-0/40 text-foreground shadow-inner-glow hover:border-catppuccin-blue hover:bg-surface-0/70 hover:text-catppuccin-blue',
        secondary:
          'bg-gradient-to-br from-catppuccin-lavender to-catppuccin-mauve text-secondary-foreground shadow-glow-sm hover:shadow-glow',
        ghost:
          'bg-transparent text-foreground hover:bg-surface-0/60 hover:text-catppuccin-blue',
        link: 'text-catppuccin-blue underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-11 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
