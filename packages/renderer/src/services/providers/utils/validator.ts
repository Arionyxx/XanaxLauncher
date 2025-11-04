/**
 * Validator
 *
 * Common Zod schemas for provider responses and validation
 */

import { z } from 'zod'
import { JobStatus } from '@/types/provider'

/**
 * Schema for job status enum
 */
export const jobStatusSchema = z.nativeEnum(JobStatus)

/**
 * Schema for job file
 */
export const jobFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().int().nonnegative(),
  url: z.string().url().optional(),
  selected: z.boolean().optional(),
})

/**
 * Schema for job metadata
 */
export const jobMetadataSchema = z.record(z.string(), z.unknown()).and(
  z.object({
    originalUrl: z.string().optional(),
    errorMessage: z.string().optional(),
  })
)

/**
 * Schema for start job payload
 */
export const startJobPayloadSchema = z
  .object({
    url: z.string().url().optional(),
    magnet: z.string().optional(),
    files: z.array(z.string()).optional(),
  })
  .passthrough()
  .refine((data) => data.url || data.magnet, {
    message: 'Either url or magnet must be provided',
  })

/**
 * Schema for start job response
 */
export const startJobResponseSchema = z.object({
  jobId: z.string(),
  status: jobStatusSchema,
})

/**
 * Schema for job status response
 */
export const jobStatusResponseSchema = z.object({
  id: z.string(),
  status: jobStatusSchema,
  progress: z.number().min(0).max(100),
  files: z.array(jobFileSchema),
  metadata: jobMetadataSchema,
})

/**
 * Schema for cancel job response
 */
export const cancelJobResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

/**
 * Schema for file links response
 */
export const fileLinksResponseSchema = z.object({
  jobId: z.string(),
  files: z.array(jobFileSchema),
})

/**
 * Schema for test connection response
 */
export const testConnectionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: z
    .object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      premium: z.boolean().optional(),
      expiresAt: z.number().optional(),
    })
    .optional(),
})

/**
 * Schema for API error response
 */
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
})

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safely validate data and return result or null
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}
