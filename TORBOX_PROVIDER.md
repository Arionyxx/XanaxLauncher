# TorBox Provider Implementation

This document describes the TorBox provider implementation for the application.

## Overview

The TorBox provider enables integration with TorBox's torrent and usenet cloud service. Users can add torrents via magnet links or URLs, monitor their progress, and retrieve download links for completed files.

## Architecture

### File Structure

```
packages/renderer/src/services/providers/torbox/
├── index.ts                  # Module exports
├── torbox-types.ts           # Zod schemas and TypeScript types
├── torbox-api.ts             # HTTP client for TorBox API
└── torbox-provider.ts        # Provider interface implementation
```

### Core Components

#### 1. TorBox Types (`torbox-types.ts`)

Defines Zod schemas for validating TorBox API responses:

- `TorBoxTorrent` - Torrent status and metadata
- `TorBoxFile` - File information within a torrent
- `CreateTorrentResponse` - Response from creating a torrent
- `GetTorrentsResponse` - List of torrents
- `UserInfo` - User account information
- Error schemas for handling API errors

#### 2. TorBox API Client (`torbox-api.ts`)

HTTP client with built-in features:

- **Rate Limiting**: 2 requests/second with burst capacity of 5
- **Retry Logic**: Exponential backoff on network errors and timeouts
- **Request Timeout**: 30 second timeout per request
- **Error Handling**: Graceful error handling with ProviderError

API Methods:

- `createTorrent()` - Create new torrent from magnet/URL
- `getTorrents()` - Get list of user's torrents
- `getTorrent()` - Get specific torrent by ID
- `controlTorrent()` - Delete, pause, or resume torrent
- `getDownloadLink()` - Get direct download URL for a file
- `getUserInfo()` - Get user account information

#### 3. TorBox Provider (`torbox-provider.ts`)

Implements the `Provider` interface:

- **startJob()** - Creates torrent task via TorBox API
- **getStatus()** - Polls TorBox API for task status and maps to JobStatus
- **cancel()** - Deletes torrent from TorBox
- **getFileLinks()** - Retrieves direct download URLs for completed torrents
- **testConnection()** - Validates API token and retrieves user info

Status Mapping:

- TorBox "downloading" → JobStatus.DOWNLOADING
- TorBox "completed" → JobStatus.COMPLETED
- TorBox "metaDL" → JobStatus.RESOLVING
- TorBox "stalled" → JobStatus.QUEUED

## Configuration

### Settings Integration

The TorBox API token is stored in the integrations settings:

```typescript
settings.integrations.torboxApiToken: string | undefined
```

### Environment Variables

Optional environment variable for API URL override:

```bash
NEXT_PUBLIC_TORBOX_API_URL=https://api.torbox.app/v1/api
```

### UI Configuration

Users can configure TorBox in **Settings > Integrations**:

1. Enter API token
2. Click "Test Connection" to validate
3. Save token to persist in IndexedDB
4. Clear token to remove integration

## Usage

### Registering the Provider

```typescript
import { providerRegistry } from '@/services/providers/registry'
import { TorBoxProvider } from '@/services/providers/torbox'

const torboxToken = settings.integrations.torboxApiToken
if (torboxToken) {
  providerRegistry.registerProvider(
    'torbox',
    new TorBoxProvider({ apiToken: torboxToken })
  )
}
```

### Creating a Job

```typescript
import { jobOrchestrator } from '@/services/job-orchestrator'

// Create job with magnet link
await jobOrchestrator.createJob({
  provider: 'torbox',
  payload: {
    magnet: 'magnet:?xt=urn:btih:...',
  },
})

// Or with torrent URL
await jobOrchestrator.createJob({
  provider: 'torbox',
  payload: {
    url: 'https://example.com/file.torrent',
  },
})
```

### Monitoring Job Status

```typescript
// Sync job status from TorBox
const updatedJob = await jobOrchestrator.syncJobStatus(jobId)

// Check status
if (updatedJob.status === JobStatus.COMPLETED) {
  // Get download links
  const files = await jobOrchestrator.getFileLinks(jobId)
  console.log('Download URLs:', files)
}
```

### Canceling a Job

```typescript
await jobOrchestrator.cancelJob(jobId)
```

## Testing

### Provider Test Page

Navigate to `/provider-test` to access the provider testing interface:

1. Select "Torbox" from provider dropdown
2. Enter magnet link or torrent URL
3. Click "Start Job" to create task
4. Use "Sync" to update job status
5. Use "Cancel" to delete task

### Test Connection

In Settings > Integrations:

1. Enter TorBox API token
2. Click "Test Connection"
3. View connection status and user information

## API Rate Limits

- **Rate Limit**: 2 requests per second
- **Burst Capacity**: Up to 5 requests in quick succession
- **Retry Strategy**: Exponential backoff (1s, 2s, 4s delays)
- **Timeout**: 30 seconds per request

## Error Handling

The provider handles various error scenarios:

- **Authentication Errors** (401): Invalid or expired token
- **Not Found Errors** (404): Torrent not found
- **Rate Limit Errors** (429): Too many requests
- **Network Errors**: Connection timeouts and failures
- **Validation Errors**: Invalid API responses

All errors are wrapped in `ProviderError` with appropriate codes and messages.

## Status Lifecycle

```
QUEUED → RESOLVING → DOWNLOADING → COMPLETED
   ↓         ↓            ↓
CANCELLED  CANCELLED   CANCELLED
   ↓         ↓            ↓
FAILED    FAILED       FAILED
```

## Best Practices

1. **Token Security**: Store tokens in IndexedDB (encrypted storage coming soon)
2. **Error Messages**: User-friendly error messages displayed in UI
3. **Rate Limiting**: Built-in rate limiting prevents API abuse
4. **Retry Logic**: Automatic retries on transient errors
5. **Type Safety**: All API responses validated with Zod schemas

## Future Enhancements

- [ ] OAuth device-code flow authentication
- [ ] Encrypted token storage with keytar
- [ ] User account association via Supabase
- [ ] File selection before download
- [ ] Direct file download to local filesystem
- [ ] Usenet integration
- [ ] Torrent caching support
- [ ] Advanced rate limiting based on account tier

## API Documentation

For TorBox API documentation, visit:
https://torbox.app/api-docs

## Related Files

- `packages/renderer/src/types/provider.ts` - Provider interface definition
- `packages/renderer/src/services/providers/registry.ts` - Provider registry
- `packages/renderer/src/services/job-orchestrator.ts` - Job management
- `packages/renderer/src/components/settings/IntegrationsPanel.tsx` - Settings UI
- `packages/renderer/src/app/provider-test/page.tsx` - Test interface
