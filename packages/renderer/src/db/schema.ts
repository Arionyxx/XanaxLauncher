import Dexie, { Table } from 'dexie'

export interface Setting {
  key: string
  value: any
  updatedAt: number
}

export interface Source {
  id: string
  name: string
  url: string
  autoSync: boolean
  lastSyncAt: number | null
  status: 'never_synced' | 'syncing' | 'synced' | 'error'
  errorMessage?: string
  entryCount: number
  data: any
}

export interface Job {
  id: string
  provider: string
  status: string
  progress: number
  files: any[]
  metadata: any
  createdAt: number
  updatedAt: number
}

export interface OnboardingState {
  key: 'onboarding'
  completed: boolean
  currentStep: number
  data: {
    downloadDir?: string
    tempDir?: string
    sourceUrl?: string
    torboxToken?: string
    realDebridToken?: string
  }
  updatedAt: number
}

export interface LibraryEntry {
  id: string
  title: string
  installPath: string
  installDate: number
  size: number
  coverUrl?: string | null
  lastPlayed?: number | null
  executablePath?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: number
  updatedAt: number
}

export class MediaManagerDatabase extends Dexie {
  settings!: Table<Setting, string>
  sources!: Table<Source, string>
  jobs!: Table<Job, string>
  onboarding!: Table<OnboardingState, string>
  library!: Table<LibraryEntry, string>

  constructor() {
    super('MediaManagerDB')

    this.version(1).stores({
      settings: 'key, updatedAt',
      sources: 'id, name, status, lastSyncAt',
      jobs: 'id, provider, status, createdAt, updatedAt',
    })

    this.version(2).stores({
      settings: 'key, updatedAt',
      sources: 'id, name, status, lastSyncAt',
      jobs: 'id, provider, status, createdAt, updatedAt',
      onboarding: 'key, updatedAt',
    })

    this.version(3).stores({
      settings: 'key, updatedAt',
      sources: 'id, name, status, lastSyncAt',
      jobs: 'id, provider, status, createdAt, updatedAt',
      onboarding: 'key, updatedAt',
      library: 'id, title, installDate, lastPlayed',
    })
  }
}
