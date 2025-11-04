import { useState, useEffect } from 'react'
import { db } from '@/db/db'
import { SourceEntry } from '@/types/source'

export interface GameEntry extends SourceEntry {
  sourceId: string
  sourceName: string
}

export function useGames() {
  const [games, setGames] = useState<GameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)

      const sources = await db.sources.toArray()

      const allGames: GameEntry[] = []
      for (const source of sources) {
        if (source.data && source.data.entries && Array.isArray(source.data.entries)) {
          const entries = source.data.entries.map((entry: SourceEntry) => ({
            ...entry,
            sourceId: source.id,
            sourceName: source.name,
          }))
          allGames.push(...entries)
        }
      }

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
