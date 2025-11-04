/**
 * Retry Utility
 *
 * Implements exponential backoff retry logic for failed operations
 */

export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableErrors?: string[]
}

export interface RetryState {
  attempt: number
  lastError?: Error
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message)
    this.name = 'RetryError'
  }
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableErrors?: string[]): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    return true
  }

  if (error instanceof Error) {
    return retryableErrors.some(
      (pattern) =>
        error.message.includes(pattern) || error.name.includes(pattern)
    )
  }

  return false
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Promise with function result
 * @throws RetryError if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  const {
    maxRetries,
    initialDelayMs,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    retryableErrors,
  } = config

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt > maxRetries) {
        throw new RetryError(
          `Failed after ${attempt} attempts: ${lastError.message}`,
          attempt,
          lastError
        )
      }

      if (!isRetryableError(error, retryableErrors)) {
        throw lastError
      }

      const delay = calculateDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new RetryError(
    `Failed after ${maxRetries + 1} attempts`,
    maxRetries + 1,
    lastError!
  )
}

/**
 * Create a retry wrapper function
 * @param config - Retry configuration
 * @returns Function that wraps another function with retry logic
 */
export function createRetry(config: RetryConfig) {
  return <T>(fn: () => Promise<T>): Promise<T> => retry(fn, config)
}
