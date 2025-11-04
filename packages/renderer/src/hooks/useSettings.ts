import { useState, useEffect, useCallback } from 'react'
import { getSetting, setSetting } from '@/services/storage'
import {
  Settings,
  GeneralSettings,
  BehaviorSettings,
  ThemeSettings,
  IntegrationsSettings,
  PrivacySettings,
  defaultSettings,
} from '@/types/settings'

const SETTINGS_KEY = 'app_settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from IndexedDB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const stored = await getSetting(SETTINGS_KEY)
        if (stored && stored.value) {
          setSettings(stored.value as Settings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        setError('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings to IndexedDB
  const saveSettings = useCallback(async (newSettings: Settings) => {
    try {
      await setSetting(SETTINGS_KEY, newSettings)
      setSettings(newSettings)
      setError(null)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError('Failed to save settings')
      throw err
    }
  }, [])

  // Update general settings
  const updateGeneralSettings = useCallback(
    async (generalSettings: Partial<GeneralSettings>) => {
      const newSettings = {
        ...settings,
        general: { ...settings.general, ...generalSettings },
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Update behavior settings
  const updateBehaviorSettings = useCallback(
    async (behaviorSettings: Partial<BehaviorSettings>) => {
      const newSettings = {
        ...settings,
        behavior: { ...settings.behavior, ...behaviorSettings },
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Update theme settings
  const updateThemeSettings = useCallback(
    async (themeSettings: Partial<ThemeSettings>) => {
      const newSettings = {
        ...settings,
        theme: { ...settings.theme, ...themeSettings },
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Update integrations settings
  const updateIntegrationsSettings = useCallback(
    async (integrationsSettings: Partial<IntegrationsSettings>) => {
      const newSettings = {
        ...settings,
        integrations: { ...settings.integrations, ...integrationsSettings },
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Update privacy settings
  const updatePrivacySettings = useCallback(
    async (privacySettings: Partial<PrivacySettings>) => {
      const newSettings = {
        ...settings,
        privacy: { ...settings.privacy, ...privacySettings },
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Update any settings
  const updateSettings = useCallback(
    async (partialSettings: Partial<Settings>) => {
      const newSettings = {
        ...settings,
        ...partialSettings,
      }
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    await saveSettings(defaultSettings)
  }, [saveSettings])

  return {
    settings,
    isLoading,
    error,
    updateGeneralSettings,
    updateBehaviorSettings,
    updateThemeSettings,
    updateIntegrationsSettings,
    updatePrivacySettings,
    updateSettings,
    resetSettings,
  }
}
