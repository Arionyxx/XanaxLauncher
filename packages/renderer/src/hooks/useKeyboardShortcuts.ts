'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlKey = shortcut.ctrl || shortcut.cmd
        const modifierMatch =
          (!ctrlKey || (e.ctrlKey || e.metaKey)) &&
          (!shortcut.alt || e.altKey) &&
          (!shortcut.shift || e.shiftKey)

        if (modifierMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

export function useGlobalKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search bar',
      action: () => {
        const searchInput = document.getElementById('search-input')
        if (searchInput) {
          searchInput.focus()
        }
      },
    },
    {
      key: 'j',
      ctrl: true,
      description: 'Navigate to Downloads',
      action: () => router.push('/downloads'),
    },
    {
      key: ',',
      ctrl: true,
      description: 'Navigate to Settings',
      action: () => router.push('/settings'),
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Navigate to Home/Catalog',
      action: () => router.push('/'),
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh sources',
      action: () => {
        window.location.reload()
      },
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}
