'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiDownload,
  FiSettings,
  FiHelpCircle,
  FiMenu,
} from 'react-icons/fi'

interface NavLinkProps {
  href: string
  icon: ReactNode
  label: string
  active: boolean
}

function NavLink({ href, icon, label, active }: NavLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className={active ? 'active' : ''}
        aria-current={active ? 'page' : undefined}
      >
        {icon}
        {label}
      </Link>
    </li>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: <FiHome size={20} />, label: 'Home' },
    { href: '/downloads', icon: <FiDownload size={20} />, label: 'Downloads' },
    { href: '/settings', icon: <FiSettings size={20} />, label: 'Settings' },
    { href: '/help', icon: <FiHelpCircle size={20} />, label: 'Help' },
  ]

  return (
    <div className="drawer lg:drawer-open h-full">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-full">
        <div className="navbar bg-base-300 lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="app-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <FiMenu size={24} />
            </label>
          </div>
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">XanaxLauncher</a>
          </div>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="app-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <aside className="bg-base-200 min-h-full w-64 flex flex-col">
          <div className="p-4 hidden lg:block">
            <h1 className="text-2xl font-bold text-primary">XanaxLauncher</h1>
            <p className="text-xs text-base-content/70">Media Manager</p>
          </div>

          <ul className="menu p-4 flex-1 space-y-1">
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
              />
            ))}
          </ul>

          <div className="p-4 border-t border-base-300">
            <div className="text-xs text-base-content/50">
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2024 XanaxLauncher</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
