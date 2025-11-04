/**
 * TorBox API Client
 *
 * HTTP client for interacting with TorBox API
 */

import { ProviderError } from '@/types/provider'
import { RateLimiter } from '../utils/rate-limiter'
import { retry } from '../utils/retry'
import {
  CreateTorrentRequest,
  CreateTorrentResponse,
  GetTorrentsResponse,
  ControlTorrentResponse,
  UserInfo,
  createTorrentResponseSchema,
  getTorrentsResponseSchema,
  controlTorrentResponseSchema,
  requestDownloadResponseSchema,
  userInfoSchema,
  torBoxErrorSchema,
} from './torbox-types'

export interface TorBoxApiConfig {
  apiToken: string
  baseUrl?: string
  timeout?: number
}

export class TorBoxApi {
  private readonly apiToken: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly rateLimiter: RateLimiter

  constructor(config: TorBoxApiConfig) {
    this.apiToken = config.apiToken
    this.baseUrl =
      config.baseUrl ||
      process.env.NEXT_PUBLIC_TORBOX_API_URL ||
      'https://api.torbox.app/v1/api'
    this.timeout = config.timeout || 30000
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 2,
      burstSize: 5,
    })
  }

  /**
   * Make HTTP request to TorBox API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this.rateLimiter.execute(async () => {
        return await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        })
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetail: string | undefined

        try {
          const errorData = await response.json()
          const parsedError = torBoxErrorSchema.safeParse(errorData)
          if (parsedError.success) {
            errorDetail = parsedError.data.detail || parsedError.data.error
            errorMessage = errorDetail || errorMessage
          }
        } catch {
          // Ignore JSON parse errors
        }

        throw new ProviderError(
          errorMessage,
          'torbox',
          'API_ERROR',
          response.status
        )
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ProviderError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ProviderError('Request timeout', 'torbox', 'TIMEOUT', 408)
        }
        throw new ProviderError(error.message, 'torbox', 'NETWORK_ERROR')
      }

      throw new ProviderError(
        'Unknown error occurred',
        'torbox',
        'UNKNOWN_ERROR'
      )
    }
  }

  /**
   * Create a new torrent
   */
  async createTorrent(
    request: CreateTorrentRequest
  ): Promise<CreateTorrentResponse> {
    const response = await retry(
      async () => {
        const data = await this.request<CreateTorrentResponse>(
          '/torrents/createtorrent',
          {
            method: 'POST',
            body: JSON.stringify(request),
          }
        )

        return createTorrentResponseSchema.parse(data)
      },
      {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    if (!response.success || !response.data) {
      throw new ProviderError(
        response.detail || 'Failed to create torrent',
        'torbox',
        'CREATE_FAILED'
      )
    }

    return response
  }

  /**
   * Get list of torrents
   */
  async getTorrents(): Promise<GetTorrentsResponse> {
    const response = await retry(
      async () => {
        const data = await this.request<GetTorrentsResponse>(
          '/torrents/mylist',
          {
            method: 'GET',
          }
        )

        return getTorrentsResponseSchema.parse(data)
      },
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    return response
  }

  /**
   * Get a specific torrent by ID
   */
  async getTorrent(torrentId: string): Promise<GetTorrentsResponse> {
    const response = await this.getTorrents()

    if (!response.success || !response.data) {
      throw new ProviderError(
        'Failed to get torrent list',
        'torbox',
        'GET_FAILED'
      )
    }

    const torrentIdNum = parseInt(torrentId, 10)
    const torrent = response.data.find((t) => t.id === torrentIdNum)

    if (!torrent) {
      throw new ProviderError(
        `Torrent ${torrentId} not found`,
        'torbox',
        'NOT_FOUND',
        404
      )
    }

    return {
      success: true,
      data: [torrent],
    }
  }

  /**
   * Control torrent (delete, pause, resume)
   */
  async controlTorrent(
    torrentId: string,
    operation: 'delete' | 'pause' | 'resume'
  ): Promise<ControlTorrentResponse> {
    const response = await retry(
      async () => {
        const data = await this.request<ControlTorrentResponse>(
          `/torrents/controltorrent`,
          {
            method: 'POST',
            body: JSON.stringify({
              torrent_id: parseInt(torrentId, 10),
              operation,
            }),
          }
        )

        return controlTorrentResponseSchema.parse(data)
      },
      {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 3000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    if (!response.success) {
      throw new ProviderError(
        response.detail || `Failed to ${operation} torrent`,
        'torbox',
        'CONTROL_FAILED'
      )
    }

    return response
  }

  /**
   * Get download link for a file
   */
  async getDownloadLink(torrentId: string, fileId: string): Promise<string> {
    const url = `${this.baseUrl}/torrents/requestdl?token=${this.apiToken}&torrent_id=${torrentId}&file_id=${fileId}&zip_link=false`

    const response = await retry(
      async () => {
        const res = await fetch(url, {
          method: 'GET',
          redirect: 'manual',
        })

        if (res.status === 302 || res.status === 301) {
          const location = res.headers.get('location')
          if (!location) {
            throw new ProviderError(
              'No redirect location provided',
              'torbox',
              'DOWNLOAD_FAILED'
            )
          }
          return requestDownloadResponseSchema.parse(location)
        }

        if (!res.ok) {
          throw new ProviderError(
            `Failed to get download link: ${res.status}`,
            'torbox',
            'DOWNLOAD_FAILED',
            res.status
          )
        }

        const text = await res.text()
        return requestDownloadResponseSchema.parse(text)
      },
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    return response
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<UserInfo> {
    const response = await retry(
      async () => {
        const data = await this.request<UserInfo>('/user/me', {
          method: 'GET',
        })

        return userInfoSchema.parse(data)
      },
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    if (!response.success) {
      throw new ProviderError(
        response.detail || 'Failed to get user info',
        'torbox',
        'AUTH_FAILED',
        401
      )
    }

    return response
  }
}
