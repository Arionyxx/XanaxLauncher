import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RateLimiter } from './rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      expect(limiter.getAvailableTokens()).toBe(2)
    })

    it('should use burstSize if provided', () => {
      const limiter = new RateLimiter({
        requestsPerSecond: 2,
        burstSize: 5,
      })
      expect(limiter.getAvailableTokens()).toBe(5)
    })
  })

  describe('tryAcquire', () => {
    it('should acquire token when available', () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      expect(limiter.tryAcquire()).toBe(true)
      expect(limiter.getAvailableTokens()).toBe(1)
    })

    it('should fail to acquire when no tokens available', () => {
      const limiter = new RateLimiter({ requestsPerSecond: 1 })
      limiter.tryAcquire()
      expect(limiter.tryAcquire()).toBe(false)
    })

    it('should refill tokens over time', () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      limiter.tryAcquire()
      limiter.tryAcquire()
      expect(limiter.getAvailableTokens()).toBe(0)

      vi.advanceTimersByTime(500)
      expect(limiter.getAvailableTokens()).toBe(1)

      vi.advanceTimersByTime(500)
      expect(limiter.getAvailableTokens()).toBe(2)
    })

    it('should not exceed burstSize when refilling', () => {
      const limiter = new RateLimiter({
        requestsPerSecond: 2,
        burstSize: 3,
      })

      vi.advanceTimersByTime(5000)
      expect(limiter.getAvailableTokens()).toBe(3)
    })
  })

  describe('acquire', () => {
    it('should acquire token immediately when available', async () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      await limiter.acquire()
      expect(limiter.getAvailableTokens()).toBe(1)
    })

    it('should wait for token to become available', async () => {
      const limiter = new RateLimiter({ requestsPerSecond: 1 })
      limiter.tryAcquire()

      const promise = limiter.acquire()
      vi.advanceTimersByTime(1000)
      await promise

      expect(limiter.getAvailableTokens()).toBe(0)
    })
  })

  describe('execute', () => {
    it('should execute function after acquiring token', async () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      const fn = vi.fn(async () => 'result')

      const result = await limiter.execute(fn)

      expect(result).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(limiter.getAvailableTokens()).toBe(1)
    })

    it('should propagate function errors', async () => {
      const limiter = new RateLimiter({ requestsPerSecond: 2 })
      const fn = vi.fn(async () => {
        throw new Error('Test error')
      })

      await expect(limiter.execute(fn)).rejects.toThrow('Test error')
    })
  })

  describe('reset', () => {
    it('should restore tokens to burstSize', () => {
      const limiter = new RateLimiter({
        requestsPerSecond: 2,
        burstSize: 5,
      })

      limiter.tryAcquire()
      limiter.tryAcquire()
      limiter.tryAcquire()
      expect(limiter.getAvailableTokens()).toBe(2)

      limiter.reset()
      expect(limiter.getAvailableTokens()).toBe(5)
    })
  })
})
