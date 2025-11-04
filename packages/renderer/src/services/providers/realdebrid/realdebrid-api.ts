/**
 * Real-Debrid API Client
 *
 * HTTP client for interacting with Real-Debrid API
 */

import { ProviderError } from '@/types/provider'
import { RateLimiter } from '../utils/rate-limiter'
import { retry } from '../utils/retry'
import {
  AddMagnetRequest,
  AddMagnetResponse,
  TorrentInfoResponse,
  UnrestrictLinkRequest,
  UnrestrictLinkResponse,
  UserInfo,
  addMagnetResponseSchema,
  torrentInfoResponseSchema,
  unrestrictLinkResponseSchema,
  userInfoSchema,
  realDebridErrorSchema,
} from './realdebrid-types'

export interface RealDebridApiConfig {
  apiToken: string
  baseUrl?: string
  timeout?: number
}

export class RealDebridApi {
  private readonly apiToken: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly rateLimiter: RateLimiter

  constructor(config: RealDebridApiConfig) {
    this.apiToken = config.apiToken
    this.baseUrl =
      config.baseUrl ||
      process.env.NEXT_PUBLIC_REALDEBRID_API_URL ||
      'https://api.real-debrid.com/rest/1.0'
    this.timeout = config.timeout || 30000
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 5,
      burstSize: 10,
    })
  }

  /**
   * Make HTTP request to Real-Debrid API
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
          const parsedError = realDebridErrorSchema.safeParse(errorData)
          if (parsedError.success) {
            errorDetail = parsedError.data.error
            errorMessage = errorDetail || errorMessage
          }
        } catch {
          // Ignore JSON parse errors
        }

        throw new ProviderError(
          errorMessage,
          'realdebrid',
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
          throw new ProviderError(
            'Request timeout',
            'realdebrid',
            'TIMEOUT',
            408
          )
        }
        throw new ProviderError(error.message, 'realdebrid', 'NETWORK_ERROR')
      }

      throw new ProviderError(
        'Unknown error occurred',
        'realdebrid',
        'UNKNOWN_ERROR'
      )
    }
  }

  /**
   * Add a magnet link
   */
  async addMagnet(request: AddMagnetRequest): Promise<AddMagnetResponse> {
    const formData = new URLSearchParams()
    formData.append('magnet', request.magnet)

    const response = await retry(
      async () => {
        const data = await this.request<AddMagnetResponse>(
          '/torrents/addMagnet',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          }
        )

        return addMagnetResponseSchema.parse(data)
      },
      {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )

    return response
  }

  /**
   * Get torrent info
   */
  async getTorrentInfo(torrentId: string): Promise<TorrentInfoResponse> {
    const response = await retry(
      async () => {
        const data = await this.request<TorrentInfoResponse>(
          `/torrents/info/${torrentId}`,
          {
            method: 'GET',
          }
        )

        return torrentInfoResponseSchema.parse(data)
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
   * Select files for torrent
   */
  async selectFiles(torrentId: string, fileIds: string): Promise<void> {
    const formData = new URLSearchParams()
    formData.append('files', fileIds)

    await retry(
      async () => {
        await this.request<void>(`/torrents/selectFiles/${torrentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        })
      },
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )
  }

  /**
   * Delete a torrent
   */
  async deleteTorrent(torrentId: string): Promise<void> {
    await retry(
      async () => {
        await this.request<void>(`/torrents/delete/${torrentId}`, {
          method: 'DELETE',
        })
      },
      {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 3000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
      }
    )
  }

  /**
   * Unrestrict a link
   */
  async unrestrictLink(
    request: UnrestrictLinkRequest
  ): Promise<UnrestrictLinkResponse> {
    const formData = new URLSearchParams()
    formData.append('link', request.link)

    const response = await retry(
      async () => {
        const data = await this.request<UnrestrictLinkResponse>(
          '/unrestrict/link',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          }
        )

        return unrestrictLinkResponseSchema.parse(data)
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
        const data = await this.request<UserInfo>('/user', {
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

    return response
  }
}
