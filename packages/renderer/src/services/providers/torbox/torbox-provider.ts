/**
 * TorBox Provider
 *
 * Provider implementation for TorBox service
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
import { TorBoxApi, TorBoxApiConfig } from './torbox-api'
import { TorBoxStatus, TorBoxTorrent } from './torbox-types'

export class TorBoxProvider implements Provider {
  readonly name = 'torbox'
  private api: TorBoxApi

  constructor(config: TorBoxApiConfig) {
    this.api = new TorBoxApi(config)
  }

  /**
   * Map TorBox status to JobStatus enum
   */
  private mapStatus(torBoxStatus: string): JobStatus {
    switch (torBoxStatus.toLowerCase()) {
      case TorBoxStatus.DOWNLOADING:
        return JobStatus.DOWNLOADING
      case TorBoxStatus.UPLOADING:
        return JobStatus.DOWNLOADING
      case TorBoxStatus.COMPLETED:
        return JobStatus.COMPLETED
      case TorBoxStatus.CACHED:
        return JobStatus.COMPLETED
      case TorBoxStatus.METADL:
        return JobStatus.RESOLVING
      case TorBoxStatus.CHECKINGFILES:
        return JobStatus.RESOLVING
      case TorBoxStatus.STALLED:
        return JobStatus.QUEUED
      case TorBoxStatus.PAUSED:
        return JobStatus.QUEUED
      default:
        return JobStatus.QUEUED
    }
  }

  /**
   * Map TorBox torrent to JobFile array
   */
  private mapFiles(torrent: TorBoxTorrent): JobFile[] {
    if (!torrent.files || torrent.files.length === 0) {
      return [
        {
          id: torrent.id.toString(),
          name: torrent.name,
          size: torrent.size,
          selected: true,
        },
      ]
    }

    return torrent.files.map((file) => ({
      id: file.id.toString(),
      name: file.name,
      size: file.size,
      selected: true,
    }))
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(torrent: TorBoxTorrent): number {
    if (torrent.download_finished || torrent.progress >= 100) {
      return 100
    }

    return Math.max(0, Math.min(100, torrent.progress))
  }

  async startJob(payload: StartJobPayload): Promise<StartJobResponse> {
    if (!payload.url && !payload.magnet) {
      throw new ProviderError(
        'Either url or magnet must be provided',
        this.name,
        'INVALID_PAYLOAD'
      )
    }

    const request = {
      magnet: payload.magnet,
      url: payload.url,
      seed: 1,
      allow_zip: false,
    }

    const response = await this.api.createTorrent(request)

    if (!response.data) {
      throw new ProviderError(
        'No torrent data returned',
        this.name,
        'CREATE_FAILED'
      )
    }

    return {
      jobId: response.data.torrent_id.toString(),
      status: JobStatus.QUEUED,
    }
  }

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.api.getTorrent(jobId)

    if (!response.data || response.data.length === 0) {
      throw new ProviderError(
        `Torrent ${jobId} not found`,
        this.name,
        'NOT_FOUND',
        404
      )
    }

    const torrent = response.data[0]
    const status = this.mapStatus(torrent.download_state)
    const progress = this.calculateProgress(torrent)
    const files = this.mapFiles(torrent)

    return {
      id: jobId,
      status,
      progress,
      files,
      metadata: {
        originalUrl: torrent.magnet,
        hash: torrent.hash,
        downloadSpeed: torrent.download_speed,
        uploadSpeed: torrent.upload_speed,
        eta: torrent.eta,
        ratio: torrent.ratio,
        active: torrent.active,
      },
    }
  }

  async cancel(jobId: string): Promise<CancelJobResponse> {
    try {
      await this.api.controlTorrent(jobId, 'delete')

      return {
        success: true,
        message: 'Torrent deleted successfully',
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        if (error.statusCode === 404) {
          return {
            success: false,
            message: 'Torrent not found',
          }
        }
        throw error
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getFileLinks(jobId: string): Promise<FileLinksResponse> {
    const statusResponse = await this.getStatus(jobId)

    if (statusResponse.status !== JobStatus.COMPLETED) {
      throw new ProviderError(
        `Torrent is not completed (status: ${statusResponse.status})`,
        this.name,
        'JOB_NOT_READY'
      )
    }

    const filesWithLinks = await Promise.all(
      statusResponse.files.map(async (file) => {
        try {
          const url = await this.api.getDownloadLink(jobId, file.id)
          return {
            ...file,
            url,
          }
        } catch (error) {
          console.error(`Failed to get link for file ${file.id}:`, error)
          return file
        }
      })
    )

    return {
      jobId,
      files: filesWithLinks,
    }
  }

  async testConnection(): Promise<TestConnectionResponse> {
    try {
      const userInfo = await this.api.getUserInfo()

      if (!userInfo.data) {
        return {
          success: false,
          message: 'Failed to retrieve user information',
        }
      }

      const isPremium =
        userInfo.data.is_subscribed ||
        (userInfo.data.plan !== undefined && userInfo.data.plan > 0)
      const expiresAt = userInfo.data.premium_expires_at
        ? new Date(userInfo.data.premium_expires_at).getTime()
        : undefined

      return {
        success: true,
        message: 'Successfully connected to TorBox',
        user: {
          email: userInfo.data.email,
          premium: isPremium,
          expiresAt,
        },
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        return {
          success: false,
          message: error.message,
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }
}
