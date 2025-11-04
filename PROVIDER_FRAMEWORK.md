# Provider Framework

This document describes the provider abstraction layer for handling remote download services (TorBox, Real-Debrid, etc.).

## Overview

The provider framework provides a unified interface for interacting with different download/debrid services. It includes:

- **Provider Interface**: Standard interface all providers must implement
- **Job Orchestration**: Manages job lifecycle across providers
- **Utilities**: Rate limiting, retry logic, and validation helpers
- **Mock Provider**: Testing implementation without real API keys
- **IPC Integration**: Electron IPC channels for main/renderer communication
- **Database Persistence**: Jobs persisted to IndexedDB

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Renderer Process                     │
├─────────────────────────────────────────────────────────┤
│  UI Components                                           │
│    └─ Provider Test Page (/provider-test)               │
│                                                          │
│  Job Orchestrator                                        │
│    └─ Create/Update/Cancel/Sync Jobs                    │
│    └─ State Machine & Validation                        │
│                                                          │
│  Provider Registry                                       │
│    ├─ Mock Provider                                     │
│    ├─ TorBox Provider (future)                          │
│    └─ Real-Debrid Provider (future)                     │
│                                                          │
│  Utilities                                              │
│    ├─ Rate Limiter (token bucket)                      │
│    ├─ Retry Logic (exponential backoff)                │
│    └─ Validators (Zod schemas)                         │
│                                                          │
│  IndexedDB (Dexie)                                      │
│    └─ Jobs Table                                        │
└─────────────────────────────────────────────────────────┘
                           │
                    IPC Channels
                           │
┌─────────────────────────────────────────────────────────┐
│                      Main Process                        │
├─────────────────────────────────────────────────────────┤
│  IPC Handlers (stub implementations)                    │
│    ├─ provider:start-job                               │
│    ├─ provider:get-status                              │
│    ├─ provider:cancel-job                              │
│    └─ provider:test-connection                         │
└─────────────────────────────────────────────────────────┘
```

## Core Types

### Provider Interface

All providers implement the `Provider` interface:

```typescript
interface Provider {
  readonly name: string
  startJob(payload: StartJobPayload): Promise<StartJobResponse>
  getStatus(jobId: string): Promise<JobStatusResponse>
  cancel(jobId: string): Promise<CancelJobResponse>
  getFileLinks(jobId: string): Promise<FileLinksResponse>
  testConnection(): Promise<TestConnectionResponse>
}
```

### Job Type

Jobs represent download/task operations:

```typescript
interface Job {
  id: string
  provider: string
  status: JobStatus
  progress: number
  files: JobFile[]
  metadata: JobMetadata
  createdAt: number
  updatedAt: number
}
```

### Job Status Enum

Job lifecycle states:

- `QUEUED` - Job created, waiting to start
- `RESOLVING` - Resolving links/metadata
- `DOWNLOADING` - Actively downloading
- `COMPLETED` - Successfully completed
- `FAILED` - Job failed with error
- `CANCELLED` - Cancelled by user

## Usage

### Register a Provider

```typescript
import { providerRegistry } from '@/services/providers/registry'
import { MockProvider } from '@/services/providers/mock-provider'

// Register mock provider
providerRegistry.registerProvider('mock', new MockProvider())
```

### Create a Job

```typescript
import { jobOrchestrator } from '@/services/job-orchestrator'

const job = await jobOrchestrator.createJob({
  provider: 'mock',
  payload: {
    url: 'https://example.com/file.zip',
  },
})
```

### Sync Job Status

```typescript
const updatedJob = await jobOrchestrator.syncJobStatus(jobId)
console.log(updatedJob.status, updatedJob.progress)
```

### Cancel a Job

```typescript
await jobOrchestrator.cancelJob(jobId)
```

### Get Active Jobs

```typescript
const activeJobs = await jobOrchestrator.getActiveJobs()
```

## Utilities

### Rate Limiter

Token bucket rate limiter for API requests:

```typescript
import { RateLimiter } from '@/services/providers/utils/rate-limiter'

const limiter = new RateLimiter({
  requestsPerSecond: 2,
  burstSize: 5,
})

await limiter.execute(async () => {
  // Your API call here
})
```

### Retry Logic

Exponential backoff retry:

```typescript
import { retry } from '@/services/providers/utils/retry'

const result = await retry(
  async () => {
    // Your operation here
  },
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
  }
)
```

### Validation

Zod schemas for type-safe validation:

```typescript
import { startJobPayloadSchema } from '@/services/providers/utils/validator'

const validatedPayload = startJobPayloadSchema.parse(rawPayload)
```

## Mock Provider

The `MockProvider` simulates a real provider for testing:

- Generates fake job IDs
- Simulates job progression (QUEUED → RESOLVING → DOWNLOADING → COMPLETED)
- Returns mock file data
- Progresses automatically every 2 seconds
- No API keys required

## Test UI

Visit `/provider-test` to test the provider framework:

- Create new jobs with mock provider
- Watch job progress in real-time
- Test connection to provider
- Cancel running jobs
- View all jobs from database
- Clear completed jobs

## Database Schema

Jobs are stored in IndexedDB:

```typescript
{
  id: string          // Primary key, unique job ID
  provider: string    // Provider name (indexed)
  status: string      // Job status (indexed)
  progress: number    // 0-100
  files: any[]        // Array of job files
  metadata: any       // Provider-specific metadata
  createdAt: number   // Timestamp (indexed)
  updatedAt: number   // Timestamp (indexed)
}
```

## IPC Channels

The following IPC channels are available:

- `provider:start-job` - Start a new job
- `provider:get-status` - Get job status
- `provider:cancel-job` - Cancel a job
- `provider:test-connection` - Test provider connection

Note: Current IPC handlers are stubs. Actual provider logic runs in renderer process.

## Adding New Providers

To add a new provider (e.g., TorBox):

1. Create `packages/renderer/src/services/providers/torbox-provider.ts`
2. Implement the `Provider` interface
3. Use rate limiter and retry utilities
4. Validate responses with Zod schemas
5. Register in provider registry
6. Test with provider test UI

Example:

```typescript
export class TorBoxProvider implements Provider {
  readonly name = 'torbox'

  constructor(private config: ProviderConfig) {}

  async startJob(payload: StartJobPayload): Promise<StartJobResponse> {
    // Implementation
  }

  // ... other methods
}
```

## State Machine

Job status transitions follow a strict state machine:

```
QUEUED ──→ RESOLVING ──→ DOWNLOADING ──→ COMPLETED
  │            │              │
  ↓            ↓              ↓
CANCELLED   CANCELLED      CANCELLED
  │            │              │
  ↓            ↓              ↓
FAILED       FAILED         FAILED
```

Invalid transitions throw an error.

## Error Handling

Use `ProviderError` for provider-specific errors:

```typescript
throw new ProviderError('Job not found', 'torbox', 'NOT_FOUND', 404)
```

## Next Steps

1. Implement TorBox provider with real API
2. Implement Real-Debrid provider with real API
3. Add authentication/API key management
4. Implement actual file download logic
5. Add progress polling/webhooks
6. Add retry logic for failed jobs
7. Implement file selection UI
8. Add download bandwidth limiting

## Files

### Types

- `packages/renderer/src/types/provider.ts` - Core types and interfaces

### Services

- `packages/renderer/src/services/job-orchestrator.ts` - Job management
- `packages/renderer/src/services/providers/registry.ts` - Provider registry
- `packages/renderer/src/services/providers/mock-provider.ts` - Mock implementation
- `packages/renderer/src/services/providers/index.ts` - Exports

### Utilities

- `packages/renderer/src/services/providers/utils/rate-limiter.ts` - Rate limiting
- `packages/renderer/src/services/providers/utils/retry.ts` - Retry logic
- `packages/renderer/src/services/providers/utils/validator.ts` - Zod schemas

### UI

- `packages/renderer/src/app/provider-test/page.tsx` - Test UI page

### IPC

- `packages/main/src/ipc/channels.ts` - Channel definitions
- `packages/main/src/ipc/schemas.ts` - Request/response schemas
- `packages/main/src/ipc/handlers.ts` - Handler implementations

### Database

- `packages/renderer/src/db/schema.ts` - Dexie schema with Jobs table
