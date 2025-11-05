import { db } from '@/db/db'
import { Setting, Source, SourceEntry, Job, LibraryEntry } from '@/db/schema'

type LibraryEntryUpsert = Omit<LibraryEntry, 'createdAt' | 'updatedAt'>

export async function getSetting(key: string): Promise<Setting | undefined> {
  try {
    const setting = await db.settings.get(key)
    return setting
  } catch (error) {
    console.error(`[Storage] Error getting setting "${key}":`, error)
    throw error
  }
}

export async function setSetting(key: string, value: any): Promise<string> {
  try {
    const setting: Setting = {
      key,
      value,
      updatedAt: Date.now(),
    }
    await db.settings.put(setting)
    console.log(`[Storage] Setting "${key}" saved successfully`)
    return key
  } catch (error) {
    console.error(`[Storage] Error setting "${key}":`, error)
    throw error
  }
}

export async function getAllSettings(): Promise<Setting[]> {
  try {
    const settings = await db.settings.toArray()
    return settings
  } catch (error) {
    console.error('[Storage] Error getting all settings:', error)
    throw error
  }
}

export async function deleteSetting(key: string): Promise<void> {
  try {
    await db.settings.delete(key)
    console.log(`[Storage] Setting "${key}" deleted successfully`)
  } catch (error) {
    console.error(`[Storage] Error deleting setting "${key}":`, error)
    throw error
  }
}

export async function getSources(): Promise<Source[]> {
  try {
    const sources = await db.sources.toArray()
    return sources
  } catch (error) {
    console.error('[Storage] Error getting sources:', error)
    throw error
  }
}

export async function getSource(id: string): Promise<Source | undefined> {
  try {
    const source = await db.sources.get(id)
    return source
  } catch (error) {
    console.error(`[Storage] Error getting source "${id}":`, error)
    throw error
  }
}

export async function addSource(
  source: Omit<Source, 'id' | 'lastSyncAt' | 'status' | 'entryCount' | 'data'>
): Promise<string> {
  try {
    const id = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSource: Source = {
      ...source,
      id,
      lastSyncAt: null,
      status: 'never_synced',
      entryCount: 0,
      data: null,
      errorMessage: undefined,
    }
    await db.sources.add(newSource)
    console.log(`[Storage] Source "${id}" added successfully`)
    return id
  } catch (error) {
    console.error('[Storage] Error adding source:', error)
    throw error
  }
}

export async function updateSource(
  id: string,
  updates: Partial<Omit<Source, 'id'>>
): Promise<void> {
  try {
    await db.sources.update(id, updates)
    console.log(`[Storage] Source "${id}" updated successfully`)
  } catch (error) {
    console.error(`[Storage] Error updating source "${id}":`, error)
    throw error
  }
}

export async function removeSource(id: string): Promise<void> {
  try {
    // Remove source and all its entries
    await db.sources.delete(id)
    await db.sourceEntries.where('sourceId').equals(id).delete()
    console.log(`[Storage] Source "${id}" and its entries removed successfully`)
  } catch (error) {
    console.error(`[Storage] Error removing source "${id}":`, error)
    throw error
  }
}

export async function clearSourceCache(): Promise<void> {
  try {
    await db.transaction('rw', db.sourceEntries, db.sources, async () => {
      await db.sourceEntries.clear()
      await db.sources.toCollection().modify((source) => {
        source.entryCount = 0
        source.lastSyncAt = null
        source.status = 'never_synced'
        source.errorMessage = undefined
      })
    })
    console.log('[Storage] Source cache cleared successfully')
  } catch (error) {
    console.error('[Storage] Error clearing source cache:', error)
    throw error
  }
}

export async function clearDownloadHistory(): Promise<void> {
  try {
    await db.jobs.clear()
    console.log('[Storage] Download history cleared successfully')
  } catch (error) {
    console.error('[Storage] Error clearing download history:', error)
    throw error
  }
}

// Source Entries functions
export async function getSourceEntries(
  sourceId?: string
): Promise<SourceEntry[]> {
  try {
    let query = db.sourceEntries.toCollection()
    if (sourceId) {
      query = db.sourceEntries.where('sourceId').equals(sourceId)
    }
    const entries = await query.toArray()
    return entries.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('[Storage] Error getting source entries:', error)
    throw error
  }
}

export async function getSourceEntry(
  id: string
): Promise<SourceEntry | undefined> {
  try {
    const entry = await db.sourceEntries.get(id)
    return entry
  } catch (error) {
    console.error(`[Storage] Error getting source entry "${id}":`, error)
    throw error
  }
}

export async function syncSourceEntries(
  sourceId: string,
  entries: Array<{
    title: string
    links: string[]
    meta?: Record<string, unknown>
  }>
): Promise<void> {
  try {
    const now = Date.now()

    // Create entry objects with IDs
    const entryObjects = entries.map((entry, index) => ({
      id: `${sourceId}_entry_${index}_${Date.now()}`,
      sourceId,
      title: entry.title,
      links: entry.links,
      meta: entry.meta || null,
      createdAt: now,
      updatedAt: now,
    }))

    // Remove existing entries for this source
    await db.sourceEntries.where('sourceId').equals(sourceId).delete()

    // Add new entries
    if (entryObjects.length > 0) {
      await db.sourceEntries.bulkAdd(entryObjects)
    }

    console.log(
      `[Storage] Synced ${entryObjects.length} entries for source "${sourceId}"`
    )
  } catch (error) {
    console.error(
      `[Storage] Error syncing source entries for "${sourceId}":`,
      error
    )
    throw error
  }
}

export async function searchSourceEntries(
  query: string
): Promise<SourceEntry[]> {
  try {
    const entries = await db.sourceEntries
      .where('title')
      .startsWithIgnoreCase(query)
      .toArray()
    return entries.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('[Storage] Error searching source entries:', error)
    throw error
  }
}

export async function getJobs(): Promise<Job[]> {
  try {
    const jobs = await db.jobs.toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('[Storage] Error getting jobs:', error)
    throw error
  }
}

export async function getJob(id: string): Promise<Job | undefined> {
  try {
    const job = await db.jobs.get(id)
    return job
  } catch (error) {
    console.error(`[Storage] Error getting job "${id}":`, error)
    throw error
  }
}

export async function addJob(
  job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    const newJob: Job = {
      ...job,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.jobs.add(newJob)
    console.log(`[Storage] Job "${id}" added successfully`)
    return id
  } catch (error) {
    console.error('[Storage] Error adding job:', error)
    throw error
  }
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<Job, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const updatedFields = {
      ...updates,
      updatedAt: Date.now(),
    }
    await db.jobs.update(id, updatedFields)
    console.log(`[Storage] Job "${id}" updated successfully`)
  } catch (error) {
    console.error(`[Storage] Error updating job "${id}":`, error)
    throw error
  }
}

export async function removeJob(id: string): Promise<void> {
  try {
    await db.jobs.delete(id)
    console.log(`[Storage] Job "${id}" removed successfully`)
  } catch (error) {
    console.error(`[Storage] Error removing job "${id}":`, error)
    throw error
  }
}

export async function getJobsByStatus(status: string): Promise<Job[]> {
  try {
    const jobs = await db.jobs.where('status').equals(status).toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error(
      `[Storage] Error getting jobs with status "${status}":`,
      error
    )
    throw error
  }
}

export async function getJobsByProvider(provider: string): Promise<Job[]> {
  try {
    const jobs = await db.jobs.where('provider').equals(provider).toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error(
      `[Storage] Error getting jobs with provider "${provider}":`,
      error
    )
    throw error
  }
}

export async function getLibraryEntries(): Promise<LibraryEntry[]> {
  try {
    const entries = await db.library.orderBy('title').toArray()
    return entries
  } catch (error) {
    console.error('[Storage] Error getting library entries:', error)
    throw error
  }
}

export async function getLibraryEntry(
  id: string
): Promise<LibraryEntry | undefined> {
  try {
    return await db.library.get(id)
  } catch (error) {
    console.error(`[Storage] Error getting library entry "${id}":`, error)
    throw error
  }
}

export async function syncLibraryEntries(
  entries: LibraryEntryUpsert[]
): Promise<void> {
  try {
    const ids = entries.map((entry) => entry.id)
    const existing = await db.library.bulkGet(ids)
    const now = Date.now()

    const upserts = entries.map((entry, index) => {
      const current = existing[index]
      const merged = {
        ...current,
        ...entry,
      }

      return {
        ...merged,
        coverUrl: entry.coverUrl ?? current?.coverUrl ?? null,
        executablePath: entry.executablePath ?? current?.executablePath ?? null,
        lastPlayed: entry.lastPlayed ?? current?.lastPlayed ?? null,
        metadata: entry.metadata ?? current?.metadata ?? null,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      }
    })

    if (upserts.length) {
      await db.library.bulkPut(upserts)
      if (ids.length) {
        await db.library.where('id').noneOf(ids).delete()
      }
    } else {
      await db.library.clear()
    }
  } catch (error) {
    console.error('[Storage] Error syncing library entries:', error)
    throw error
  }
}

export async function updateLibraryEntry(
  id: string,
  updates: Partial<Omit<LibraryEntry, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const payload = {
      ...updates,
      updatedAt: Date.now(),
    }
    await db.library.update(id, payload)
  } catch (error) {
    console.error(`[Storage] Error updating library entry "${id}":`, error)
    throw error
  }
}

export async function removeLibraryEntry(id: string): Promise<void> {
  try {
    await db.library.delete(id)
  } catch (error) {
    console.error(`[Storage] Error removing library entry "${id}":`, error)
    throw error
  }
}
