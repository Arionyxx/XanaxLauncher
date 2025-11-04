# IndexedDB Persistence

This application uses IndexedDB for local data persistence via the Dexie.js library.

## Database Structure

The application uses a single database: `MediaManagerDB`

### Tables

#### Settings

- `key`: string (primary key)
- `value`: any
- `updatedAt`: number (timestamp)

#### Sources

- `id`: string (primary key)
- `name`: string
- `url`: string
- `lastSyncAt`: number (timestamp)
- `status`: string
- `data`: any

#### Jobs

- `id`: string (primary key)
- `provider`: string
- `status`: string
- `progress`: number
- `metadata`: any
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

## Usage

### Importing Services

```typescript
import {
  getSetting,
  setSetting,
  getAllSettings,
  getSources,
  addSource,
  updateSource,
  removeSource,
  getJobs,
  addJob,
  updateJob,
  removeJob,
} from '@/services/storage'
```

### Settings Operations

```typescript
// Save a setting
await setSetting('appTheme', 'catppuccin-macchiato')

// Get a setting
const setting = await getSetting('appTheme')
console.log(setting?.value)

// Get all settings
const allSettings = await getAllSettings()
```

### Sources Operations

```typescript
// Add a source
const sourceId = await addSource({
  name: 'My Source',
  url: 'https://example.com',
  lastSyncAt: Date.now(),
  status: 'active',
  data: { type: 'rss', items: [] },
})

// List all sources
const sources = await getSources()

// Update a source
await updateSource(sourceId, {
  status: 'inactive',
  lastSyncAt: Date.now(),
})

// Remove a source
await removeSource(sourceId)
```

### Jobs Operations

```typescript
// Add a job
const jobId = await addJob({
  provider: 'my-provider',
  status: 'pending',
  progress: 0,
  metadata: { task: 'download', file: 'example.mp4' },
})

// List all jobs
const jobs = await getJobs()

// Update a job
await updateJob(jobId, {
  status: 'completed',
  progress: 100,
})

// Get jobs by status
const pendingJobs = await getJobsByStatus('pending')

// Remove a job
await removeJob(jobId)
```

## Database Initialization

The database is automatically initialized when the application starts in `packages/renderer/src/app/providers.tsx`.

## Testing

Test buttons are available in the Settings section of the application to verify persistence:

- Save/Load Settings
- Add/List Sources
- Add/List Jobs

All data persists across application restarts.

## Migration

Currently using version 1 of the database schema. Future migrations can be added in `packages/renderer/src/db/schema.ts` by adding additional version definitions:

```typescript
this.version(2)
  .stores({
    // Updated schema
  })
  .upgrade((tx) => {
    // Migration logic
  })
```
