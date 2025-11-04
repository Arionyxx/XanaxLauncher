import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSetting,
  setSetting,
  getAllSettings,
  deleteSetting,
  getSources,
  getSource,
  addSource,
  updateSource,
  removeSource,
  getJobs,
  getJob,
  addJob,
  updateJob,
  removeJob,
  getJobsByStatus,
  getJobsByProvider,
} from './storage'
import { db } from '@/db/db'
import { JobStatus } from '@/types/provider'

describe('Storage Service', () => {
  beforeEach(async () => {
    await db.settings.clear()
    await db.sources.clear()
    await db.jobs.clear()
  })

  describe('Settings', () => {
    it('should save and retrieve setting', async () => {
      await setSetting('test_key', { value: 'test' })
      const result = await getSetting('test_key')

      expect(result).toBeDefined()
      expect(result?.key).toBe('test_key')
      expect(result?.value).toEqual({ value: 'test' })
    })

    it('should return undefined for non-existent setting', async () => {
      const result = await getSetting('non_existent')
      expect(result).toBeUndefined()
    })

    it('should update existing setting', async () => {
      await setSetting('test_key', 'value1')
      await setSetting('test_key', 'value2')
      const result = await getSetting('test_key')

      expect(result?.value).toBe('value2')
    })

    it('should get all settings', async () => {
      await setSetting('key1', 'value1')
      await setSetting('key2', 'value2')
      const results = await getAllSettings()

      expect(results).toHaveLength(2)
    })

    it('should delete setting', async () => {
      await setSetting('test_key', 'value')
      await deleteSetting('test_key')
      const result = await getSetting('test_key')

      expect(result).toBeUndefined()
    })
  })

  describe('Sources', () => {
    it('should add source', async () => {
      const id = await addSource({
        name: 'Test Source',
        url: 'https://example.com/feed.json',
        autoSync: false,
        errorMessage: null,
      })

      expect(id).toMatch(/^source_/)

      const source = await getSource(id)
      expect(source).toBeDefined()
      expect(source?.name).toBe('Test Source')
      expect(source?.status).toBe('never_synced')
    })

    it('should get all sources', async () => {
      await addSource({
        name: 'Source 1',
        url: 'https://example.com/feed1.json',
        autoSync: false,
        errorMessage: null,
      })
      await addSource({
        name: 'Source 2',
        url: 'https://example.com/feed2.json',
        autoSync: true,
        errorMessage: null,
      })

      const sources = await getSources()
      expect(sources).toHaveLength(2)
    })

    it('should update source', async () => {
      const id = await addSource({
        name: 'Test Source',
        url: 'https://example.com/feed.json',
        autoSync: false,
        errorMessage: null,
      })

      await updateSource(id, {
        status: 'synced',
        entryCount: 10,
        lastSyncAt: Date.now(),
      })

      const source = await getSource(id)
      expect(source?.status).toBe('synced')
      expect(source?.entryCount).toBe(10)
    })

    it('should remove source', async () => {
      const id = await addSource({
        name: 'Test Source',
        url: 'https://example.com/feed.json',
        autoSync: false,
        errorMessage: null,
      })

      await removeSource(id)
      const source = await getSource(id)
      expect(source).toBeUndefined()
    })
  })

  describe('Jobs', () => {
    it('should add job', async () => {
      const id = await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      expect(id).toMatch(/^job_/)

      const job = await getJob(id)
      expect(job).toBeDefined()
      expect(job?.provider).toBe('torbox')
      expect(job?.status).toBe(JobStatus.QUEUED)
    })

    it('should get all jobs sorted by creation date', async () => {
      const id1 = await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const id2 = await addJob({
        provider: 'real-debrid',
        status: JobStatus.DOWNLOADING,
        progress: 50,
        files: [],
        metadata: {},
      })

      const jobs = await getJobs()
      expect(jobs).toHaveLength(2)
      expect(jobs[0].id).toBe(id2)
      expect(jobs[1].id).toBe(id1)
    })

    it('should update job', async () => {
      const id = await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      await updateJob(id, {
        status: JobStatus.DOWNLOADING,
        progress: 50,
      })

      const job = await getJob(id)
      expect(job?.status).toBe(JobStatus.DOWNLOADING)
      expect(job?.progress).toBe(50)
    })

    it('should remove job', async () => {
      const id = await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      await removeJob(id)
      const job = await getJob(id)
      expect(job).toBeUndefined()
    })

    it('should get jobs by status', async () => {
      await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      await addJob({
        provider: 'torbox',
        status: JobStatus.DOWNLOADING,
        progress: 50,
        files: [],
        metadata: {},
      })

      await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      const queuedJobs = await getJobsByStatus(JobStatus.QUEUED)
      expect(queuedJobs).toHaveLength(2)

      const downloadingJobs = await getJobsByStatus(JobStatus.DOWNLOADING)
      expect(downloadingJobs).toHaveLength(1)
    })

    it('should get jobs by provider', async () => {
      await addJob({
        provider: 'torbox',
        status: JobStatus.QUEUED,
        progress: 0,
        files: [],
        metadata: {},
      })

      await addJob({
        provider: 'real-debrid',
        status: JobStatus.DOWNLOADING,
        progress: 50,
        files: [],
        metadata: {},
      })

      await addJob({
        provider: 'torbox',
        status: JobStatus.COMPLETED,
        progress: 100,
        files: [],
        metadata: {},
      })

      const torboxJobs = await getJobsByProvider('torbox')
      expect(torboxJobs).toHaveLength(2)

      const rdJobs = await getJobsByProvider('real-debrid')
      expect(rdJobs).toHaveLength(1)
    })
  })
})
