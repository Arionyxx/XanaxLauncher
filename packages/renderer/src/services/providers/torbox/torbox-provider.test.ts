import { describe, it, expect, beforeEach } from 'vitest'
import { TorBoxProvider } from './torbox-provider'
import { JobStatus } from '@/types/provider'

describe('TorBoxProvider', () => {
  let provider: TorBoxProvider

  beforeEach(() => {
    provider = new TorBoxProvider({ apiToken: 'test-token' })
  })

  describe('constructor', () => {
    it('should create instance with correct name', () => {
      expect(provider.name).toBe('torbox')
    })

    it('should throw error without API token', () => {
      expect(() => {
        new TorBoxProvider({ apiToken: '' })
      }).toThrow('TorBox API token is required')
    })
  })

  describe('startJob', () => {
    it('should start job with magnet link', async () => {
      const result = await provider.startJob({
        magnet: 'magnet:?xt=urn:btih:abc123',
      })

      expect(result).toMatchObject({
        jobId: expect.any(String),
        status: JobStatus.QUEUED,
      })
    })

    it('should throw error without magnet or url', async () => {
      await expect(provider.startJob({})).rejects.toThrow()
    })
  })

  describe('getStatus', () => {
    it('should get job status', async () => {
      const { jobId } = await provider.startJob({
        magnet: 'magnet:?xt=urn:btih:abc123',
      })

      const status = await provider.getStatus(jobId)

      expect(status).toMatchObject({
        id: jobId,
        status: expect.any(String),
        progress: expect.any(Number),
        files: expect.any(Array),
        metadata: expect.any(Object),
      })
    })

    it('should throw error for invalid job ID', async () => {
      await expect(provider.getStatus('invalid-id')).rejects.toThrow()
    })
  })

  describe('cancel', () => {
    it('should cancel job', async () => {
      const { jobId } = await provider.startJob({
        magnet: 'magnet:?xt=urn:btih:abc123',
      })

      const result = await provider.cancel(jobId)

      expect(result).toMatchObject({
        success: true,
      })
    })
  })

  describe('getFileLinks', () => {
    it('should get download links for completed job', async () => {
      const { jobId } = await provider.startJob({
        magnet: 'magnet:?xt=urn:btih:abc123',
      })

      const result = await provider.getFileLinks(jobId)

      expect(result).toMatchObject({
        jobId,
        files: expect.any(Array),
      })

      if (result.files.length > 0) {
        expect(result.files[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          size: expect.any(Number),
          url: expect.stringMatching(/^https?:\/\//),
        })
      }
    })
  })

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const result = await provider.testConnection()

      expect(result).toMatchObject({
        success: true,
      })

      if (result.user) {
        expect(result.user).toMatchObject({
          email: expect.any(String),
        })
      }
    })

    it('should fail with invalid token', async () => {
      const invalidProvider = new TorBoxProvider({ apiToken: 'invalid-token' })

      const result = await invalidProvider.testConnection()

      expect(result).toMatchObject({
        success: false,
      })
    })
  })
})
