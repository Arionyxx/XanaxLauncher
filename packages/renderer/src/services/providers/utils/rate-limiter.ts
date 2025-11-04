/**
 * Rate Limiter
 *
 * Simple token bucket rate limiter to control API request frequency
 */

export interface RateLimiterConfig {
  requestsPerSecond: number
  burstSize?: number
}

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly requestsPerSecond: number
  private readonly burstSize: number
  private readonly refillInterval: number

  constructor(config: RateLimiterConfig) {
    this.requestsPerSecond = config.requestsPerSecond
    this.burstSize = config.burstSize ?? config.requestsPerSecond
    this.tokens = this.burstSize
    this.lastRefill = Date.now()
    this.refillInterval = 1000 / this.requestsPerSecond
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = timePassed / this.refillInterval

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.burstSize, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }

  /**
   * Attempt to acquire a token
   * @returns true if token acquired, false otherwise
   */
  tryAcquire(): boolean {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }

    return false
  }

  /**
   * Wait until a token is available and acquire it
   */
  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      const waitTime = Math.ceil(this.refillInterval)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Execute a function with rate limiting
   * @param fn - Function to execute
   * @returns Promise with function result
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    return fn()
  }

  /**
   * Get current token count (for debugging)
   */
  getAvailableTokens(): number {
    this.refill()
    return Math.floor(this.tokens)
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.tokens = this.burstSize
    this.lastRefill = Date.now()
  }
}
