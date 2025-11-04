/**
 * Provider Framework Types
 *
 * This module defines the core types for the provider abstraction layer.
 * Providers (TorBox, Real-Debrid, etc.) implement the Provider interface
 * to handle remote download/torrent operations.
 */

/**
 * Job status enumeration
 * Represents the lifecycle of a job from creation to completion/failure
 */
export enum JobStatus {
  QUEUED = 'QUEUED',
  RESOLVING = 'RESOLVING',
  DOWNLOADING = 'DOWNLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * File information within a job
 */
export interface JobFile {
  id: string
  name: string
  size: number
  url?: string
  selected?: boolean
}

/**
 * Job metadata that varies by provider
 */
export interface JobMetadata {
  [key: string]: unknown
  originalUrl?: string
  errorMessage?: string
}

/**
 * Core job type representing a download/task
 */
export interface Job {
  id: string
  provider: string
  status: JobStatus
  progress: number
  files: JobFile[]
  metadata: JobMetadata
  createdAt: number
  updatedAt: number
}

/**
 * Payload for starting a new job
 */
export interface StartJobPayload {
  url?: string
  magnet?: string
  files?: string[]
  [key: string]: unknown
}

/**
 * Response from starting a job
 */
export interface StartJobResponse {
  jobId: string
  status: JobStatus
}

/**
 * Response from getting job status
 */
export interface JobStatusResponse {
  id: string
  status: JobStatus
  progress: number
  files: JobFile[]
  metadata: JobMetadata
}

/**
 * Response from cancelling a job
 */
export interface CancelJobResponse {
  success: boolean
  message?: string
}

/**
 * Response from getting file download links
 */
export interface FileLinksResponse {
  jobId: string
  files: JobFile[]
}

/**
 * Response from testing connection
 */
export interface TestConnectionResponse {
  success: boolean
  message?: string
  user?: {
    username?: string
    email?: string
    premium?: boolean
    expiresAt?: number
  }
}

/**
 * Provider interface
 * All provider implementations must implement these methods
 */
export interface Provider {
  /**
   * Unique provider name (e.g., 'torbox', 'real-debrid')
   */
  readonly name: string

  /**
   * Start a new job (download/task)
   * @param payload - Job payload with URL/magnet link
   * @returns Promise with job ID and initial status
   */
  startJob(payload: StartJobPayload): Promise<StartJobResponse>

  /**
   * Get current status of a job
   * @param jobId - Unique job identifier
   * @returns Promise with job status, progress, and files
   */
  getStatus(jobId: string): Promise<JobStatusResponse>

  /**
   * Cancel a running or queued job
   * @param jobId - Unique job identifier
   * @returns Promise with cancellation result
   */
  cancel(jobId: string): Promise<CancelJobResponse>

  /**
   * Get download URLs for completed job files
   * @param jobId - Unique job identifier
   * @returns Promise with file download links
   */
  getFileLinks(jobId: string): Promise<FileLinksResponse>

  /**
   * Test provider connection and credentials
   * @returns Promise with connection status and user info
   */
  testConnection(): Promise<TestConnectionResponse>
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
  [key: string]: unknown
}

/**
 * Error thrown by providers
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}
