'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Filter, Grid, List, Package, Settings } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { useGames, GameEntry } from '@/hooks/useGames'
import { GameCard } from '@/components/catalog/GameCard'
import { GameDetailModal } from '@/components/catalog/GameDetailModal'
import { EmptyState } from '@/components/catalog/EmptyState'
import { SkeletonGrid } from '@/components/catalog/SkeletonCard'
import { useDebounce } from '@/hooks/useDebounce'
import { db } from '@/db/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

const ITEMS_PER_PAGE = 20

export default function Home() {
  const router = useRouter()
  const { games, loading, error, refresh } = useGames()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasCheckedSources, setHasCheckedSources] = useState(false)
  const [hasSources, setHasSources] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const checkSources = async () => {
      const sources = await db.sources.toArray()
      setHasSources(sources.length > 0)
      setHasCheckedSources(true)
    }
    checkSources()
  }, [])

  const uniqueSources = useMemo(() => {
    const sources = new Set(games.map((game) => game.sourceName))
    return Array.from(sources).sort()
  }, [games])

  const filteredAndSortedGames = useMemo(() => {
    let filtered = games

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((game) =>
        game.title.toLowerCase().includes(query)
      )
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter((game) => game.sourceName === selectedSource)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'date') {
        return (
          new Date(b.addedAt || 0).getTime() -
          new Date(a.addedAt || 0).getTime()
        )
      }
      return 0
    })

    return filtered
  }, [games, debouncedSearchQuery, selectedSource, sortBy])

  const totalPages = Math.ceil(filteredAndSortedGames.length / ITEMS_PER_PAGE)
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedSource, sortBy])

  const handleGameClick = (game: GameEntry) => {
    setSelectedGame(game)
    setIsModalOpen(true)
  }

  const handleDownload = (game: GameEntry) => {
    console.log('Download requested for:', game.title)
    router.push('/downloads')
  }

  if (!hasCheckedSources) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle>Loading Catalog</CardTitle>
              <CardDescription>Setting up your media library...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Media Catalog</h1>
              <p className="text-muted-foreground">
                Browse and download your favorite media
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>

        {!hasSources ? (
          <EmptyState onAddSource={() => router.push('/settings')} />
        ) : (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search media..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {uniqueSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="date">Sort by Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredAndSortedGames.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>
                          Showing {paginatedGames.length} of{' '}
                          {filteredAndSortedGames.length} items
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {viewMode === 'grid' ? 'Grid View' : 'List View'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Content */}
            {loading ? (
              <SkeletonGrid />
            ) : error ? (
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Error loading catalog</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredAndSortedGames.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">No items found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedSource('all')
                        setSortBy('name')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }
                >
                  {paginatedGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={handleGameClick}
                      onDownload={handleDownload}
                      viewMode={viewMode}
                    />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex justify-center"
                  >
                    <Card className="inline-flex">
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Separator orientation="vertical" className="h-6" />
                          <span className="text-sm text-muted-foreground px-2">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Separator orientation="vertical" className="h-6" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        {selectedGame && (
          <GameDetailModal
            game={selectedGame}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedGame(null)
            }}
            onDownload={handleDownload}
          />
        )}
      </div>
    </AppLayout>
  )
}