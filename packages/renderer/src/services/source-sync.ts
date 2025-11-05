import { Source } from '@/db/schema'
import { getSource, updateSource, getSources, syncSourceEntries } from '@/services/storage'
import { sourceDataSchema, SourceData } from '@/types/source'

export interface SyncProgress {
  total: number
  completed: number
  current: string
  errors: Array<{ id: string; name: string; error: string }>
}

export type SyncProgressCallback = (progress: SyncProgress) => void

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000
const SYNC_COOLDOWN = 60 * 60 * 1000 // 1 hour in milliseconds

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    await delay(delayMs)
    return retry(fn, retries - 1, delayMs * 2)
  }
}

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.href
  } catch {
    throw new Error('Invalid URL format')
  }
}

export async function fetchSource(url: string): Promise<SourceData> {
  const sanitizedUrl = sanitizeUrl(url)

  const response = await fetch(sanitizedUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON')
  }

  const data = await response.json()

  const validationResult = sourceDataSchema.safeParse(data)
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((e: any) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    throw new Error(`Invalid JSON schema: ${errors}`)
  }

  return validationResult.data
}

export async function syncSource(id: string): Promise<void> {
  const source = await getSource(id)
  if (!source) {
    throw new Error('Source not found')
  }

  // Update status to syncing
  await updateSource(id, {
    status: 'syncing',
    errorMessage: undefined,
  })

  try {
    const data = await retry(() => fetchSource(source.url))

    // Sync entries to sourceEntries table
    await syncSourceEntries(id, data.entries)

    await updateSource(id, {
      status: 'synced',
      lastSyncAt: Date.now(),
      errorMessage: undefined,
      entryCount: data.entries.length,
      data,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    await updateSource(id, {
      status: 'error',
      errorMessage,
    })

    throw error
  }
}

export async function syncAllSources(
  onProgress?: SyncProgressCallback
): Promise<void> {
  const sources = await getSources()

  if (sources.length === 0) {
    return
  }

  const progress: SyncProgress = {
    total: sources.length,
    completed: 0,
    current: '',
    errors: [],
  }

  for (const source of sources) {
    progress.current = source.name
    if (onProgress) {
      onProgress({ ...progress })
    }

    try {
      await syncSource(source.id)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      progress.errors.push({
        id: source.id,
        name: source.name,
        error: errorMessage,
      })
    }

    progress.completed++
    if (onProgress) {
      onProgress({ ...progress })
    }
  }
}

export async function autoSyncSources(): Promise<void> {
  const sources = await getSources()
  const now = Date.now()

  const sourcesToSync = sources.filter((source) => {
    if (!source.autoSync) return false

    // Skip if recently synced (within cooldown period)
    if (source.lastSyncAt !== null && now - source.lastSyncAt < SYNC_COOLDOWN) {
      return false
    }

    return true
  })

  console.log(`[SourceSync] Auto-syncing ${sourcesToSync.length} sources`)

  for (const source of sourcesToSync) {
    try {
      await syncSource(source.id)
      console.log(`[SourceSync] Successfully synced "${source.name}"`)
    } catch (error) {
      console.error(`[SourceSync] Failed to sync "${source.name}":`, error)
    }
  }
}

export function shouldSync(source: Source): boolean {
  if (!source.autoSync) return false

  if (source.lastSyncAt === null) return true

  const now = Date.now()
  return now - source.lastSyncAt >= SYNC_COOLDOWN
}
