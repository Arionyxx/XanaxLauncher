import { describe, it, expect, beforeEach, vi } from 'vitest'
import { retry, RetryError, createRetry } from './retry'

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return result on first success', async () => {
    const fn = vi.fn(async () => 'success')

    const result = await retry(fn, {
      maxRetries: 3,
      initialDelayMs: 100,
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success')

    const promise = retry(fn, {
      maxRetries: 3,
      initialDelayMs: 100,
    })

    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should throw RetryError after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'))

    const promise = retry(fn, {
      maxRetries: 2,
      initialDelayMs: 100,
    })

    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    await expect(promise).rejects.toThrow(RetryError)
    await expect(promise).rejects.toMatchObject({
      attempts: 3,
      lastError: expect.objectContaining({ message: 'Always fails' }),
    })
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should apply exponential backoff', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Fail'))
    const delays: number[] = []

    const promise = retry(fn, {
      maxRetries: 3,
      initialDelayMs: 100,
      backoffMultiplier: 2,
    })

    for (let i = 0; i < 3; i++) {
      const before = Date.now()
      await vi.advanceTimersByTimeAsync(100 * Math.pow(2, i))
      delays.push(Date.now() - before)
    }

    await expect(promise).rejects.toThrow(RetryError)

    expect(delays[0]).toBe(100)
    expect(delays[1]).toBe(200)
    expect(delays[2]).toBe(400)
  })

  it('should respect maxDelayMs', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Fail'))

    const promise = retry(fn, {
      maxRetries: 5,
      initialDelayMs: 100,
      maxDelayMs: 300,
      backoffMultiplier: 2,
    })

    for (let i = 0; i < 5; i++) {
      const expectedDelay = Math.min(100 * Math.pow(2, i), 300)
      await vi.advanceTimersByTimeAsync(expectedDelay)
    }

    await expect(promise).rejects.toThrow(RetryError)
  })

  it('should only retry retryable errors', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockRejectedValueOnce(new Error('Invalid request'))

    const promise = retry(fn, {
      maxRetries: 3,
      initialDelayMs: 100,
      retryableErrors: ['timeout', 'ECONNRESET'],
    })

    await vi.advanceTimersByTimeAsync(100)

    await expect(promise).rejects.toThrow('Invalid request')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should handle non-Error objects', async () => {
    const fn = vi.fn().mockRejectedValue('String error')

    const promise = retry(fn, {
      maxRetries: 1,
      initialDelayMs: 100,
    })

    await vi.advanceTimersByTimeAsync(100)

    await expect(promise).rejects.toThrow(RetryError)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('createRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create retry wrapper function', async () => {
    const retryFn = createRetry({
      maxRetries: 2,
      initialDelayMs: 100,
    })

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success')

    const promise = retryFn(fn)

    await vi.advanceTimersByTimeAsync(100)

    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
