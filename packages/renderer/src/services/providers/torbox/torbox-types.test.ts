import { describe, it, expect } from 'vitest'
import {
  torBoxFileSchema,
  torBoxTorrentSchema,
  createTorrentRequestSchema,
  createTorrentResponseSchema,
  getTorrentsResponseSchema,
  controlTorrentResponseSchema,
  userInfoSchema,
  torBoxErrorSchema,
} from './torbox-types'

describe('TorBox Zod Schemas', () => {
  describe('torBoxFileSchema', () => {
    it('should validate valid file', () => {
      const validFile = {
        id: 1,
        name: 'test-file.mp4',
        size: 1073741824,
      }

      const result = torBoxFileSchema.safeParse(validFile)
      expect(result.success).toBe(true)
    })

    it('should reject invalid file', () => {
      const invalidFile = {
        id: 'not-a-number',
        name: 'test-file.mp4',
        size: 1073741824,
      }

      const result = torBoxFileSchema.safeParse(invalidFile)
      expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
      const invalidFile = {
        id: 1,
        name: 'test-file.mp4',
      }

      const result = torBoxFileSchema.safeParse(invalidFile)
      expect(result.success).toBe(false)
    })
  })

  describe('torBoxTorrentSchema', () => {
    it('should validate valid torrent', () => {
      const validTorrent = {
        id: 12345,
        hash: 'abc123def456',
        name: 'Test Torrent',
        size: 1073741824,
        progress: 0.5,
        download_speed: 1048576,
        upload_speed: 524288,
        ratio: 0.5,
        download_state: 'downloading',
        eta: 3600,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z',
        active: true,
      }

      const result = torBoxTorrentSchema.safeParse(validTorrent)
      expect(result.success).toBe(true)
    })

    it('should accept optional fields', () => {
      const torrentWithOptionals = {
        id: 12345,
        hash: 'abc123def456',
        name: 'Test Torrent',
        magnet: 'magnet:?xt=urn:btih:abc123',
        size: 1073741824,
        progress: 0.5,
        download_speed: 1048576,
        upload_speed: 524288,
        ratio: 0.5,
        download_state: 'downloading',
        eta: 3600,
        files: [
          { id: 1, name: 'file1.mp4', size: 536870912 },
          { id: 2, name: 'file2.mp4', size: 536870912 },
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z',
        download_finished: true,
        active: true,
      }

      const result = torBoxTorrentSchema.safeParse(torrentWithOptionals)
      expect(result.success).toBe(true)
    })
  })

  describe('createTorrentRequestSchema', () => {
    it('should validate magnet request', () => {
      const request = {
        magnet: 'magnet:?xt=urn:btih:abc123',
      }

      const result = createTorrentRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should validate url request', () => {
      const request = {
        url: 'https://example.com/torrent.torrent',
      }

      const result = createTorrentRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should validate request with options', () => {
      const request = {
        magnet: 'magnet:?xt=urn:btih:abc123',
        seed: 1,
        allow_zip: true,
      }

      const result = createTorrentRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('createTorrentResponseSchema', () => {
    it('should validate successful response', () => {
      const response = {
        success: true,
        detail: 'Torrent created',
        data: {
          torrent_id: 12345,
          name: 'Test Torrent',
          hash: 'abc123def456',
        },
      }

      const result = createTorrentResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('should validate error response', () => {
      const response = {
        success: false,
        detail: 'Invalid magnet link',
      }

      const result = createTorrentResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('getTorrentsResponseSchema', () => {
    it('should validate torrents list response', () => {
      const response = {
        success: true,
        detail: 'Torrents retrieved',
        data: [
          {
            id: 12345,
            hash: 'abc123def456',
            name: 'Test Torrent',
            size: 1073741824,
            progress: 0.5,
            download_speed: 1048576,
            upload_speed: 524288,
            ratio: 0.5,
            download_state: 'downloading',
            eta: 3600,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T01:00:00Z',
            active: true,
          },
        ],
      }

      const result = getTorrentsResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('controlTorrentResponseSchema', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        detail: 'Operation successful',
      }

      const result = controlTorrentResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('should validate error response', () => {
      const response = {
        success: false,
        detail: 'Torrent not found',
      }

      const result = controlTorrentResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('userInfoSchema', () => {
    it('should validate user info', () => {
      const userInfo = {
        success: true,
        detail: 'User info retrieved',
        data: {
          id: 1,
          email: 'test@example.com',
          plan: 1,
          total_downloaded: 10737418240,
          premium_expires_at: '2025-12-31T23:59:59Z',
          is_subscribed: true,
        },
      }

      const result = userInfoSchema.safeParse(userInfo)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const userInfo = {
        success: true,
        data: {
          id: 1,
          email: 'not-an-email',
          plan: 1,
        },
      }

      const result = userInfoSchema.safeParse(userInfo)
      expect(result.success).toBe(false)
    })
  })

  describe('torBoxErrorSchema', () => {
    it('should validate error response', () => {
      const error = {
        success: false,
        detail: 'An error occurred',
        error: 'ERROR_CODE',
      }

      const result = torBoxErrorSchema.safeParse(error)
      expect(result.success).toBe(true)
    })

    it('should validate minimal error', () => {
      const error = {
        success: false,
        detail: 'An error occurred',
      }

      const result = torBoxErrorSchema.safeParse(error)
      expect(result.success).toBe(true)
    })
  })
})
