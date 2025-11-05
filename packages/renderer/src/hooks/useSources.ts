import { useState, useEffect, useCallback } from 'react'
import { 
  getSources, 
  addSource as addSourceToDb, 
  updateSource as updateSourceInDb, 
  removeSource as removeSourceFromDb 
} from '@/services/storage'
import { 
  syncSource as syncSourceService, 
  syncAllSources as syncAllSourcesService, 
  fetchSource 
} from '@/services/source-sync'
import { SourceFormData, SourcesExport, sourcesExportSchema } from '@/types/source'
import { Source } from '@/db/schema'

export function useSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load sources from IndexedDB on mount
  useEffect(() => {
    const loadSources = async () => {
      try {
        setLoading(true)
        const stored = await getSources()
        setSources(stored)
      } catch (err) {
        console.error('Failed to load sources:', err)
        setError('Failed to load sources')
      } finally {
        setLoading(false)
      }
    }

    loadSources()
  }, [])

  // Refresh sources list
  const refreshSources = useCallback(async () => {
    try {
      const stored = await getSources()
      setSources(stored)
      setError(null)
    } catch (err) {
      console.error('Failed to refresh sources:', err)
      setError('Failed to refresh sources')
    }
  }, [])

  // Add a new source
  const addSource = useCallback(async (data: SourceFormData): Promise<void> => {
    try {
      await addSourceToDb({
        name: data.name,
        url: data.url,
        autoSync: data.autoSync,
      })
      await refreshSources()
    } catch (err) {
      console.error('Failed to add source:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to add source')
    }
  }, [refreshSources])

  // Update an existing source
  const updateSource = useCallback(async (
    id: string, 
    updates: Partial<SourceFormData>
  ): Promise<void> => {
    try {
      await updateSourceInDb(id, updates)
      await refreshSources()
    } catch (err) {
      console.error('Failed to update source:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to update source')
    }
  }, [refreshSources])

  // Remove a source
  const removeSource = useCallback(async (id: string): Promise<void> => {
    try {
      await removeSourceFromDb(id)
      await refreshSources()
    } catch (err) {
      console.error('Failed to remove source:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to remove source')
    }
  }, [refreshSources])

  // Sync a single source
  const syncSource = useCallback(async (id: string): Promise<void> => {
    try {
      // Update status to syncing in UI immediately
      setSources(prev => prev.map(source => 
        source.id === id 
          ? { ...source, status: 'syncing' as const, errorMessage: undefined }
          : source
      ))

      await syncSourceService(id)
      await refreshSources()
    } catch (err) {
      console.error('Failed to sync source:', err)
      // Refresh to get error state
      await refreshSources()
      throw new Error(err instanceof Error ? err.message : 'Failed to sync source')
    }
  }, [refreshSources])

  // Sync all sources
  const syncAllSources = useCallback(async (): Promise<void> => {
    try {
      // Set all sources to syncing status
      setSources(prev => prev.map(source => ({
        ...source,
        status: 'syncing' as const,
        errorMessage: undefined
      })))

      await syncAllSourcesService()
      await refreshSources()
    } catch (err) {
      console.error('Failed to sync all sources:', err)
      await refreshSources()
      throw new Error(err instanceof Error ? err.message : 'Failed to sync sources')
    }
  }, [refreshSources])

  // Test connection to a source URL
  const testConnection = useCallback(async (url: string): Promise<void> => {
    try {
      await fetchSource(url)
    } catch (err) {
      console.error('Connection test failed:', err)
      throw new Error(err instanceof Error ? err.message : 'Connection test failed')
    }
  }, [])

  // Import sources from file data
  const importSources = useCallback(async (data: unknown): Promise<void> => {
    try {
      const result = sourcesExportSchema.safeParse(data)
      if (!result.success) {
        throw new Error('Invalid sources file format')
      }

      // Add each source from the import
      for (const sourceData of result.data.sources) {
        await addSourceToDb({
          name: sourceData.name,
          url: sourceData.url,
          autoSync: sourceData.autoSync,
        })
      }

      await refreshSources()
    } catch (err) {
      console.error('Failed to import sources:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to import sources')
    }
  }, [refreshSources])

  // Export sources to file data
  const exportSources = useCallback(async (): Promise<SourcesExport> => {
    try {
      const exportData: SourcesExport = {
        sources: sources.map(source => ({
          name: source.name,
          url: source.url,
          autoSync: source.autoSync,
        })),
      }
      return exportData
    } catch (err) {
      console.error('Failed to export sources:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to export sources')
    }
  }, [sources])

  return {
    sources,
    loading,
    error,
    refresh: refreshSources,
    addSource,
    updateSource,
    removeSource,
    syncSource,
    syncAllSources,
    testConnection,
    importSources,
    exportSources,
  }
}