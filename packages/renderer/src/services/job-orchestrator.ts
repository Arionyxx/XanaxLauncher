/**
 * Job Orchestrator
 *
 * Manages job queue across all providers with persistence to IndexedDB.
 * Handles job lifecycle, state transitions, and coordination between
 * provider implementations and database storage.
 */

import { db } from '@/db/db'
import {
  Job,
  JobStatus,
  StartJobPayload,
  StartJobResponse,
  JobFile,
  JobMetadata,
  ProviderError,
} from '@/types/provider'
import { providerRegistry } from './providers/registry'

export interface CreateJobOptions {
  provider: string
  payload: StartJobPayload
}

export interface UpdateJobOptions {
  status?: JobStatus
  progress?: number
  files?: JobFile[]
  metadata?: Partial<JobMetadata>
}

class JobOrchestrator {
  /**
   * Create a new job and start it with the specified provider
   * @param options - Job creation options
   * @returns Created job with initial status
   */
  async createJob(options: CreateJobOptions): Promise<Job> {
    const { provider: providerName, payload } = options

    const provider = providerRegistry.getProvider(providerName)

    let response: StartJobResponse
    try {
      response = await provider.startJob(payload)
    } catch (error) {
      // If job creation fails, create a failed job with error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const jobId = `failed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      const failedJob: Job = {
        id: jobId,
        provider: providerName,
        status: JobStatus.FAILED,
        progress: 0,
        files: [],
        metadata: {
          originalUrl: payload.url || payload.magnet,
          errorMessage,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await db.jobs.add({
        id: failedJob.id,
        provider: failedJob.provider,
        status: failedJob.status,
        progress: failedJob.progress,
        files: failedJob.files,
        metadata: failedJob.metadata,
        createdAt: failedJob.createdAt,
        updatedAt: failedJob.updatedAt,
      })

      return failedJob
    }

    const now = Date.now()
    const job: Job = {
      id: response.jobId,
      provider: providerName,
      status: response.status,
      progress: 0,
      files: [],
      metadata: {
        originalUrl: payload.url || payload.magnet,
      },
      createdAt: now,
      updatedAt: now,
    }

    await db.jobs.add({
      id: job.id,
      provider: job.provider,
      status: job.status,
      progress: job.progress,
      files: job.files,
      metadata: job.metadata,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })

    return job
  }

  /**
   * Update job status and persist to database
   * @param jobId - Job identifier
   * @param options - Update options
   */
  async updateJobStatus(
    jobId: string,
    options: UpdateJobOptions
  ): Promise<void> {
    const existingJob = await db.jobs.get(jobId)
    if (!existingJob) {
      throw new Error(`Job ${jobId} not found in database`)
    }

    const updates: Partial<{
      status: string
      progress: number
      files: any[]
      metadata: any
      updatedAt: number
    }> = {
      updatedAt: Date.now(),
    }

    if (options.status !== undefined) {
      this.validateStatusTransition(
        existingJob.status as JobStatus,
        options.status
      )
      updates.status = options.status
    }

    if (options.progress !== undefined) {
      updates.progress = Math.max(0, Math.min(100, options.progress))
    }

    if (options.files !== undefined) {
      updates.files = options.files
    }

    if (options.metadata !== undefined) {
      updates.metadata = {
        ...existingJob.metadata,
        ...options.metadata,
      }
    }

    await db.jobs.update(jobId, updates)
  }

  /**
   * Validate job status transitions follow the state machine
   */
  private validateStatusTransition(
    currentStatus: JobStatus,
    newStatus: JobStatus
  ): void {
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.QUEUED]: [
        JobStatus.RESOLVING,
        JobStatus.FAILED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.RESOLVING]: [
        JobStatus.DOWNLOADING,
        JobStatus.FAILED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.DOWNLOADING]: [
        JobStatus.COMPLETED,
        JobStatus.FAILED,
        JobStatus.CANCELLED,
      ],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
      [JobStatus.CANCELLED]: [],
    }

    const allowed = validTransitions[currentStatus]
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} -> ${newStatus}`
      )
    }
  }

  /**
   * Get a job by ID
   * @param jobId - Job identifier
   * @returns Job or undefined if not found
   */
  async getJob(jobId: string): Promise<Job | undefined> {
    const dbJob = await db.jobs.get(jobId)
    if (!dbJob) return undefined

    return {
      id: dbJob.id,
      provider: dbJob.provider,
      status: dbJob.status as JobStatus,
      progress: dbJob.progress,
      files: dbJob.files,
      metadata: dbJob.metadata,
      createdAt: dbJob.createdAt,
      updatedAt: dbJob.updatedAt,
    }
  }

  /**
   * Get all active (non-completed) jobs
   * @returns Array of active jobs
   */
  async getActiveJobs(): Promise<Job[]> {
    const dbJobs = await db.jobs
      .where('status')
      .notEqual(JobStatus.COMPLETED)
      .and((job) => job.status !== JobStatus.FAILED)
      .and((job) => job.status !== JobStatus.CANCELLED)
      .toArray()

    return dbJobs.map((dbJob) => ({
      id: dbJob.id,
      provider: dbJob.provider,
      status: dbJob.status as JobStatus,
      progress: dbJob.progress,
      files: dbJob.files,
      metadata: dbJob.metadata,
      createdAt: dbJob.createdAt,
      updatedAt: dbJob.updatedAt,
    }))
  }

  /**
   * Get all jobs
   * @returns Array of all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    const dbJobs = await db.jobs.orderBy('createdAt').reverse().toArray()

    return dbJobs.map((dbJob) => ({
      id: dbJob.id,
      provider: dbJob.provider,
      status: dbJob.status as JobStatus,
      progress: dbJob.progress,
      files: dbJob.files,
      metadata: dbJob.metadata,
      createdAt: dbJob.createdAt,
      updatedAt: dbJob.updatedAt,
    }))
  }

  /**
   * Cancel a job via its provider and update database
   * @param jobId - Job identifier
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.CANCELLED ||
      job.status === JobStatus.FAILED
    ) {
      throw new Error(`Job is already ${job.status.toLowerCase()}`)
    }

    const provider = providerRegistry.getProvider(job.provider)

    try {
      await provider.cancel(jobId)
      await this.updateJobStatus(jobId, { status: JobStatus.CANCELLED })
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }
      throw new Error(`Failed to cancel job: ${error}`)
    }
  }

  /**
   * Sync job status from provider
   * Fetches latest status from provider API and updates database
   * @param jobId - Job identifier
   */
  async syncJobStatus(jobId: string): Promise<Job> {
    const job = await this.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    const provider = providerRegistry.getProvider(job.provider)
    
    try {
      const statusResponse = await provider.getStatus(jobId)

      await this.updateJobStatus(jobId, {
        status: statusResponse.status,
        progress: statusResponse.progress,
        files: statusResponse.files,
        metadata: statusResponse.metadata,
      })
    } catch (error) {
      // Mark job as failed and store error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      await this.updateJobStatus(jobId, {
        status: JobStatus.FAILED,
        metadata: {
          errorMessage,
        },
      })
      
      // Re-throw the error so callers can handle it if needed
      throw error
    }

    return (await this.getJob(jobId))!
  }

  /**
   * Get file download links for a completed job
   * @param jobId - Job identifier
   */
  async getFileLinks(jobId: string): Promise<JobFile[]> {
    const job = await this.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status !== JobStatus.COMPLETED) {
      throw new Error(`Job is not completed (status: ${job.status})`)
    }

    const provider = providerRegistry.getProvider(job.provider)
    const response = await provider.getFileLinks(jobId)

    await this.updateJobStatus(jobId, {
      files: response.files,
    })

    return response.files
  }

  /**
   * Delete a job from the database
   * Note: This does not cancel the job on the provider
   * @param jobId - Job identifier
   */
  async deleteJob(jobId: string): Promise<void> {
    await db.jobs.delete(jobId)
  }

  /**
   * Clear all completed jobs from database
   */
  async clearCompletedJobs(): Promise<number> {
    const completed = await db.jobs
      .where('status')
      .equals(JobStatus.COMPLETED)
      .toArray()

    await db.jobs.bulkDelete(completed.map((j) => j.id))
    return completed.length
  }
}

export const jobOrchestrator = new JobOrchestrator()
