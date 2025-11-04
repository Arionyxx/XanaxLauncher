import { z } from 'zod'

// Catppuccin flavor types
export const catppuccinFlavors = [
  'latte',
  'frappe',
  'macchiato',
  'mocha',
] as const
export type CatppuccinFlavor = (typeof catppuccinFlavors)[number]

// Catppuccin accent colors
export const catppuccinAccents = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
] as const
export type CatppuccinAccent = (typeof catppuccinAccents)[number]

// Bandwidth unit types
export const bandwidthUnits = ['KB/s', 'MB/s'] as const
export type BandwidthUnit = (typeof bandwidthUnits)[number]

// Language types
export const languages = ['en', 'es'] as const
export type Language = (typeof languages)[number]

// Zod schemas for validation
export const generalSettingsSchema = z.object({
  language: z.enum(languages),
  downloadDirectory: z.string().min(1, 'Download directory is required'),
  tempDirectory: z.string().min(1, 'Temp directory is required'),
})

export const behaviorSettingsSchema = z.object({
  autoStartEnabled: z.boolean(),
  minimizeToTray: z.boolean(),
  bandwidthLimit: z.number().min(0),
  bandwidthUnit: z.enum(bandwidthUnits),
})

export const themeSettingsSchema = z.object({
  flavor: z.enum(catppuccinFlavors),
  accentColor: z.enum(catppuccinAccents),
  compactMode: z.boolean(),
})

export const integrationsSettingsSchema = z.object({
  torboxApiToken: z.string().optional(),
  realDebridApiToken: z.string().optional(),
})

export const privacySettingsSchema = z.object({
  telemetryEnabled: z.boolean(),
  crashReportsEnabled: z.boolean(),
  usageStatsEnabled: z.boolean(),
})

// Combined settings schema
export const settingsSchema = z.object({
  general: generalSettingsSchema,
  behavior: behaviorSettingsSchema,
  theme: themeSettingsSchema,
  integrations: integrationsSettingsSchema,
  privacy: privacySettingsSchema,
})

// TypeScript types
export type GeneralSettings = z.infer<typeof generalSettingsSchema>
export type BehaviorSettings = z.infer<typeof behaviorSettingsSchema>
export type ThemeSettings = z.infer<typeof themeSettingsSchema>
export type IntegrationsSettings = z.infer<typeof integrationsSettingsSchema>
export type PrivacySettings = z.infer<typeof privacySettingsSchema>
export type Settings = z.infer<typeof settingsSchema>

// Default settings
export const defaultSettings: Settings = {
  general: {
    language: 'en',
    downloadDirectory: '',
    tempDirectory: '',
  },
  behavior: {
    autoStartEnabled: false,
    minimizeToTray: true,
    bandwidthLimit: 0,
    bandwidthUnit: 'MB/s',
  },
  theme: {
    flavor: 'macchiato',
    accentColor: 'blue',
    compactMode: false,
  },
  integrations: {
    torboxApiToken: undefined,
    realDebridApiToken: undefined,
  },
  privacy: {
    telemetryEnabled: false,
    crashReportsEnabled: false,
    usageStatsEnabled: false,
  },
}
