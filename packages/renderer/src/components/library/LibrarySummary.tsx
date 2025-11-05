'use client'

import { motion } from 'framer-motion'
import { LibraryEntry } from '@/db/schema'
import { Card, CardContent } from '@/components/ui/card'
import { formatBytes, formatDateTime } from '@/utils/format'
import { cn } from '@/lib/utils'
import { GaugeCircle, HardDrive, History } from 'lucide-react'

interface LibrarySummaryProps {
  totalSize: number
  totalGames: number
  recentlyPlayed?: LibraryEntry
  className?: string
}

const summaryItems = (
  totalGames: number,
  totalSize: number,
  recentlyPlayed?: LibraryEntry
) => [
  {
    icon: GaugeCircle,
    label: 'Installed Titles',
    value: `${totalGames} game${totalGames === 1 ? '' : 's'}`,
    accent: 'from-catppuccin-blue/40 to-catppuccin-sapphire/20',
  },
  {
    icon: HardDrive,
    label: 'Disk Footprint',
    value: formatBytes(totalSize),
    accent: 'from-catppuccin-mauve/35 to-catppuccin-lavender/20',
  },
  {
    icon: History,
    label: recentlyPlayed ? recentlyPlayed.title : 'Last Played',
    value: recentlyPlayed
      ? formatDateTime(recentlyPlayed.lastPlayed, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'No play history yet',
    accent: 'from-catppuccin-green/30 to-catppuccin-teal/20',
  },
]

export function LibrarySummary({
  totalGames,
  totalSize,
  recentlyPlayed,
  className,
}: LibrarySummaryProps) {
  const items = summaryItems(totalGames, totalSize, recentlyPlayed)

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden border border-white/10 bg-surface-0/55 backdrop-blur-xl">
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                item.accent
              )}
            />
            <CardContent className="relative flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface-0/70 text-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
                  {item.label}
                </div>
              </div>
              <div className="text-xl font-semibold text-foreground">
                {item.value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
