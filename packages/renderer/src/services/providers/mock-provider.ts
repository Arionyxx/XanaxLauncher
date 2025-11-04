/**
 * Mock Provider
 *
 * Fake provider implementation for testing without real API keys.
 * Simulates job lifecycle with timeouts and returns mock data.
 */

import {
  Provider,
  StartJobPayload,
  StartJobResponse,
  JobStatusResponse,
  CancelJobResponse,
  FileLinksResponse,
  TestConnectionResponse,
  JobStatus,
  JobFile,
  ProviderError,
} from '@/types/provider'

interface MockJob {
  id: string
  status: JobStatus
  progress: number
  files: JobFile[]
  createdAt: number
  startedAt?: number
  metadata: {
    originalUrl?: string
    errorMessage?: string
  }
}

export class MockProvider implements Provider {
  readonly name = 'mock'
  private jobs = new Map<string, MockJob>()
  private simulationTimers = new Map<string, NodeJS.Timeout>()

  /**
   * Generate a random job ID
   */
  private generateJobId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Generate mock files based on payload
   */
  private generateMockFiles(payload: StartJobPayload): JobFile[] {
    const baseFileName = payload.url
      ? new URL(payload.url).pathname.split('/').pop() || 'file'
      : 'torrent-content'

    return [
      {
        id: 'file_1',
        name: `${baseFileName}.mkv`,
        size: 1024 * 1024 * 750,
        selected: true,
      },
      {
        id: 'file_2',
        name: `${baseFileName}.srt`,
        size: 1024 * 50,
        selected: true,
      },
      {
        id: 'file_3',
        name: 'sample.mkv',
        size: 1024 * 1024 * 10,
        selected: false,
      },
    ]
  }

  /**
   * Simulate job lifecycle progression
   */
  private simulateJobProgress(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (!job) return

    const timer = setTimeout(() => {
      const currentJob = this.jobs.get(jobId)
      if (!currentJob) return

      switch (currentJob.status) {
        case JobStatus.QUEUED:
          currentJob.status = JobStatus.RESOLVING
          currentJob.progress = 5
          this.simulateJobProgress(jobId)
          break

        case JobStatus.RESOLVING:
          currentJob.status = JobStatus.DOWNLOADING
          currentJob.progress = 10
          currentJob.startedAt = Date.now()
          this.simulateJobProgress(jobId)
          break

        case JobStatus.DOWNLOADING:
          currentJob.progress = Math.min(100, currentJob.progress + 10)
          if (currentJob.progress >= 100) {
            currentJob.status = JobStatus.COMPLETED
            currentJob.progress = 100
            currentJob.files = currentJob.files.map((file) => ({
              ...file,
              url: `https://mock-cdn.example.com/download/${jobId}/${file.id}`,
            }))
            this.cleanupTimer(jobId)
          } else {
            this.simulateJobProgress(jobId)
          }
          break

        default:
          this.cleanupTimer(jobId)
      }
    }, 2000)

    this.simulationTimers.set(jobId, timer)
  }

  /**
   * Clean up simulation timer
   */
  private cleanupTimer(jobId: string): void {
    const timer = this.simulationTimers.get(jobId)
    if (timer) {
      clearTimeout(timer)
      this.simulationTimers.delete(jobId)
    }
  }

  async startJob(payload: StartJobPayload): Promise<StartJobResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!payload.url && !payload.magnet) {
      throw new ProviderError(
        'Either url or magnet must be provided',
        this.name,
        'INVALID_PAYLOAD'
      )
    }

    const jobId = this.generateJobId()
    const files = this.generateMockFiles(payload)

    const job: MockJob = {
      id: jobId,
      status: JobStatus.QUEUED,
      progress: 0,
      files,
      createdAt: Date.now(),
      metadata: {
        originalUrl: payload.url || payload.magnet,
      },
    }

    this.jobs.set(jobId, job)
    this.simulateJobProgress(jobId)

    return {
      jobId,
      status: JobStatus.QUEUED,
    }
  }

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const job = this.jobs.get(jobId)
    if (!job) {
      throw new ProviderError(`Job ${jobId} not found`, this.name, 'NOT_FOUND')
    }

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      files: job.files,
      metadata: job.metadata,
    }
  }

  async cancel(jobId: string): Promise<CancelJobResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const job = this.jobs.get(jobId)
    if (!job) {
      throw new ProviderError(`Job ${jobId} not found`, this.name, 'NOT_FOUND')
    }

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.CANCELLED
    ) {
      return {
        success: false,
        message: `Job is already ${job.status.toLowerCase()}`,
      }
    }

    job.status = JobStatus.CANCELLED
    this.cleanupTimer(jobId)

    return {
      success: true,
      message: 'Job cancelled successfully',
    }
  }

  async getFileLinks(jobId: string): Promise<FileLinksResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const job = this.jobs.get(jobId)
    if (!job) {
      throw new ProviderError(`Job ${jobId} not found`, this.name, 'NOT_FOUND')
    }

    if (job.status !== JobStatus.COMPLETED) {
      throw new ProviderError(
        `Job is not completed (status: ${job.status})`,
        this.name,
        'JOB_NOT_READY'
      )
    }

    return {
      jobId: job.id,
      files: job.files,
    }
  }

  async testConnection(): Promise<TestConnectionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: 'Mock provider connection successful',
      user: {
        username: 'mock_user',
        email: 'mock@example.com',
        premium: true,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      },
    }
  }

  /**
   * Get all jobs (for testing/debugging)
   */
  getAllJobs(): MockJob[] {
    return Array.from(this.jobs.values())
  }

  /**
   * Clear all jobs (for testing)
   */
  clearAllJobs(): void {
    this.simulationTimers.forEach((timer) => clearTimeout(timer))
    this.simulationTimers.clear()
    this.jobs.clear()
  }
}
