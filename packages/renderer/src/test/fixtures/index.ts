import { Job, JobStatus, JobFile } from '@/types/provider'
import { Settings } from '@/types/settings'

export const createMockJobFile = (
  overrides: Partial<JobFile> = {}
): JobFile => ({
  id: '1',
  name: 'test-file.mp4',
  size: 1073741824,
  url: 'https://example.com/test-file.mp4',
  selected: true,
  ...overrides,
})

export const createMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-123',
  provider: 'torbox',
  status: JobStatus.QUEUED,
  progress: 0,
  files: [createMockJobFile()],
  metadata: {
    originalUrl: 'magnet:?xt=urn:btih:abc123',
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

export const createMockSource = (overrides: Partial<any> = {}): any => ({
  id: 'source-123',
  name: 'Test Source',
  url: 'https://example.com/feed.json',
  autoSync: false,
  lastSyncAt: null,
  status: 'never_synced',
  errorMessage: null,
  entryCount: 0,
  data: null,
  ...overrides,
})

export const createMockSettings = (
  overrides: Partial<Settings> = {}
): Settings => ({
  general: {
    language: 'en',
    downloadDirectory: '/downloads',
    tempDirectory: '/tmp',
  },
  behavior: {
    autoStartEnabled: false,
    minimizeToTray: false,
    bandwidthLimit: 0,
    bandwidthUnit: 'MB/s',
  },
  theme: {
    flavor: 'macchiato',
    accentColor: 'blue',
    compactMode: false,
  },
  integrations: {
    torboxApiToken: undefined,
    realDebridApiToken: undefined,
  },
  privacy: {
    telemetryEnabled: false,
    crashReportsEnabled: false,
    usageStatsEnabled: false,
  },
  ...overrides,
})

export const mockSourceFeed = {
  name: 'Test Feed',
  updatedAt: new Date().toISOString(),
  entries: [
    {
      title: 'Test Game 1',
      links: ['magnet:?xt=urn:btih:abc123'],
      meta: {
        platform: 'PC',
        genre: 'Action',
        size: '10 GB',
      },
    },
    {
      title: 'Test Game 2',
      links: ['magnet:?xt=urn:btih:def456'],
      meta: {
        platform: 'PS5',
        genre: 'RPG',
        size: '50 GB',
      },
    },
  ],
}
