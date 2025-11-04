'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Tooltip,
} from '@nextui-org/react'
import { useGames, GameEntry } from '@/hooks/useGames'
import { GameCard } from '@/components/catalog/GameCard'
import { GameDetailModal } from '@/components/catalog/GameDetailModal'
import { EmptyState } from '@/components/catalog/EmptyState'
import { SkeletonGrid } from '@/components/catalog/SkeletonCard'
import { useDebounce } from '@/hooks/useDebounce'
import { db } from '@/db/db'

type Section = 'home' | 'catalog' | 'downloads' | 'settings'

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'catalog', label: 'Catalog', icon: '📚' },
  { id: 'downloads', label: 'Downloads', icon: '⬇️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const ITEMS_PER_PAGE = 20

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('catalog')
  const router = useRouter()

  const handleNavigation = (section: Section) => {
    if (section === 'settings') {
      router.push('/settings')
    } else if (section === 'downloads') {
      router.push('/downloads')
    } else {
      setActiveSection(section)
    }
  }

  return (
    <div className="flex h-screen w-screen bg-base">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-64 bg-mantle border-r border-surface0 flex flex-col"
      >
        {/* App Title */}
        <div className="p-6 border-b border-surface0">
          <h1 className="text-2xl font-bold text-blue">Media Manager</h1>
          <p className="text-sm text-subtext0 mt-1">Catppuccin Edition</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id && item.id !== 'settings'
                      ? 'bg-blue text-crust font-semibold'
                      : 'text-text hover:bg-surface0'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface0 space-y-3">
          <Tooltip content="Help & Keyboard Shortcuts" placement="right">
            <Button
              color="default"
              variant="flat"
              onPress={() => router.push('/help')}
              className="w-full"
              startContent={<span>❓</span>}
            >
              Help & About
            </Button>
          </Tooltip>
          <p className="text-xs text-subtext0 text-center">v0.1.0</p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {activeSection === 'home' && <HomeSection router={router} />}
          {activeSection === 'catalog' && <CatalogSection />}
          {activeSection === 'downloads' && <DownloadsSection />}
        </motion.div>
      </main>
    </div>
  )
}

function HomeSection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Welcome Home</h2>
        <p className="text-subtext0">
          Your media management dashboard with Catppuccin Macchiato theming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-blue">Quick Stats</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Your statistics will appear here</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-mauve">Recent Items</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Recently added items will show here</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-green">Activity</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">
              Recent activity will be tracked here
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Getting Started</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-3">
            <Button color="primary" size="sm">
              Add Media
            </Button>
            <span className="text-subtext0">
              Start by adding your first media item
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button color="secondary" size="sm">
              Browse Catalog
            </Button>
            <span className="text-subtext0">Explore your media collection</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              color="warning"
              size="sm"
              onPress={() => router.push('/provider-test')}
            >
              Test Providers
            </Button>
            <span className="text-subtext0">
              Test provider framework with mock jobs
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function CatalogSection() {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'f')) && !isModalOpen) {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

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

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'name-desc':
          return b.title.localeCompare(a.title)
        case 'source':
          return a.sourceName.localeCompare(b.sourceName)
        default:
          return 0
      }
    })

    return sorted
  }, [games, debouncedSearchQuery, selectedSource, sortBy])

  const totalPages = Math.ceil(filteredAndSortedGames.length / ITEMS_PER_PAGE)
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAndSortedGames.slice(start, end)
  }, [filteredAndSortedGames, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedSource, sortBy])

  const handleGameClick = useCallback((game: GameEntry) => {
    setSelectedGame(game)
    setIsModalOpen(true)
  }, [])

  const handleDownloadStart = useCallback(() => {
    router.push('/downloads')
  }, [router])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedSource('all')
    setSortBy('name')
  }, [])

  if (!hasCheckedSources) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
          <p className="text-subtext0">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasSources) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
          <p className="text-subtext0">Browse and download games from your sources</p>
        </div>
        <EmptyState type="no-sources" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
          <p className="text-subtext0">Loading games...</p>
        </div>
        <SkeletonGrid count={12} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
          <p className="text-red">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
          <p className="text-subtext0">Browse and download games from your sources</p>
        </div>
        <EmptyState type="no-games" onRefresh={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
        <p className="text-subtext0">
          Browse and download games from your sources ({games.length} total)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tooltip content="Search by title (Ctrl+F or / to focus)">
          <Input
            id="search-input"
            type="text"
            placeholder="Search games... (Press / to focus)"
            value={searchQuery}
            onValueChange={setSearchQuery}
            classNames={{
              inputWrapper: 'bg-surface0 border-surface1',
            }}
            startContent={<span className="text-subtext0">🔍</span>}
            className="flex-1"
          />
        </Tooltip>

        <Tooltip content="Filter by content source">
          <Select
            label="Source"
            placeholder="All sources"
            selectedKeys={selectedSource ? [selectedSource] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string
              setSelectedSource(selected || 'all')
            }}
            classNames={{
              trigger: 'bg-surface0 border-surface1',
            }}
            className="w-full md:w-48"
          >
            {[
              <SelectItem key="all" value="all">
                All sources
              </SelectItem>,
              ...uniqueSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              )),
            ]}
          </Select>
        </Tooltip>

        <Tooltip content="Sort results">
          <Select
            label="Sort by"
            placeholder="Sort by"
            selectedKeys={sortBy ? [sortBy] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string
              setSortBy(selected || 'name')
            }}
            classNames={{
              trigger: 'bg-surface0 border-surface1',
            }}
            className="w-full md:w-48"
          >
            <SelectItem key="name" value="name">
              Name (A-Z)
            </SelectItem>
            <SelectItem key="name-desc" value="name-desc">
              Name (Z-A)
            </SelectItem>
            <SelectItem key="source" value="source">
              Source
            </SelectItem>
          </Select>
        </Tooltip>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-subtext0">
          Showing {paginatedGames.length} of {filteredAndSortedGames.length}{' '}
          games
        </p>
        {(searchQuery || selectedSource !== 'all') && (
          <Tooltip content="Reset all filters to defaults">
            <Button
              size="sm"
              color="default"
              variant="flat"
              onPress={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Games Grid */}
      {filteredAndSortedGames.length === 0 ? (
        <EmptyState type="no-results" onRefresh={handleClearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {paginatedGames.map((game, index) => (
              <GameCard
                key={`${game.sourceId}-${index}`}
                game={game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                classNames={{
                  cursor: 'bg-blue text-crust',
                  item: 'bg-surface0 text-text',
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Game Detail Modal */}
      <GameDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        game={selectedGame}
        onDownloadStart={handleDownloadStart}
      />
    </div>
  )
}

function DownloadsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Downloads</h2>
        <p className="text-subtext0">
          Monitor your active and completed downloads
        </p>
      </div>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Active Downloads</h3>
        </CardHeader>
        <CardBody>
          <p className="text-subtext0">No active downloads at the moment</p>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Download History</h3>
        </CardHeader>
        <CardBody>
          <p className="text-subtext0">
            Your download history will appear here
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
