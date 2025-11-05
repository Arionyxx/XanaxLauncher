'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, LayoutGrid, Rows2, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useLibrary } from '@/hooks/useLibrary'
import { useSettings } from '@/hooks/useSettings'
import {
  launchGameFromLibrary,
  openLibraryFolder,
  scanLibrary,
} from '@/services/library'
import { LibraryGameCard } from '@/components/library/LibraryGameCard'
import { LibraryEmptyState } from '@/components/library/LibraryEmptyState'
import { LibrarySummary } from '@/components/library/LibrarySummary'
import { LibraryEntry } from '@/db/schema'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { label: 'Title', value: 'title' },
  { label: 'Install date', value: 'installDate' },
  { label: 'Size', value: 'size' },
  { label: 'Last played', value: 'lastPlayed' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

type ScanState = 'idle' | 'scanning' | 'success' | 'error'

export default function LibraryPage() {
  const { entries, isLoading, stats, refresh, removeEntry } = useLibrary()
  const { settings } = useSettings()
  const { toast } = useToast()

  const downloadDirectory = settings?.general?.downloadDirectory
  const tempDirectory = settings?.general?.tempDirectory

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortValue>('title')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanDetails, setScanDetails] = useState<
    | {
        found: number
        scannedPaths: string[]
      }
    | null
  >(null)

  const filteredEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const sorted = [...entries]
      .filter((entry) =>
        term.length === 0
          ? true
          : entry.title.toLowerCase().includes(term) ||
            entry.installPath.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'installDate':
            return (b.installDate ?? 0) - (a.installDate ?? 0)
          case 'size':
            return (b.size ?? 0) - (a.size ?? 0)
          case 'lastPlayed':
            return (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0)
          default:
            return 0
        }
      })

    return sorted
  }, [entries, searchTerm, sortBy])

  const handleScan = useCallback(async () => {
    try {
      setScanState('scanning')
      const preferredPaths = [downloadDirectory, tempDirectory].filter(
        (path): path is string => Boolean(path)
      )

      const response = await scanLibrary(preferredPaths)
      setScanDetails({
        found: response.found,
        scannedPaths: response.scannedPaths,
      })
      await refresh()
      setScanState('success')
      toast({
        title: 'Scan complete',
        description: `Found ${response.found} game${response.found === 1 ? '' : 's'}.`,
      })
    } catch (error) {
      console.error('[Library] Scan failed', error)
      setScanState('error')
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description:
          error instanceof Error ? error.message : 'Unable to complete game scan.',
      })
    }
  }, [refresh, settings?.general, toast])

  const handleLaunch = useCallback(
    async (entry: LibraryEntry) => {
      try {
        await launchGameFromLibrary(entry)
        toast({
          title: 'Launching game',
          description: `${entry.title} is starting...`,
        })
        await refresh()
      } catch (error) {
        console.error('[Library] Launch failed', error)
        toast({
          variant: 'destructive',
          title: 'Launch failed',
          description: error instanceof Error ? error.message : 'Could not launch game.',
        })
      }
    },
    [refresh, toast]
  )

  const handleOpenFolder = useCallback(
    async (entry: LibraryEntry) => {
      try {
        await openLibraryFolder(entry.installPath)
      } catch (error) {
        console.error('[Library] Open folder failed', error)
        toast({
          variant: 'destructive',
          title: 'Unable to open folder',
          description: error instanceof Error ? error.message : 'Please open the folder manually.',
        })
      }
    },
    [toast]
  )

  const handleRemove = useCallback(
    async (entry: LibraryEntry) => {
      const confirmed = window.confirm(
        `Remove ${entry.title} from your library? This will not uninstall the game.`
      )
      if (!confirmed) {
        return
      }

      await removeEntry(entry.id)
      toast({
        title: 'Removed from library',
        description: `${entry.title} will no longer appear in your library view.`,
      })
    },
    [removeEntry, toast]
  )

  const isScanning = scanState === 'scanning'

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-text-muted">
              Xanax Library
            </p>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Installed Games
            </h1>
            <p className="max-w-2xl text-sm text-text-subtle">
              Beautifully organised access to every game on your machine. Scan for
              installs, launch instantly, and keep your collection perfectly in sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              onClick={refresh}
              className="text-text-subtle hover:text-foreground"
              disabled={isScanning}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleScan} disabled={isScanning} size="lg">
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan for Games'
              )}
            </Button>
          </div>
        </motion.div>

        <LibrarySummary
          totalGames={entries.length}
          totalSize={stats.totalSize}
          recentlyPlayed={stats.recentlyPlayed}
          className="pt-2"
        />

        <Card className="border border-white/10 bg-surface-0/55 backdrop-blur-xl">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
                <Input
                  placeholder="Search installed games or paths..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-12"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={sortBy} onValueChange={(value: SortValue) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-0/60 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'shadow-glow-sm' : 'text-text-subtle'}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'shadow-glow-sm' : 'text-text-subtle'}
                  >
                    <Rows2 className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            {scanState === 'success' && scanDetails && (
              <div className="rounded-2xl border border-white/10 bg-surface-0/60 p-4 text-xs text-text-subtle">
                <strong className="text-foreground">Scan complete:</strong> Found {scanDetails.found}{' '}
                game{scanDetails.found === 1 ? '' : 's'} in{' '}
                {scanDetails.scannedPaths.length} location{scanDetails.scannedPaths.length === 1 ? '' : 's'}.
              </div>
            )}

            {scanState === 'error' && (
              <div className="rounded-2xl border border-catppuccin-red/40 bg-catppuccin-red/10 p-4 text-xs text-catppuccin-red">
                Scan encountered issues. Please verify your directories and try again.
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-3xl border border-white/10 bg-surface-0/40" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <LibraryEmptyState onScan={handleScan} />
        ) : (
          <motion.div
            layout
            className={cn(
              'gap-6',
              viewMode === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3'
                : 'space-y-4'
            )}
          >
            {filteredEntries.map((entry) => (
              <motion.div key={entry.id} layout>
                <LibraryGameCard
                  entry={entry}
                  view={viewMode}
                  onLaunch={handleLaunch}
                  onOpenFolder={handleOpenFolder}
                  onRemove={handleRemove}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
