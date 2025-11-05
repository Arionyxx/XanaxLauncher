'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  DownloadCloud,
  Eye,
  EyeOff,
  ExternalLink,
  FilePlus2,
  FolderOpen,
  Info,
  Loader2,
  PencilLine,
  Plug,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Wrench,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSettings } from '@/hooks/useSettings'
import { useSources } from '@/hooks/useSources'
import { useToast } from '@/hooks/use-toast'
import {
  bandwidthUnits,
  languages,
  type Language,
  type Settings,
} from '@/types/settings'
import { Source } from '@/db/schema'
import { SourceFormData, sourceFormSchema } from '@/types/source'
import { clearDownloadHistory, clearSourceCache } from '@/services/storage'
import { cn } from '@/lib/utils'

const navMotion = {
  whileHover: { x: 6 },
  whileTap: { scale: 0.97 },
}

type SectionId =
  | 'general'
  | 'integrations'
  | 'sources'
  | 'privacy'
  | 'advanced'
  | 'about'

interface SectionDefinition {
  id: SectionId
  label: string
  description: string
  icon: LucideIcon
}

const SECTIONS: SectionDefinition[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Directories, language, and behavior',
    icon: Settings2,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Connect premium providers and services',
    icon: Plug,
  },
  {
    id: 'sources',
    label: 'Media Sources',
    description: 'Manage and sync your content feeds',
    icon: Database,
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Control telemetry and diagnostics',
    icon: ShieldCheck,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Power options and maintenance tools',
    icon: Wrench,
  },
  {
    id: 'about',
    label: 'About',
    description: 'Version information and credits',
    icon: Info,
  },
]

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
}

type ProviderKey = 'torbox' | 'realdebrid'

type ProviderMetadata = {
  name: string
  description: string
  docUrl: string
  accentClass: string
}

const PROVIDER_METADATA: Record<ProviderKey, ProviderMetadata> = {
  torbox: {
    name: 'TorBox',
    description:
      'Authenticate with your TorBox API token to unlock curated sources and premium mirrors.',
    docUrl: 'https://torbox.app/dashboard',
    accentClass: 'text-catppuccin-blue',
  },
  realdebrid: {
    name: 'Real-Debrid',
    description:
      'Use your Real-Debrid token to enable high bandwidth downloads and instant availability.',
    docUrl: 'https://real-debrid.com/apitoken',
    accentClass: 'text-catppuccin-mauve',
  },
}

const SOURCE_STATUS_STYLES: Record<Source['status'], string> = {
  never_synced:
    'border-border/70 bg-surface-0/80 text-text-muted shadow-inner-glow',
  syncing:
    'border-catppuccin-yellow/50 bg-catppuccin-yellow/10 text-catppuccin-yellow',
  synced:
    'border-catppuccin-green/45 bg-catppuccin-green/15 text-catppuccin-green',
  error: 'border-catppuccin-red/50 bg-catppuccin-red/15 text-catppuccin-red',
}

const SOURCE_STATUS_LABELS: Record<Source['status'], string> = {
  never_synced: 'Never synced',
  syncing: 'Syncing…',
  synced: 'Synced',
  error: 'Attention required',
}

type ConfirmActionType =
  | 'delete-source'
  | 'reset-settings'
  | 'clear-source-cache'
  | 'clear-download-history'

interface ConfirmActionState {
  type: ConfirmActionType
  source?: Source
}

interface VersionInfo {
  version: string
  electron: string
  chrome: string
  node: string
}

export default function SettingsPage() {
  const {
    settings,
    isLoading,
    updateGeneralSettings,
    updateBehaviorSettings,
    updateIntegrationsSettings,
    updatePrivacySettings,
    resetSettings,
  } = useSettings()
  const {
    sources,
    loading: sourcesLoading,
    addSource,
    updateSource,
    removeSource,
    syncSource,
    syncAllSources,
    refresh: refreshSources,
    importSources,
    exportSources,
  } = useSources()
  const { toast } = useToast()

  const [activeSection, setActiveSection] = useState<SectionId>('general')
  const contentRef = useRef<HTMLDivElement | null>(null)

  const [torboxToken, setTorboxToken] = useState('')
  const [realDebridToken, setRealDebridToken] = useState('')
  const [showTorboxToken, setShowTorboxToken] = useState(false)
  const [showRealDebridToken, setShowRealDebridToken] = useState(false)
  const [savingTorbox, setSavingTorbox] = useState(false)
  const [savingRealDebrid, setSavingRealDebrid] = useState(false)
  const [testingProvider, setTestingProvider] = useState<ProviderKey | null>(
    null
  )

  const [selectingDownload, setSelectingDownload] = useState(false)
  const [selectingTemp, setSelectingTemp] = useState(false)
  const [bandwidthValue, setBandwidthValue] = useState('')
  const [bandwidthUnitValue, setBandwidthUnitValue] = useState(
    settings.behavior.bandwidthUnit
  )
  const [bandwidthSaving, setBandwidthSaving] = useState(false)

  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false)
  const [sourceDialogMode, setSourceDialogMode] = useState<'create' | 'edit'>(
    'create'
  )
  const [sourceInDialog, setSourceInDialog] = useState<Source | null>(null)
  const [sourceDialogSubmitting, setSourceDialogSubmitting] = useState(false)

  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null)
  const [autoSyncUpdatingId, setAutoSyncUpdatingId] = useState<string | null>(
    null
  )
  const [syncingAll, setSyncingAll] = useState(false)
  const [importingSources, setImportingSources] = useState(false)

  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(
    null
  )
  const [confirmLoading, setConfirmLoading] = useState(false)

  const [checkingUpdates, setCheckingUpdates] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    setTorboxToken(settings.integrations.torboxApiToken ?? '')
    setRealDebridToken(settings.integrations.realDebridApiToken ?? '')
  }, [
    settings.integrations.torboxApiToken,
    settings.integrations.realDebridApiToken,
  ])

  useEffect(() => {
    setBandwidthValue(
      settings.behavior.bandwidthLimit > 0
        ? settings.behavior.bandwidthLimit.toString()
        : ''
    )
  }, [settings.behavior.bandwidthLimit])

  useEffect(() => {
    setBandwidthUnitValue(settings.behavior.bandwidthUnit)
  }, [settings.behavior.bandwidthUnit])

  useEffect(() => {
    if (!contentRef.current) return
    contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])

  useEffect(() => {
    let cancelled = false

    const loadVersion = async () => {
      if (!window?.api?.getVersion) return
      try {
        const info = await window.api.getVersion()
        if (!cancelled) {
          setVersionInfo(info)
        }
      } catch (error) {
        console.error('[Settings] Failed to fetch version info', error)
      }
    }

    loadVersion()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSelectFolder = useCallback(
    async (kind: 'download' | 'temp') => {
      const setLoading =
        kind === 'download' ? setSelectingDownload : setSelectingTemp
      setLoading(true)
      try {
        if (!window?.api?.selectFolder) {
          toast({
            title: 'Desktop integration unavailable',
            description:
              'Folder selection is only available inside the desktop app.',
            variant: 'destructive',
          })
          return
        }

        const result = await window.api.selectFolder()
        if (!result.canceled && result.filePaths?.length) {
          const chosenPath = result.filePaths[0]
          if (kind === 'download') {
            await updateGeneralSettings({ downloadDirectory: chosenPath })
          } else {
            await updateGeneralSettings({ tempDirectory: chosenPath })
          }
          toast({
            title: 'Directory updated',
            description: `${kind === 'download' ? 'Download' : 'Temporary'} directory set to ${chosenPath}`,
          })
        }
      } catch (error) {
        console.error('[Settings] Folder selection failed', error)
        toast({
          title: 'Unable to select folder',
          description:
            error instanceof Error
              ? error.message
              : 'Something went wrong while selecting a folder.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [toast, updateGeneralSettings]
  )

  const handleBehaviorToggle = async (
    key: 'autoStartEnabled' | 'minimizeToTray',
    value: boolean
  ) => {
    try {
      await updateBehaviorSettings({ [key]: value } as Partial<
        Settings['behavior']
      >)
      toast({
        title: value ? 'Preference enabled' : 'Preference disabled',
        description:
          key === 'autoStartEnabled'
            ? value
              ? 'XanaxLauncher will start with your system.'
              : 'Automatic launch on startup is disabled.'
            : value
              ? 'The app will minimize to the tray when closed.'
              : 'Closing the app will now exit it completely.',
      })
    } catch (error) {
      console.error('[Settings] Failed to update behavior', error)
      toast({
        title: 'Unable to update behavior preference',
        description:
          error instanceof Error
            ? error.message
            : 'Please try again in a moment.',
        variant: 'destructive',
      })
    }
  }

  const handleBandwidthPersist = async () => {
    const numericValue = Number(parseFloat(bandwidthValue))
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setBandwidthValue('')
      toast({
        title: 'Invalid bandwidth value',
        description: 'Please enter a value greater than or equal to zero.',
        variant: 'destructive',
      })
      return
    }

    if (numericValue === settings.behavior.bandwidthLimit) {
      return
    }

    try {
      setBandwidthSaving(true)
      await updateBehaviorSettings({ bandwidthLimit: numericValue })
      toast({
        title: 'Bandwidth limit updated',
        description:
          numericValue === 0
            ? 'Downloads will use the maximum available bandwidth.'
            : `Downloads are limited to ${numericValue} ${settings.behavior.bandwidthUnit}.`,
      })
    } catch (error) {
      console.error('[Settings] Failed to update bandwidth limit', error)
      toast({
        title: 'Unable to update bandwidth limit',
        description:
          error instanceof Error
            ? error.message
            : 'Try again in a few moments.',
        variant: 'destructive',
      })
    } finally {
      setBandwidthSaving(false)
    }
  }

  const handleBandwidthUnitChange = async (
    value: Settings['behavior']['bandwidthUnit']
  ) => {
    if (value === settings.behavior.bandwidthUnit) return
    try {
      await updateBehaviorSettings({ bandwidthUnit: value })
      setBandwidthUnitValue(value)
      toast({
        title: 'Bandwidth unit saved',
        description: `Future limits will use ${value}.`,
      })
    } catch (error) {
      console.error('[Settings] Failed to update bandwidth unit', error)
      toast({
        title: 'Unable to update bandwidth unit',
        description:
          error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveProvider = async (provider: ProviderKey) => {
    const token = provider === 'torbox' ? torboxToken : realDebridToken
    const setSaving =
      provider === 'torbox' ? setSavingTorbox : setSavingRealDebrid

    try {
      setSaving(true)
      const trimmed = token.trim()
      await updateIntegrationsSettings(
        provider === 'torbox'
          ? { torboxApiToken: trimmed || undefined }
          : { realDebridApiToken: trimmed || undefined }
      )
      toast({
        title: `${PROVIDER_METADATA[provider].name} credentials saved`,
        description: 'Your integration token has been stored securely.',
      })
    } catch (error) {
      console.error('[Settings] Failed to save provider token', error)
      toast({
        title: `Unable to save ${PROVIDER_METADATA[provider].name}`,
        description:
          error instanceof Error
            ? error.message
            : 'Please verify your token and try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestProvider = async (provider: ProviderKey) => {
    if (!window?.api?.providerTestConnection) {
      toast({
        title: 'Desktop integration unavailable',
        description:
          'Testing connections is only available inside the desktop app.',
        variant: 'destructive',
      })
      return
    }

    try {
      setTestingProvider(provider)
      const response = await window.api.providerTestConnection({ provider })
      if (response.success) {
        toast({
          title: `${PROVIDER_METADATA[provider].name} connected`,
          description: response.message || 'Credentials verified successfully.',
        })
      } else {
        toast({
          title: `${PROVIDER_METADATA[provider].name} test failed`,
          description:
            response.message ||
            'Unable to verify credentials with the provider.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Settings] Provider test failed', error)
      toast({
        title: `Unable to reach ${PROVIDER_METADATA[provider].name}`,
        description:
          error instanceof Error
            ? error.message
            : 'Check your internet connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setTestingProvider(null)
    }
  }

  const openCreateSourceDialog = () => {
    setSourceDialogMode('create')
    setSourceInDialog(null)
    setIsSourceDialogOpen(true)
  }

  const openEditSourceDialog = (source: Source) => {
    setSourceDialogMode('edit')
    setSourceInDialog(source)
    setIsSourceDialogOpen(true)
  }

  const handleSourceSubmit = async (data: SourceFormData) => {
    try {
      setSourceDialogSubmitting(true)
      if (sourceDialogMode === 'create') {
        await addSource(data)
        toast({
          title: 'Source added',
          description: `${data.name} is ready to sync.`,
        })
      } else if (sourceInDialog) {
        await updateSource(sourceInDialog.id, {
          name: data.name,
          url: data.url,
          autoSync: data.autoSync,
        })
        toast({
          title: 'Source updated',
          description: `${data.name} has been refreshed.`,
        })
      }
      await refreshSources()
      setIsSourceDialogOpen(false)
      setSourceInDialog(null)
    } catch (error) {
      console.error('[Settings] Source save failed', error)
      toast({
        title: 'Unable to save source',
        description:
          error instanceof Error
            ? error.message
            : 'Double-check the URL and try again.',
        variant: 'destructive',
      })
    } finally {
      setSourceDialogSubmitting(false)
    }
  }

  const handleSyncSingleSource = async (source: Source) => {
    try {
      setSyncingSourceId(source.id)
      await syncSource(source.id)
      toast({
        title: 'Source sync queued',
        description: `${source.name} is being refreshed in the background.`,
      })
    } catch (error) {
      console.error('[Settings] Source sync failed', error)
      toast({
        title: 'Unable to sync source',
        description:
          error instanceof Error
            ? error.message
            : 'Please review the source URL and try again.',
        variant: 'destructive',
      })
    } finally {
      setSyncingSourceId(null)
    }
  }

  const handleAutoSyncToggle = async (source: Source, enabled: boolean) => {
    try {
      setAutoSyncUpdatingId(source.id)
      await updateSource(source.id, { autoSync: enabled })
      toast({
        title: enabled ? 'Auto-sync enabled' : 'Auto-sync disabled',
        description: `${source.name} will ${enabled ? '' : 'not '}refresh automatically.`,
      })
    } catch (error) {
      console.error('[Settings] Failed to toggle auto-sync', error)
      toast({
        title: 'Unable to update auto-sync',
        description:
          error instanceof Error
            ? error.message
            : 'Try again in a few seconds.',
        variant: 'destructive',
      })
    } finally {
      setAutoSyncUpdatingId(null)
    }
  }

  const handleSyncAllSources = async () => {
    try {
      setSyncingAll(true)
      await syncAllSources()
      toast({
        title: 'Media sources syncing',
        description: 'All sources are being refreshed in the background.',
      })
    } catch (error) {
      console.error('[Settings] Sync all sources failed', error)
      toast({
        title: 'Unable to sync all sources',
        description:
          error instanceof Error
            ? error.message
            : 'Review individual sources for troubleshooting details.',
        variant: 'destructive',
      })
    } finally {
      setSyncingAll(false)
    }
  }

  const handleImportSources = () => {
    if (importingSources) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        setImportingSources(true)
        const text = await file.text()
        const data = JSON.parse(text)
        await importSources(data)
        await refreshSources()
        toast({
          title: 'Sources imported',
          description: 'Your sources file was processed successfully.',
        })
      } catch (error) {
        console.error('[Settings] Import sources failed', error)
        toast({
          title: 'Import failed',
          description:
            error instanceof Error
              ? error.message
              : 'Ensure the file is a valid sources export.',
          variant: 'destructive',
        })
      } finally {
        setImportingSources(false)
        input.remove()
      }
    }

    input.click()
  }

  const handleExportSources = async () => {
    try {
      const data = await exportSources()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `sources-${new Date().toISOString().split('T')[0]}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      toast({
        title: 'Sources exported',
        description: 'A JSON export has been saved to your device.',
      })
    } catch (error) {
      console.error('[Settings] Export sources failed', error)
      toast({
        title: 'Export failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to create sources export right now.',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    try {
      setConfirmLoading(true)
      switch (confirmAction.type) {
        case 'delete-source':
          if (confirmAction.source) {
            await removeSource(confirmAction.source.id)
            await refreshSources()
            toast({
              title: 'Source removed',
              description: `${confirmAction.source.name} has been deleted.`,
            })
          }
          break
        case 'reset-settings':
          await resetSettings()
          toast({
            title: 'Settings reset',
            description: 'All preferences were restored to their defaults.',
          })
          break
        case 'clear-source-cache':
          await clearSourceCache()
          await refreshSources()
          toast({
            title: 'Source cache cleared',
            description:
              'All cached entries were removed. Sources will resync on demand.',
          })
          break
        case 'clear-download-history':
          await clearDownloadHistory()
          toast({
            title: 'Download history cleared',
            description:
              'All stored download jobs were removed from the database.',
          })
          break
      }
      setConfirmAction(null)
    } catch (error) {
      console.error('[Settings] Confirm action failed', error)
      toast({
        title: 'Unable to complete action',
        description:
          error instanceof Error ? error.message : 'Please try again shortly.',
        variant: 'destructive',
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCheckForUpdates = async () => {
    if (!window?.api?.updates?.check) {
      toast({
        title: 'Desktop integration unavailable',
        description:
          'Update checks are only available inside the packaged desktop app.',
        variant: 'destructive',
      })
      return
    }

    try {
      setCheckingUpdates(true)
      setUpdateStatus(null)
      const result = await window.api.updates.check()
      if (result.available && result.version) {
        const message = `Update ${result.version} is ready to install.`
        setUpdateStatus(message)
        toast({
          title: 'Update available',
          description: message,
        })
      } else {
        setUpdateStatus('You are already running the latest version.')
        toast({
          title: 'Up to date',
          description: 'No newer builds are available at the moment.',
        })
      }
    } catch (error) {
      console.error('[Settings] Update check failed', error)
      setUpdateStatus(
        'Unable to contact the update server. Please try again later.'
      )
      toast({
        title: 'Update check failed',
        description:
          error instanceof Error
            ? error.message
            : 'Check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setCheckingUpdates(false)
    }
  }

  const sectionMeta = useMemo(
    () => SECTIONS.find((section) => section.id === activeSection)!,
    [activeSection]
  )

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-catppuccin-blue" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-3"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-text-muted">
            XanaxLauncher Control Center
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Settings &amp; Preferences
              </h1>
              <p className="max-w-2xl text-sm text-text-subtle md:text-base">
                Tailor every part of XanaxLauncher—from storage locations and
                provider integrations to privacy controls and maintenance
                utilities.
              </p>
            </div>
            <Badge className="bg-catppuccin-blue/15 text-catppuccin-blue">
              Control Tower
            </Badge>
          </div>
        </motion.div>

        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
          <div className="space-y-4">
            <div className="lg:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex min-w-[180px] items-center gap-2 rounded-2xl border px-4 py-2 text-left text-sm transition-all duration-300 ease-soft-spring',
                      activeSection === section.id
                        ? 'border-catppuccin-blue/60 bg-catppuccin-blue/10 text-foreground shadow-glow-sm'
                        : 'border-transparent bg-surface-0/60 text-text-subtle hover:border-white/10 hover:text-foreground'
                    )}
                  >
                    <section.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="rounded-[2.25rem] border border-white/10 bg-surface-0/45 p-4 shadow-glow backdrop-blur-2xl">
                <ul className="space-y-2">
                  {SECTIONS.map((section) => (
                    <motion.li key={section.id} {...navMotion}>
                      <button
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'group relative flex w-full items-start gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-300 ease-soft-spring',
                          activeSection === section.id
                            ? 'border-catppuccin-blue/50 bg-catppuccin-blue/10 text-foreground shadow-glow'
                            : 'text-text-subtle hover:border-white/10 hover:bg-surface-0/70 hover:text-foreground'
                        )}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-1/50 text-catppuccin-blue transition-colors group-hover:bg-surface-1/70">
                          <section.icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {section.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {section.description}
                          </span>
                        </span>
                        {activeSection === section.id && (
                          <motion.span
                            layoutId="settings-nav-active"
                            className="absolute inset-0 -z-10 rounded-2xl border border-catppuccin-blue/35 bg-catppuccin-blue/10"
                            transition={{
                              type: 'spring',
                              bounce: 0.28,
                              duration: 0.48,
                            }}
                          />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <section className="relative mt-6 lg:mt-0">
            <div className="rounded-[2.5rem] border border-white/10 bg-surface-0/50 shadow-glow backdrop-blur-[30px]">
              <div
                ref={contentRef}
                className="flex max-h-[min(1200px,calc(100vh-230px))] flex-col gap-10 overflow-y-auto p-6 sm:p-8"
              >
                <header className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                    {sectionMeta.label}
                  </h2>
                  <p className="max-w-2xl text-sm text-text-subtle md:text-base">
                    {sectionMeta.description}
                  </p>
                </header>

                {activeSection === 'general' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground md:text-xl">
                          Storage Locations
                        </h3>
                        <p className="text-sm text-text-subtle">
                          Choose where downloads and temporary files should
                          live. These folders will be used for scans and library
                          organization.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-[0.3em] text-text-muted">
                            Download directory
                          </Label>
                          <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <Input
                              value={settings.general.downloadDirectory}
                              placeholder="Select a directory"
                              readOnly
                              className="font-mono text-xs md:text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleSelectFolder('download')}
                              disabled={selectingDownload}
                              className="md:min-w-[140px]"
                            >
                              {selectingDownload ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Selecting…
                                </>
                              ) : (
                                <>
                                  <FolderOpen className="h-4 w-4" />
                                  Browse
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-[0.3em] text-text-muted">
                            Temporary directory
                          </Label>
                          <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <Input
                              value={settings.general.tempDirectory}
                              placeholder="Select a directory"
                              readOnly
                              className="font-mono text-xs md:text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleSelectFolder('temp')}
                              disabled={selectingTemp}
                              className="md:min-w-[140px]"
                            >
                              {selectingTemp ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Selecting…
                                </>
                              ) : (
                                <>
                                  <FolderOpen className="h-4 w-4" />
                                  Browse
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="grid gap-6 xl:grid-cols-2">
                      <Card className="shadow-none">
                        <CardHeader className="gap-1">
                          <CardTitle className="text-lg">Language</CardTitle>
                          <CardDescription>
                            Instantly switch the interface language across the
                            entire app.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Select
                            value={settings.general.language}
                            onValueChange={(value) => {
                              void updateGeneralSettings({
                                language: value as Language,
                              })
                                .then(() =>
                                  toast({
                                    title: 'Language updated',
                                    description: `Interface set to ${LANGUAGE_LABELS[value as Language]}.`,
                                  })
                                )
                                .catch((error) => {
                                  console.error(
                                    '[Settings] Language update failed',
                                    error
                                  )
                                  toast({
                                    title: 'Unable to switch language',
                                    description:
                                      error instanceof Error
                                        ? error.message
                                        : 'Please try again later.',
                                    variant: 'destructive',
                                  })
                                })
                            }}
                          >
                            <SelectTrigger className="h-11 w-full md:w-[220px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {LANGUAGE_LABELS[lang]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      <Card className="shadow-none">
                        <CardHeader className="gap-1">
                          <CardTitle className="text-lg">
                            Startup &amp; behavior
                          </CardTitle>
                          <CardDescription>
                            Fine-tune how XanaxLauncher behaves when it starts
                            and closes.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Launch at system startup
                              </p>
                              <p className="text-xs text-text-subtle">
                                Automatically open XanaxLauncher when your
                                computer boots.
                              </p>
                            </div>
                            <Switch
                              checked={settings.behavior.autoStartEnabled}
                              onCheckedChange={(value) =>
                                handleBehaviorToggle('autoStartEnabled', value)
                              }
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Minimize to tray on close
                              </p>
                              <p className="text-xs text-text-subtle">
                                Keep downloads running silently in the
                                background when you close the window.
                              </p>
                            </div>
                            <Switch
                              checked={settings.behavior.minimizeToTray}
                              onCheckedChange={(value) =>
                                handleBehaviorToggle('minimizeToTray', value)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="shadow-none">
                      <CardHeader className="gap-1">
                        <CardTitle className="text-lg">
                          Bandwidth management
                        </CardTitle>
                        <CardDescription>
                          Limit download speeds to preserve bandwidth for the
                          rest of your system.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <Input
                            value={bandwidthValue}
                            onChange={(event) =>
                              setBandwidthValue(event.target.value)
                            }
                            onBlur={handleBandwidthPersist}
                            placeholder="Unlimited"
                            inputMode="decimal"
                            className="sm:max-w-[180px]"
                            disabled={bandwidthSaving}
                          />
                          <Select
                            value={bandwidthUnitValue}
                            onValueChange={(value) =>
                              handleBandwidthUnitChange(
                                value as Settings['behavior']['bandwidthUnit']
                              )
                            }
                          >
                            <SelectTrigger className="h-11 w-full sm:w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {bandwidthUnits.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {bandwidthSaving && (
                            <Loader2 className="h-4 w-4 animate-spin text-catppuccin-blue" />
                          )}
                        </div>
                        <p className="mt-3 text-xs text-text-muted">
                          Set to 0 or leave blank for unlimited bandwidth.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === 'integrations' && (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {(['torbox', 'realdebrid'] as ProviderKey[]).map(
                      (provider) => {
                        const metadata = PROVIDER_METADATA[provider]
                        const token =
                          provider === 'torbox' ? torboxToken : realDebridToken
                        const saving =
                          provider === 'torbox'
                            ? savingTorbox
                            : savingRealDebrid
                        const configured = token.trim().length > 0

                        return (
                          <Card key={provider} className="shadow-none">
                            <CardHeader className="gap-2">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <CardTitle className="text-xl">
                                    <span
                                      className={cn(
                                        'font-semibold',
                                        metadata.accentClass
                                      )}
                                    >
                                      {metadata.name}
                                    </span>
                                  </CardTitle>
                                  <CardDescription>
                                    {metadata.description}
                                  </CardDescription>
                                </div>
                                <Badge
                                  className={cn(
                                    'border border-transparent px-3 py-1 text-xs',
                                    configured
                                      ? 'bg-catppuccin-green/15 text-catppuccin-green'
                                      : 'bg-surface-0/70 text-text-muted'
                                  )}
                                >
                                  {configured ? 'Configured' : 'Not connected'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`${provider}-token`}
                                  className="text-xs uppercase tracking-[0.3em] text-text-muted"
                                >
                                  API token
                                </Label>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id={`${provider}-token`}
                                      type={
                                        provider === 'torbox'
                                          ? showTorboxToken
                                            ? 'text'
                                            : 'password'
                                          : showRealDebridToken
                                            ? 'text'
                                            : 'password'
                                      }
                                      value={token}
                                      onChange={(event) =>
                                        provider === 'torbox'
                                          ? setTorboxToken(event.target.value)
                                          : setRealDebridToken(
                                              event.target.value
                                            )
                                      }
                                      placeholder="Paste your token"
                                      autoComplete="off"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        provider === 'torbox'
                                          ? setShowTorboxToken((prev) => !prev)
                                          : setShowRealDebridToken(
                                              (prev) => !prev
                                            )
                                      }
                                    >
                                      {provider === 'torbox' ? (
                                        showTorboxToken ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )
                                      ) : showRealDebridToken ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                      <span className="sr-only">
                                        {provider === 'torbox'
                                          ? showTorboxToken
                                            ? 'Hide token'
                                            : 'Show token'
                                          : showRealDebridToken
                                            ? 'Hide token'
                                            : 'Show token'}
                                      </span>
                                    </Button>
                                  </div>
                                  <p className="text-xs text-text-muted">
                                    {metadata.name} tokens are stored locally
                                    and never leave your device.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleTestProvider(provider)}
                                disabled={
                                  testingProvider === provider || saving
                                }
                              >
                                {testingProvider === provider ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Testing…
                                  </>
                                ) : (
                                  'Test connection'
                                )}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleSaveProvider(provider)}
                                disabled={saving}
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving…
                                  </>
                                ) : (
                                  'Save credentials'
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="ml-auto"
                                onClick={() =>
                                  window.open(metadata.docUrl, '_blank')
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                                Learn more
                              </Button>
                            </CardFooter>
                          </Card>
                        )
                      }
                    )}
                  </div>
                )}

                {activeSection === 'sources' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground md:text-xl">
                          Media sources overview
                        </h3>
                        <p className="text-sm text-text-subtle">
                          Organize the JSON feeds XanaxLauncher ingests. Sources
                          sync in the background and keep your catalog fresh.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={openCreateSourceDialog}>
                          <FilePlus2 className="h-4 w-4" />
                          Add source
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSyncAllSources}
                          disabled={sources.length === 0 || syncingAll}
                        >
                          {syncingAll ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Syncing…
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Sync all
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImportSources}
                          disabled={importingSources}
                        >
                          {importingSources ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Importing…
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              Import
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleExportSources}
                          disabled={sources.length === 0}
                        >
                          <DownloadCloud className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-3xl border border-catppuccin-yellow/30 bg-catppuccin-yellow/10 p-5 text-sm text-catppuccin-yellow">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <p>
                        Only ingest sources you trust. You are responsible for
                        ensuring you have the legal right to download content
                        provided by a feed.
                      </p>
                    </div>

                    {sourcesLoading ? (
                      <div className="flex min-h-[220px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-catppuccin-blue" />
                      </div>
                    ) : sources.length === 0 ? (
                      <Card className="text-center shadow-none">
                        <CardContent className="space-y-4 py-14">
                          <Database className="mx-auto h-12 w-12 text-text-muted" />
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold">
                              No sources yet
                            </h4>
                            <p className="text-sm text-text-subtle">
                              Add your favourite community feeds to populate the
                              library. Try FitGirl to get started quickly.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={openCreateSourceDialog}
                          >
                            <FilePlus2 className="h-4 w-4" />
                            Add your first source
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 xl:grid-cols-2">
                        {sources.map((source) => (
                          <Card key={source.id} className="shadow-none">
                            <CardHeader className="gap-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <CardTitle className="text-lg font-semibold text-foreground">
                                    {source.name}
                                  </CardTitle>
                                  <p className="font-mono text-xs text-text-subtle break-all">
                                    {source.url}
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    SOURCE_STATUS_STYLES[source.status]
                                  }
                                >
                                  {SOURCE_STATUS_LABELS[source.status]}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                                <span>
                                  Entries:{' '}
                                  <span className="text-foreground">
                                    {source.entryCount}
                                  </span>
                                </span>
                                <span>
                                  Last sync:{' '}
                                  <span className="text-foreground">
                                    {source.lastSyncAt
                                      ? new Date(
                                          source.lastSyncAt
                                        ).toLocaleString()
                                      : 'Never'}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-surface-0/60 p-3 text-xs">
                                <div>
                                  <p className="font-medium text-foreground">
                                    Auto-sync
                                  </p>
                                  <p className="text-text-subtle">
                                    Automatically refresh this source every few
                                    hours.
                                  </p>
                                </div>
                                <Switch
                                  checked={source.autoSync}
                                  onCheckedChange={(value) =>
                                    handleAutoSyncToggle(source, value)
                                  }
                                  disabled={autoSyncUpdatingId === source.id}
                                />
                              </div>
                              {source.errorMessage && (
                                <div className="rounded-2xl border border-catppuccin-red/40 bg-catppuccin-red/15 p-3 text-xs text-catppuccin-red">
                                  {source.errorMessage}
                                </div>
                              )}
                            </CardHeader>
                            <CardFooter className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSyncSingleSource(source)}
                                disabled={syncingSourceId === source.id}
                              >
                                {syncingSourceId === source.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Syncing…
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4" />
                                    Sync now
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => openEditSourceDialog(source)}
                              >
                                <PencilLine className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                  setConfirmAction({
                                    type: 'delete-source',
                                    source,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <p className="text-sm text-text-subtle">
                      XanaxLauncher keeps all of your personal data on-device.
                      Choose whether to share anonymous diagnostics to help us
                      improve stability and performance.
                    </p>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'telemetryEnabled' as const,
                          title: 'Product telemetry',
                          description:
                            'Send anonymous events that help us understand how features are used.',
                        },
                        {
                          key: 'crashReportsEnabled' as const,
                          title: 'Crash reports',
                          description:
                            'Share stack traces when the app misbehaves so we can fix issues faster.',
                        },
                        {
                          key: 'usageStatsEnabled' as const,
                          title: 'Usage statistics',
                          description:
                            'Contribute aggregated stats about download success and provider health.',
                        },
                      ].map((item) => (
                        <Card key={item.key} className="shadow-none">
                          <CardContent className="flex items-start justify-between gap-6 py-5">
                            <div>
                              <h4 className="text-base font-semibold text-foreground">
                                {item.title}
                              </h4>
                              <p className="text-sm text-text-subtle">
                                {item.description}
                              </p>
                            </div>
                            <Switch
                              checked={settings.privacy[item.key]}
                              onCheckedChange={async (value) => {
                                try {
                                  await updatePrivacySettings({
                                    [item.key]: value,
                                  })
                                  toast({
                                    title: value
                                      ? 'Preference enabled'
                                      : 'Preference disabled',
                                    description: `${item.title} ${value ? 'enabled' : 'disabled'}.`,
                                  })
                                } catch (error) {
                                  console.error(
                                    '[Settings] Privacy update failed',
                                    error
                                  )
                                  toast({
                                    title: 'Unable to update preference',
                                    description:
                                      error instanceof Error
                                        ? error.message
                                        : 'Please try again in a moment.',
                                    variant: 'destructive',
                                  })
                                }
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'advanced' && (
                  <div className="space-y-6">
                    <p className="text-sm text-text-subtle">
                      Flush caches, reset preferences, or dig into diagnostics.
                      These tools stay out of the way until you need them.
                    </p>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <Card className="shadow-none">
                        <CardHeader className="gap-1">
                          <CardTitle className="text-lg">Maintenance</CardTitle>
                          <CardDescription>
                            Keep XanaxLauncher healthy by clearing cached data.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setConfirmAction({ type: 'clear-source-cache' })
                            }
                          >
                            Clear source cache
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setConfirmAction({
                                type: 'clear-download-history',
                              })
                            }
                          >
                            Clear download history
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="shadow-none">
                        <CardHeader className="gap-1">
                          <CardTitle className="text-lg">App health</CardTitle>
                          <CardDescription>
                            Diagnose issues and recover from unexpected states.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCheckForUpdates}
                            disabled={checkingUpdates}
                          >
                            {checkingUpdates ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking updates…
                              </>
                            ) : (
                              'Check for updates'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              setConfirmAction({ type: 'reset-settings' })
                            }
                          >
                            Reset settings to defaults
                          </Button>
                          {updateStatus && (
                            <p className="text-xs text-text-subtle">
                              {updateStatus}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeSection === 'about' && (
                  <div className="space-y-6">
                    <Card className="shadow-none">
                      <CardHeader className="gap-2">
                        <CardTitle className="text-xl">XanaxLauncher</CardTitle>
                        <CardDescription>
                          Crafted for collectors who care about polish. Built
                          with Electron, Next.js, and Catppuccin aesthetics.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2 text-sm text-text-subtle sm:grid-cols-2">
                          <div>
                            <span className="font-medium text-foreground">
                              App version:
                            </span>{' '}
                            {versionInfo?.version ?? '—'}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Electron:
                            </span>{' '}
                            {versionInfo?.electron ?? '—'}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Chromium:
                            </span>{' '}
                            {versionInfo?.chrome ?? '—'}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Node.js:
                            </span>{' '}
                            {versionInfo?.node ?? '—'}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-surface-0/60 p-4 text-sm text-text-subtle">
                          <p>
                            XanaxLauncher was designed by fans of the Catppuccin
                            community. Icons provided by Lucide, animations by
                            Framer Motion, and styling courtesy of Tailwind CSS.
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            window.open('https://github.com/', '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          Project repository
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            window.open('https://catppuccin.com/', '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          Catppuccin palette
                        </Button>
                      </CardFooter>
                    </Card>
                    <div className="flex items-center gap-3 rounded-3xl border border-catppuccin-blue/40 bg-catppuccin-blue/10 p-4 text-sm text-catppuccin-blue">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>
                        Thank you for trusting XanaxLauncher. We’re working on
                        new integrations, smarter recommendations, and more
                        automation—stay tuned!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <SourceEditorDialog
        mode={sourceDialogMode}
        open={isSourceDialogOpen}
        submitting={sourceDialogSubmitting}
        initialData={sourceInDialog}
        onClose={() => {
          if (!sourceDialogSubmitting) {
            setIsSourceDialogOpen(false)
            setSourceInDialog(null)
          }
        }}
        onSubmit={handleSourceSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        loading={confirmLoading}
        onCancel={() => {
          if (!confirmLoading) setConfirmAction(null)
        }}
        onConfirm={handleConfirmAction}
        title={(() => {
          switch (confirmAction?.type) {
            case 'delete-source':
              return 'Remove media source'
            case 'reset-settings':
              return 'Reset all settings'
            case 'clear-source-cache':
              return 'Clear cached source data'
            case 'clear-download-history':
              return 'Clear download history'
            default:
              return ''
          }
        })()}
        description={(() => {
          switch (confirmAction?.type) {
            case 'delete-source':
              return `Delete ${confirmAction?.source?.name ?? 'this source'} and all cached entries?`
            case 'reset-settings':
              return 'This will restore every preference to its default value. You will need to configure directories and tokens again.'
            case 'clear-source-cache':
              return 'All cached source entries will be removed. The next sync will rebuild the catalog from scratch.'
            case 'clear-download-history':
              return 'Remove all saved download jobs from the local database? Active downloads are unaffected.'
            default:
              return ''
          }
        })()}
        confirmLabel={(() => {
          switch (confirmAction?.type) {
            case 'delete-source':
              return 'Delete source'
            case 'reset-settings':
              return 'Reset settings'
            case 'clear-source-cache':
              return 'Clear cache'
            case 'clear-download-history':
              return 'Clear history'
            default:
              return 'Confirm'
          }
        })()}
        variant={confirmAction ? 'destructive' : 'default'}
      />
    </AppLayout>
  )
}

interface SourceEditorDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  submitting: boolean
  initialData: Source | null
  onClose: () => void
  onSubmit: (data: SourceFormData) => Promise<void>
}

function SourceEditorDialog({
  mode,
  open,
  submitting,
  initialData,
  onClose,
  onSubmit,
}: SourceEditorDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SourceFormData>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          url: initialData.url,
          autoSync: initialData.autoSync,
        }
      : {
          name: '',
          url: '',
          autoSync: true,
        },
  })

  useEffect(() => {
    if (!open) return
    if (initialData) {
      reset({
        name: initialData.name,
        url: initialData.url,
        autoSync: initialData.autoSync,
      })
    } else {
      reset({ name: '', url: '', autoSync: true })
    }
  }, [initialData, open, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (!value && !submitting ? onClose() : null)}
    >
      <DialogContent className="max-w-lg border border-white/10 bg-surface-0/95 shadow-glow backdrop-blur-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {mode === 'create' ? 'Add media source' : 'Edit media source'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-subtle">
            Provide a public JSON feed that follows the XanaxLauncher schema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="source-name">Source name</Label>
            <Input
              id="source-name"
              placeholder="FitGirl Repacks"
              autoComplete="off"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-catppuccin-red">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-url">Feed URL</Label>
            <Input
              id="source-url"
              placeholder="https://example.com/source.json"
              autoComplete="off"
              {...register('url')}
            />
            {errors.url && (
              <p className="text-xs text-catppuccin-red">
                {errors.url.message}
              </p>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-surface-0/60 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Automatically sync this source
              </p>
              <p className="text-xs text-text-subtle">
                Enable periodic background syncs to keep entries updated.
              </p>
            </div>
            <Controller
              name="autoSync"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={submitting}
                />
              )}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : mode === 'create' ? (
                'Add source'
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  loading: boolean
  title: string
  description: string
  confirmLabel: string
  variant?: 'default' | 'destructive'
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDialog({
  open,
  loading,
  title,
  description,
  confirmLabel,
  variant = 'default',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (!value && !loading ? onCancel() : null)}
    >
      <DialogContent className="max-w-md border border-white/10 bg-surface-0/95 shadow-glow backdrop-blur-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-subtle">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
