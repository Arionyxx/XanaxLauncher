'use client'

import { ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Download,
  HelpCircle,
  Home,
  Library,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  icon: ReactNode
  label: string
  active: boolean
  onClick?: () => void
}

const navMotion = {
  whileHover: { x: 6 },
  whileTap: { scale: 0.96 },
}

function NavLink({ href, icon, label, active, onClick }: NavLinkProps) {
  return (
    <motion.li {...navMotion} className="list-none">
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition-all duration-300 ease-soft-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
          active
            ? 'border-white/15 bg-surface-0/85 text-foreground shadow-glow'
            : 'text-text-subtle hover:border-white/10 hover:bg-surface-0/55 hover:text-foreground'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface-1/50 text-catppuccin-blue transition-all duration-300 group-hover:bg-surface-1/70">
          {icon}
        </span>
        <span className="relative z-10">{label}</span>
        {active && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-0 -z-10 rounded-xl border border-catppuccin-blue/35 bg-catppuccin-blue/10"
            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
          />
        )}
      </Link>
    </motion.li>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = useMemo(
    () => [
      { href: '/', icon: <Home className="h-4 w-4" />, label: 'Home' },
      {
        href: '/library',
        icon: <Library className="h-4 w-4" />,
        label: 'Library',
      },
      {
        href: '/downloads',
        icon: <Download className="h-4 w-4" />,
        label: 'Downloads',
      },
      {
        href: '/settings',
        icon: <Settings className="h-4 w-4" />,
        label: 'Settings',
      },
      {
        href: '/help',
        icon: <HelpCircle className="h-4 w-4" />,
        label: 'Help',
      },
    ],
    []
  )

  const contentKey = pathname?.split('?')[0] ?? 'root'
  const year = new Date().getFullYear()

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-catppuccin-blue/15 text-catppuccin-blue shadow-inner-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-text-muted">
              XanaxLauncher
            </p>
            <p className="text-lg font-semibold leading-none text-gradient">
              Control Center
            </p>
          </div>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-text-subtle hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      <Separator className="mx-2 bg-white/10" />

      <nav className="flex-1 overflow-y-auto px-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href))
              }
              onClick={mobile ? () => setSidebarOpen(false) : undefined}
            />
          ))}
        </ul>
      </nav>

      <div className="px-2 pb-4">
        <div className="rounded-2xl border border-white/10 bg-surface-0/60 p-4 text-xs text-text-subtle shadow-glow-sm backdrop-blur-xl">
          <p className="font-medium text-foreground/80">Version 1.0.0</p>
          <p className="mt-1">© {year} XanaxLauncher</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-macchiato-radial opacity-90" />

      <div className="relative z-0 grid min-h-screen w-full gap-6 px-4 pb-10 pt-6 sm:px-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] md:px-10">
        <aside className="hidden md:flex">
          <div className="w-full rounded-[2.25rem] border border-white/10 bg-surface-0/45 p-4 shadow-glow backdrop-blur-[30px]">
            <Sidebar />
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full max-w-xs border-white/10 bg-surface-0/85 p-0 shadow-glow backdrop-blur-2xl"
              >
                <Sidebar mobile />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-0/60 px-4 py-2 shadow-glow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-catppuccin-blue" />
              <span className="text-sm font-medium text-foreground">
                XanaxLauncher
              </span>
            </div>
          </div>

          <div className="hidden items-center justify-between rounded-2xl border border-white/10 bg-surface-0/45 px-6 py-5 shadow-glow-sm backdrop-blur-xl md:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">
                Dashboard
              </p>
              <p className="text-lg font-semibold text-foreground">
                Welcome back 👋
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-subtle">
              <span className="h-2 w-2 rounded-full bg-catppuccin-green shadow-glow" />
              Online
            </div>
          </div>

          <main className="relative flex flex-1 flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={contentKey}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="glass-panel relative flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-surface-0/55 p-4 shadow-glow backdrop-blur-[32px] sm:p-6 lg:p-8"
              >
                <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col gap-6">
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
