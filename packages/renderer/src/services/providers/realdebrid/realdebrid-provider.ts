/**
 * Real-Debrid Provider
 *
 * Provider implementation for Real-Debrid service
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
import { RealDebridApi, RealDebridApiConfig } from './realdebrid-api'
import { RealDebridStatus, RealDebridTorrent } from './realdebrid-types'

export class RealDebridProvider implements Provider {
  readonly name = 'realdebrid'
  private api: RealDebridApi

  constructor(config: RealDebridApiConfig) {
    this.api = new RealDebridApi(config)
  }

  /**
   * Map Real-Debrid status to JobStatus enum
   */
  private mapStatus(rdStatus: string): JobStatus {
    switch (rdStatus.toLowerCase()) {
      case RealDebridStatus.DOWNLOADING:
        return JobStatus.DOWNLOADING
      case RealDebridStatus.DOWNLOADED:
        return JobStatus.COMPLETED
      case RealDebridStatus.UPLOADING:
        return JobStatus.DOWNLOADING
      case RealDebridStatus.COMPRESSING:
        return JobStatus.DOWNLOADING
      case RealDebridStatus.MAGNET_CONVERSION:
        return JobStatus.RESOLVING
      case RealDebridStatus.WAITING_FILES_SELECTION:
        return JobStatus.RESOLVING
      case RealDebridStatus.QUEUED:
        return JobStatus.QUEUED
      case RealDebridStatus.ERROR:
      case RealDebridStatus.MAGNET_ERROR:
      case RealDebridStatus.VIRUS:
      case RealDebridStatus.DEAD:
        return JobStatus.FAILED
      default:
        return JobStatus.QUEUED
    }
  }

  /**
   * Map Real-Debrid torrent to JobFile array
   */
  private mapFiles(torrent: RealDebridTorrent): JobFile[] {
    if (!torrent.files || torrent.files.length === 0) {
      return [
        {
          id: torrent.id,
          name: torrent.filename,
          size: torrent.bytes,
          selected: true,
        },
      ]
    }

    return torrent.files.map((file) => ({
      id: file.id.toString(),
      name: file.path.split('/').pop() || file.path,
      size: file.bytes,
      selected: file.selected === 1,
    }))
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(torrent: RealDebridTorrent): number {
    if (torrent.status === RealDebridStatus.DOWNLOADED) {
      return 100
    }

    return Math.max(0, Math.min(100, torrent.progress))
  }

  async startJob(payload: StartJobPayload): Promise<StartJobResponse> {
    if (!payload.magnet) {
      throw new ProviderError(
        'Real-Debrid only supports magnet links',
        this.name,
        'INVALID_PAYLOAD'
      )
    }

    const response = await this.api.addMagnet({
      magnet: payload.magnet,
    })

    const torrentId = response.id

    try {
      const torrentInfo = await this.api.getTorrentInfo(torrentId)

      if (
        torrentInfo.status === RealDebridStatus.WAITING_FILES_SELECTION &&
        torrentInfo.files &&
        torrentInfo.files.length > 0
      ) {
        const fileIds = torrentInfo.files.map((f) => f.id).join(',')
        await this.api.selectFiles(torrentId, fileIds)
      }
    } catch (error) {
      console.error('Failed to auto-select files:', error)
    }

    return {
      jobId: torrentId,
      status: JobStatus.QUEUED,
    }
  }

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const torrent = await this.api.getTorrentInfo(jobId)

      const status = this.mapStatus(torrent.status)
      const progress = this.calculateProgress(torrent)
      const files = this.mapFiles(torrent)

      return {
        id: jobId,
        status,
        progress,
        files,
        metadata: {
          originalUrl: `magnet:?xt=urn:btih:${torrent.hash}`,
          hash: torrent.hash,
          downloadSpeed: torrent.speed,
          seeders: torrent.seeders,
          addedAt: torrent.added,
          completedAt: torrent.ended,
        },
      }
    } catch (error) {
      if (error instanceof ProviderError && error.statusCode === 404) {
        throw new ProviderError(
          `Torrent ${jobId} not found`,
          this.name,
          'NOT_FOUND',
          404
        )
      }
      throw error
    }
  }

  async cancel(jobId: string): Promise<CancelJobResponse> {
    try {
      await this.api.deleteTorrent(jobId)

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

    const torrent = await this.api.getTorrentInfo(jobId)

    if (!torrent.links || torrent.links.length === 0) {
      throw new ProviderError(
        'No download links available',
        this.name,
        'NO_LINKS'
      )
    }

    const filesWithLinks = await Promise.all(
      torrent.links.map(async (link, index) => {
        try {
          const unrestricted = await this.api.unrestrictLink({ link })
          const file = statusResponse.files[index] || {
            id: `${index}`,
            name: unrestricted.filename,
            size: unrestricted.filesize || 0,
          }

          return {
            ...file,
            url: unrestricted.download,
          }
        } catch (error) {
          console.error(`Failed to unrestrict link ${link}:`, error)
          const file = statusResponse.files[index] || {
            id: `${index}`,
            name: 'Unknown',
            size: 0,
          }
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

      const isPremium = userInfo.premium > 0
      const expiresAt = userInfo.expiration
        ? new Date(userInfo.expiration).getTime()
        : undefined

      return {
        success: true,
        message: 'Successfully connected to Real-Debrid',
        user: {
          username: userInfo.username,
          email: userInfo.email,
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
