'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  Download,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  icon: ReactNode
  label: string
  active: boolean
  onClick?: () => void
}

function NavLink({ href, icon, label, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      {label}
    </Link>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/', icon: <Home className="w-4 h-4" />, label: 'Home' },
    { href: '/downloads', icon: <Download className="w-4 h-4" />, label: 'Downloads' },
    { href: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
    { href: '/help', icon: <HelpCircle className="w-4 h-4" />, label: 'Help' },
  ]

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="">XanaxLauncher</span>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              }
              onClick={mobile ? () => setSidebarOpen(false) : undefined}
            />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Version 1.0.0</p>
          <p>© 2024 XanaxLauncher</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <div className="w-full flex items-center justify-center">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="">XanaxLauncher</span>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex-1 rounded-lg border border-dashed shadow-sm min-h-[400px] bg-background/50 backdrop-blur-sm">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}