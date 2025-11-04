'use client'

import { NextUIProvider } from '@nextui-org/react'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextUIProvider className="h-full">
      <div className="dark text-foreground bg-background h-full">
        {children}
      </div>
    </NextUIProvider>
  )
}
