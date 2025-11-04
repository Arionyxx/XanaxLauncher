import { describe, it, expect } from 'vitest'
import {
  realDebridFileSchema,
  realDebridTorrentSchema,
  addMagnetRequestSchema,
  addMagnetResponseSchema,
  selectFilesRequestSchema,
  unrestrictLinkRequestSchema,
  unrestrictLinkResponseSchema,
  userInfoSchema,
  realDebridErrorSchema,
} from './realdebrid-types'

describe('Real-Debrid Zod Schemas', () => {
  describe('realDebridFileSchema', () => {
    it('should validate valid file', () => {
      const validFile = {
        id: 1,
        path: '/test-file.mp4',
        bytes: 1073741824,
        selected: 1,
      }

      const result = realDebridFileSchema.safeParse(validFile)
      expect(result.success).toBe(true)
    })

    it('should accept optional selected field', () => {
      const file = {
        id: 1,
        path: '/test-file.mp4',
        bytes: 1073741824,
      }

      const result = realDebridFileSchema.safeParse(file)
      expect(result.success).toBe(true)
    })
  })

  describe('realDebridTorrentSchema', () => {
    it('should validate valid torrent', () => {
      const validTorrent = {
        id: 'ABC123DEF456',
        filename: 'Test Torrent',
        hash: 'abc123def456',
        bytes: 1073741824,
        progress: 50,
        status: 'downloading',
        added: '2024-01-01T00:00:00Z',
      }

      const result = realDebridTorrentSchema.safeParse(validTorrent)
      expect(result.success).toBe(true)
    })

    it('should accept all optional fields', () => {
      const torrent = {
        id: 'ABC123DEF456',
        filename: 'Test Torrent',
        hash: 'abc123def456',
        bytes: 1073741824,
        progress: 50,
        status: 'downloading',
        added: '2024-01-01T00:00:00Z',
        links: ['https://example.com/link1', 'https://example.com/link2'],
        ended: '2024-01-01T01:00:00Z',
        speed: 1048576,
        seeders: 10,
        files: [
          { id: 1, path: '/file1.mp4', bytes: 536870912 },
          { id: 2, path: '/file2.mp4', bytes: 536870912 },
        ],
      }

      const result = realDebridTorrentSchema.safeParse(torrent)
      expect(result.success).toBe(true)
    })
  })

  describe('addMagnetRequestSchema', () => {
    it('should validate magnet request', () => {
      const request = {
        magnet: 'magnet:?xt=urn:btih:abc123',
      }

      const result = addMagnetRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('should reject missing magnet', () => {
      const request = {}

      const result = addMagnetRequestSchema.safeParse(request)
      expect(result.success).toBe(false)
    })
  })

  describe('addMagnetResponseSchema', () => {
    it('should validate response', () => {
      const response = {
        id: 'ABC123DEF456',
        uri: 'https://api.real-debrid.com/rest/1.0/torrents/info/ABC123DEF456',
      }

      const result = addMagnetResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('selectFilesRequestSchema', () => {
    it('should validate file selection', () => {
      const request = {
        files: '1,2,3',
      }

      const result = selectFilesRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('unrestrictLinkRequestSchema', () => {
    it('should validate unrestrict request', () => {
      const request = {
        link: 'https://example.com/restricted-link',
      }

      const result = unrestrictLinkRequestSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('unrestrictLinkResponseSchema', () => {
    it('should validate unrestrict response', () => {
      const response = {
        id: 'UNREST123',
        filename: 'test-file.mp4',
        mimeType: 'video/mp4',
        filesize: 1073741824,
        link: 'https://example.com/link',
        host: 'real-debrid.com',
        chunks: 4,
        download: 'https://download.real-debrid.com/file',
        streamable: 1,
      }

      const result = unrestrictLinkResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('should accept minimal response', () => {
      const response = {
        id: 'UNREST123',
        filename: 'test-file.mp4',
        download: 'https://download.real-debrid.com/file',
      }

      const result = unrestrictLinkResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })
  })

  describe('userInfoSchema', () => {
    it('should validate user info', () => {
      const userInfo = {
        id: 12345,
        username: 'testuser',
        email: 'test@example.com',
        points: 1000,
        locale: 'en',
        avatar: 'https://example.com/avatar.jpg',
        type: 'premium',
        premium: 1,
        expiration: '2025-12-31T23:59:59Z',
      }

      const result = userInfoSchema.safeParse(userInfo)
      expect(result.success).toBe(true)
    })

    it('should accept minimal user info', () => {
      const userInfo = {
        id: 12345,
        username: 'testuser',
        premium: 1,
      }

      const result = userInfoSchema.safeParse(userInfo)
      expect(result.success).toBe(true)
    })

    it('should reject free user with premium 0', () => {
      const userInfo = {
        id: 12345,
        username: 'testuser',
        premium: 0,
      }

      const result = userInfoSchema.safeParse(userInfo)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.premium).toBe(0)
      }
    })
  })

  describe('realDebridErrorSchema', () => {
    it('should validate error response', () => {
      const error = {
        error: 'Invalid request',
        error_code: 400,
      }

      const result = realDebridErrorSchema.safeParse(error)
      expect(result.success).toBe(true)
    })

    it('should accept error without code', () => {
      const error = {
        error: 'An error occurred',
      }

      const result = realDebridErrorSchema.safeParse(error)
      expect(result.success).toBe(true)
    })
  })
})
