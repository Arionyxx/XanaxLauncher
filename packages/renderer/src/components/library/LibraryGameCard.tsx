'use client'

import { motion } from 'framer-motion'
import {
  CalendarDays,
  Clock3,
  FolderOpen,
  HardDrive,
  Play,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { LibraryEntry } from '@/db/schema'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatDateTime, formatRelativeTime } from '@/utils/format'

interface LibraryGameCardProps {
  entry: LibraryEntry
  view: 'grid' | 'list'
  onLaunch: (entry: LibraryEntry) => void
  onOpenFolder: (entry: LibraryEntry) => void
  onRemove: (entry: LibraryEntry) => void
}

export function LibraryGameCard({
  entry,
  view,
  onLaunch,
  onOpenFolder,
  onRemove,
}: LibraryGameCardProps) {
  const cover = entry.coverUrl

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={() => onLaunch(entry)}
        className="min-w-[120px]"
        disabled={!entry.executablePath}
      >
        <Play className="h-4 w-4" />
        <span>{entry.executablePath ? 'Play' : 'No Launcher'}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onOpenFolder(entry)}
        className="text-text-subtle hover:text-foreground"
      >
        <FolderOpen className="h-4 w-4" />
        Folder
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(entry)}
        className="text-catppuccin-red hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        Remove
      </Button>
    </div>
  )

  if (view === 'list') {
    return (
      <motion.div
        whileHover={{ x: 6 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        <Card className="group border border-white/10 bg-surface-0/60 backdrop-blur-xl">
          <CardContent className="flex items-center gap-5 p-5">
            <div className="flex h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-1/60">
              {cover ? (
                <img
                  src={cover}
                  alt={entry.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-catppuccin-blue/70">
                  <Sparkles className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {entry.title}
                </h3>
                <p className="text-xs text-text-subtle">
                  {entry.installPath}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-surface-1/50 px-3 py-1">
                  <HardDrive className="h-3 w-3" />
                  {formatBytes(entry.size)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-surface-1/50 px-3 py-1">
                  <CalendarDays className="h-3 w-3" />
                  Installed {formatDateTime(entry.installDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-surface-1/50 px-3 py-1">
                  <Clock3 className="h-3 w-3" />
                  Last played {formatRelativeTime(entry.lastPlayed)}
                </span>
              </div>

              {actionButtons}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border border-white/10 bg-surface-0/60 backdrop-blur-xl">
        <div className="relative aspect-[4/5] overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={entry.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-1/60">
              <Sparkles className="h-10 w-10 text-catppuccin-blue/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge className="bg-catppuccin-blue/30 text-primary-foreground">
              {formatBytes(entry.size)}
            </Badge>
            {entry.lastPlayed && (
              <Badge variant="secondary" className="bg-catppuccin-mauve/30 text-secondary-foreground">
                Played {formatRelativeTime(entry.lastPlayed)}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-5 pb-3">
          <h3 className="text-xl font-semibold text-foreground">{entry.title}</h3>
          <p className="text-xs text-text-subtle">Installed {formatDateTime(entry.installDate, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          <div className="flex items-center gap-3 text-xs text-text-subtle">
            <span className="truncate">{entry.installPath}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex flex-col gap-3 p-5 pt-0">
          {actionButtons}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
