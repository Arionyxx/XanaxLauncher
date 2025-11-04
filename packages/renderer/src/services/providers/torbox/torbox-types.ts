/**
 * TorBox API Types and Schemas
 *
 * Zod schemas for validating TorBox API responses
 */

import { z } from 'zod'

/**
 * TorBox torrent status values
 */
export enum TorBoxStatus {
  DOWNLOADING = 'downloading',
  UPLOADING = 'uploading',
  STALLED = 'stalled',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CACHED = 'cached',
  METADL = 'metaDL',
  CHECKINGFILES = 'checkingFiles',
}

/**
 * TorBox file schema
 */
export const torBoxFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  size: z.number(),
})

export type TorBoxFile = z.infer<typeof torBoxFileSchema>

/**
 * TorBox torrent schema
 */
export const torBoxTorrentSchema = z.object({
  id: z.number(),
  hash: z.string(),
  name: z.string(),
  magnet: z.string().optional(),
  size: z.number(),
  progress: z.number(),
  download_speed: z.number(),
  upload_speed: z.number(),
  ratio: z.number(),
  download_state: z.string(),
  eta: z.number(),
  files: z.array(torBoxFileSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  download_finished: z.boolean().optional(),
  active: z.boolean(),
})

export type TorBoxTorrent = z.infer<typeof torBoxTorrentSchema>

/**
 * Create torrent request schema
 */
export const createTorrentRequestSchema = z.object({
  magnet: z.string().optional(),
  url: z.string().optional(),
  seed: z.number().optional(),
  allow_zip: z.boolean().optional(),
})

export type CreateTorrentRequest = z.infer<typeof createTorrentRequestSchema>

/**
 * Create torrent response schema
 */
export const createTorrentResponseSchema = z.object({
  success: z.boolean(),
  detail: z.string().optional(),
  data: z
    .object({
      torrent_id: z.number(),
      name: z.string().optional(),
      hash: z.string().optional(),
    })
    .optional(),
})

export type CreateTorrentResponse = z.infer<typeof createTorrentResponseSchema>

/**
 * Get torrents list response schema
 */
export const getTorrentsResponseSchema = z.object({
  success: z.boolean(),
  detail: z.string().optional(),
  data: z.array(torBoxTorrentSchema).optional(),
})

export type GetTorrentsResponse = z.infer<typeof getTorrentsResponseSchema>

/**
 * Control torrent response schema
 */
export const controlTorrentResponseSchema = z.object({
  success: z.boolean(),
  detail: z.string().optional(),
})

export type ControlTorrentResponse = z.infer<
  typeof controlTorrentResponseSchema
>

/**
 * Request download link response schema
 */
export const requestDownloadResponseSchema = z.string().url()

/**
 * User info schema
 */
export const userInfoSchema = z.object({
  success: z.boolean(),
  detail: z.string().optional(),
  data: z
    .object({
      id: z.number(),
      email: z.string().email().optional(),
      plan: z.number().optional(),
      total_downloaded: z.number().optional(),
      premium_expires_at: z.string().optional(),
      is_subscribed: z.boolean().optional(),
    })
    .optional(),
})

export type UserInfo = z.infer<typeof userInfoSchema>

/**
 * TorBox API error schema
 */
export const torBoxErrorSchema = z.object({
  success: z.boolean(),
  detail: z.string(),
  error: z.string().optional(),
})

export type TorBoxError = z.infer<typeof torBoxErrorSchema>
