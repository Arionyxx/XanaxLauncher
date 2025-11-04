'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { initializeDatabase } from '@/db/db'
import { autoSyncSources } from '@/services/source-sync'

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initDb = async () => {
      const success = await initializeDatabase()

      if (success) {
        console.log('[App] Database ready for use')

        // Auto-sync enabled sources on startup
        try {
          await autoSyncSources()
        } catch (error) {
          console.error('[App] Auto-sync failed:', error)
        }
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
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgb(var(--surface0))',
              border: '1px solid rgb(var(--surface1))',
              color: 'rgb(var(--text))',
            },
          }}
        />
      </div>
    </NextUIProvider>
  )
}
