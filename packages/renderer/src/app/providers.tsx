'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ReactNode, useEffect } from 'react'
import { initializeDatabase } from '@/db/db'

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initDb = async () => {
      const success = await initializeDatabase()

      if (success) {
        console.log('[App] Database ready for use')
      } else {
        console.error('[App] Database initialization failed')
      }
    }

    initDb()
  }, [])

  return (
    <NextUIProvider className="h-full">
      <div className="dark text-foreground bg-background h-full">
        {children}
      </div>
    </NextUIProvider>
  )
}
