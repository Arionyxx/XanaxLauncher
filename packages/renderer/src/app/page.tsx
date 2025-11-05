'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiSearch, FiRefreshCw, FiFilter, FiGrid } from 'react-icons/fi'
import { AppLayout } from '@/components/AppLayout'
import { useGames, GameEntry } from '@/hooks/useGames'
import { GameCard } from '@/components/catalog/GameCard'
import { GameDetailModal } from '@/components/catalog/GameDetailModal'
import { EmptyState } from '@/components/catalog/EmptyState'
import { SkeletonGrid } from '@/components/catalog/SkeletonCard'
import { useDebounce } from '@/hooks/useDebounce'
import { db } from '@/db/db'

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
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">Media Catalog</h1>
              <p className="text-base-content/70 mt-1">
                Browse and download your favorite media
              </p>
            </div>
            <button
              onClick={refresh}
              className="btn btn-circle btn-ghost"
              aria-label="Refresh catalog"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>

          {!hasSources ? (
            <EmptyState onAddSource={() => router.push('/settings')} />
          ) : (
            <>
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <div className="input-group">
                        <span className="bg-base-300">
                          <FiSearch />
                        </span>
                        <input
                          id="search-input"
                          type="text"
                          placeholder="Search media..."
                          className="input input-bordered w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <select
                        className="select select-bordered w-full"
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                      >
                        <option value="all">All Sources</option>
                        {uniqueSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <select
                        className="select select-bordered w-full"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                      </select>
                    </div>
                  </div>

                  {filteredAndSortedGames.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-base-content/70">
                      <FiGrid />
                      <span>
                        Showing {paginatedGames.length} of{' '}
                        {filteredAndSortedGames.length} items
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <SkeletonGrid />
              ) : error ? (
                <div className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Error: {error}</span>
                </div>
              ) : filteredAndSortedGames.length === 0 ? (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>No items found matching your search.</span>
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {paginatedGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onClick={handleGameClick}
                        onDownload={handleDownload}
                      />
                    ))}
                  </motion.div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="join">
                        <button
                          className="join-item btn"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          «
                        </button>
                        <button className="join-item btn">
                          Page {currentPage} of {totalPages}
                        </button>
                        <button
                          className="join-item btn"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>

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
