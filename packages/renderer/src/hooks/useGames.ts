import { useState, useEffect } from 'react'
import { getSourceEntries, getSources } from '@/services/storage'
import { SourceEntry as DbSourceEntry } from '@/db/schema'
import { SourceEntry } from '@/types/source'

export interface GameEntry extends SourceEntry {
  id: string
  sourceId: string
  sourceName: string
  createdAt: number
}

export function useGames() {
  const [games, setGames] = useState<GameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all source entries and sources
      const [entries, sources] = await Promise.all([
        getSourceEntries(),
        getSources(),
      ])

      // Create a map of source ID to source name for quick lookup
      const sourceMap = new Map(sources.map((s) => [s.id, s.name]))

      // Convert database entries to game entries
      const allGames: GameEntry[] = entries.map((entry: DbSourceEntry) => ({
        id: entry.id,
        title: entry.title,
        links: entry.links,
        meta: entry.meta || {},
        sourceId: entry.sourceId,
        sourceName: sourceMap.get(entry.sourceId) || 'Unknown Source',
        createdAt: entry.createdAt,
      }))

      setGames(allGames)
    } catch (err) {
      console.error('[useGames] Error loading games:', err)
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  return {
    games,
    loading,
    error,
    refresh: loadGames,
  }
}
