'use client'

import { LibraryEntry } from '@/db/schema'
import {
  removeLibraryEntry,
  syncLibraryEntries,
  updateLibraryEntry,
} from '@/services/storage'

export interface LibraryScanEntry {
  id: string
  title: string
  installPath: string
  installDate: number
  size: number
  coverUrl?: string | null
  lastPlayed?: number | null
  executablePath?: string | null
  metadata?: Record<string, unknown> | null
}

export interface LibraryScanResponse {
  entries: LibraryScanEntry[]
  scannedPaths: string[]
  errors?: string[]
  duration: number
  found: number
}

interface LibraryApi {
  scan: (request?: { paths?: string[] }) => Promise<LibraryScanResponse>
  launch: (request: {
    id: string
    executablePath: string
    cwd?: string
  }) => Promise<{ success: boolean; message?: string }>
  openFolder: (request: { path: string }) => Promise<{ success: boolean }>
}

function ensureLibraryApi(): LibraryApi {
  if (typeof window === 'undefined' || !window.api?.library) {
    throw new Error('Library API is not available in this environment')
  }

  return window.api.library as LibraryApi
}

export async function scanLibrary(
  paths?: string[]
): Promise<LibraryScanResponse> {
  const api = ensureLibraryApi()
  const uniquePaths = Array.from(new Set(paths?.filter(Boolean) ?? []))

  const response = await api.scan({
    paths: uniquePaths.length ? uniquePaths : undefined,
  })
  const entries = response.entries ?? []

  await syncLibraryEntries(
    entries.map((entry) => ({
      ...entry,
      metadata: entry.metadata ?? null,
      coverUrl: entry.coverUrl ?? null,
      executablePath: entry.executablePath ?? null,
      lastPlayed: entry.lastPlayed ?? null,
    }))
  )

  return response
}

export async function launchGameFromLibrary(
  entry: LibraryEntry
): Promise<void> {
  if (!entry.executablePath) {
    throw new Error('No launch executable has been detected for this game yet')
  }

  const api = ensureLibraryApi()
  const result = await api.launch({
    id: entry.id,
    executablePath: entry.executablePath,
  })

  if (!result.success) {
    throw new Error(result.message ?? 'Failed to launch game')
  }

  await updateLibraryEntry(entry.id, { lastPlayed: Date.now() })
}

export async function openLibraryFolder(path: string): Promise<void> {
  const api = ensureLibraryApi()
  await api.openFolder({ path })
}

export async function unlinkLibraryEntry(id: string): Promise<void> {
  await removeLibraryEntry(id)
}
