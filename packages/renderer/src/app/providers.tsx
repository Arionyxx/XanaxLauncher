'use client'

import { ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { initializeDatabase } from '@/db/db'
import { autoSyncSources } from '@/services/source-sync'
import { OnboardingGate } from '@/components/onboarding/OnboardingGate'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function AppContent({ children }: { children: ReactNode }) {
  useGlobalKeyboardShortcuts()

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initDb = async () => {
      const success = await initializeDatabase()

      if (success) {
        console.log('[App] Database ready for use')

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
    <ErrorBoundary>
      <div className="h-full">
        <AppContent>
          <OnboardingGate>{children}</OnboardingGate>
        </AppContent>
        <Toaster position="bottom-right" theme="dark" richColors />
      </div>
    </ErrorBoundary>
  )
}
