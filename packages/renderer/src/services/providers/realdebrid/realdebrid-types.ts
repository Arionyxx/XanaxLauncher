/**
 * Real-Debrid API Types and Schemas
 *
 * Zod schemas for validating Real-Debrid API responses
 */

import { z } from 'zod'

/**
 * Real-Debrid torrent status values
 */
export enum RealDebridStatus {
  MAGNET_ERROR = 'magnet_error',
  MAGNET_CONVERSION = 'magnet_conversion',
  WAITING_FILES_SELECTION = 'waiting_files_selection',
  QUEUED = 'queued',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error',
  VIRUS = 'virus',
  COMPRESSING = 'compressing',
  UPLOADING = 'uploading',
  DEAD = 'dead',
}

/**
 * Real-Debrid file schema
 */
export const realDebridFileSchema = z.object({
  id: z.number(),
  path: z.string(),
  bytes: z.number(),
  selected: z.number().optional(),
})

export type RealDebridFile = z.infer<typeof realDebridFileSchema>

/**
 * Real-Debrid torrent schema
 */
export const realDebridTorrentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  hash: z.string(),
  bytes: z.number(),
  progress: z.number(),
  status: z.string(),
  added: z.string(),
  links: z.array(z.string()).optional(),
  ended: z.string().optional(),
  speed: z.number().optional(),
  seeders: z.number().optional(),
  files: z.array(realDebridFileSchema).optional(),
})

export type RealDebridTorrent = z.infer<typeof realDebridTorrentSchema>

/**
 * Add magnet request schema
 */
export const addMagnetRequestSchema = z.object({
  magnet: z.string(),
})

export type AddMagnetRequest = z.infer<typeof addMagnetRequestSchema>

/**
 * Add magnet response schema
 */
export const addMagnetResponseSchema = z.object({
  id: z.string(),
  uri: z.string(),
})

export type AddMagnetResponse = z.infer<typeof addMagnetResponseSchema>

/**
 * Select files request schema
 */
export const selectFilesRequestSchema = z.object({
  files: z.string(),
})

export type SelectFilesRequest = z.infer<typeof selectFilesRequestSchema>

/**
 * Torrent info response schema
 */
export const torrentInfoResponseSchema = realDebridTorrentSchema

export type TorrentInfoResponse = z.infer<typeof torrentInfoResponseSchema>

/**
 * Unrestrict link request schema
 */
export const unrestrictLinkRequestSchema = z.object({
  link: z.string(),
})

export type UnrestrictLinkRequest = z.infer<typeof unrestrictLinkRequestSchema>

/**
 * Unrestrict link response schema
 */
export const unrestrictLinkResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string().optional(),
  filesize: z.number().optional(),
  link: z.string().optional(),
  host: z.string().optional(),
  chunks: z.number().optional(),
  download: z.string(),
  streamable: z.number().optional(),
})

export type UnrestrictLinkResponse = z.infer<
  typeof unrestrictLinkResponseSchema
>

/**
 * User info schema
 */
export const userInfoSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(),
  points: z.number().optional(),
  locale: z.string().optional(),
  avatar: z.string().optional(),
  type: z.string().optional(),
  premium: z.number(),
  expiration: z.string().optional(),
})

export type UserInfo = z.infer<typeof userInfoSchema>

/**
 * Real-Debrid API error schema
 */
export const realDebridErrorSchema = z.object({
  error: z.string(),
  error_code: z.number().optional(),
})

export type RealDebridError = z.infer<typeof realDebridErrorSchema>
