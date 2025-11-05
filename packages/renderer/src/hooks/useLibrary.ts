'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LibraryEntry } from '@/db/schema'
import {
  getLibraryEntries,
  removeLibraryEntry,
  updateLibraryEntry,
} from '@/services/storage'

interface LibraryStats {
  totalGames: number
  totalSize: number
  recentlyPlayed?: LibraryEntry
}

export function useLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getLibraryEntries()
      setEntries(data)
      setError(null)
    } catch (err) {
      console.error('[useLibrary] Failed to load entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const refresh = useCallback(async () => {
    await loadEntries()
  }, [loadEntries])

  const updateEntry = useCallback(
    async (
      id: string,
      updates: Partial<Omit<LibraryEntry, 'id' | 'createdAt' | 'installPath'>>
    ) => {
      await updateLibraryEntry(id, updates)
      await loadEntries()
    },
    [loadEntries]
  )

  const removeEntry = useCallback(
    async (id: string) => {
      await removeLibraryEntry(id)
      await loadEntries()
    },
    [loadEntries]
  )

  const stats: LibraryStats = useMemo(() => {
    if (!entries.length) {
      return { totalGames: 0, totalSize: 0 }
    }

    const totalSize = entries.reduce((sum, entry) => sum + (entry.size ?? 0), 0)
    const recentlyPlayed = [...entries]
      .filter((entry) => entry.lastPlayed)
      .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))[0]

    return {
      totalGames: entries.length,
      totalSize,
      recentlyPlayed,
    }
  }, [entries])

  return {
    entries,
    isLoading,
    error,
    stats,
    refresh,
    updateEntry,
    removeEntry,
  }
}
