'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LibraryEmptyStateProps {
  onScan: () => void
}

export function LibraryEmptyState({ onScan }: LibraryEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border border-dashed border-white/15 bg-surface-0/60 p-0 text-center shadow-glow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-catppuccin-blue/10 via-transparent to-catppuccin-mauve/10" />
        <CardContent className="relative flex flex-col items-center gap-6 p-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-surface-1/60 text-catppuccin-blue shadow-inner-glow">
            <Sparkles className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Your library is waiting to be discovered
            </h2>
            <p className="text-sm text-text-subtle">
              Scan your favourite install locations and XanaxLauncher will build a
              beautiful library of everything it finds.
            </p>
          </div>

          <Button size="lg" onClick={onScan} className="px-8">
            Start Scan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
