'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { 
  FiFolder, 
  FiGlobe, 
  FiShield, 
  FiZap, 
  FiDatabase, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiRefreshCw, 
  FiDownload, 
  FiUpload,
  FiLock,
  FiUnlock,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiExternalLink
} from 'react-icons/fi'
import { useSettings } from '@/hooks/useSettings'
import { toast } from '@/hooks/use-toast'
import { useSources } from '@/hooks/useSources'
import { SourceFormData } from '@/types/source'
import { Source } from '@/db/schema'

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings()
  const { 
    sources, 
    loading: sourcesLoading, 
    addSource, 
    updateSource, 
    removeSource, 
    syncSource, 
    syncAllSources,
    testConnection,
    importSources,
    exportSources
  } = useSources()
  const [activeTab, setActiveTab] = useState('general')
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<Source | null>(null)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [syncingSource, setSyncingSource] = useState<string | null>(null)
  const [syncingAll, setSyncingAll] = useState(false)

  const handleSelectFolder = async (type: 'download' | 'temp') => {
    if (window.api) {
      const result = await window.api.selectFolder()
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const path = result.filePaths[0]
        updateSettings({
          general: {
            ...settings.general,
            [type === 'download' ? 'downloadDirectory' : 'tempDirectory']: path,
          },
        })
        toast({
          title: "Directory Updated",
          description: `${type === 'download' ? 'Download' : 'Temp'} directory updated to: ${path}`,
        })
      }
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-base-content/70 mt-1">
            Configure your application preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64">
            <ul className="menu bg-base-200 rounded-box">
              <li>
                <a
                  className={activeTab === 'general' ? 'active' : ''}
                  onClick={() => setActiveTab('general')}
                >
                  <FiFolder />
                  General
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'integrations' ? 'active' : ''}
                  onClick={() => setActiveTab('integrations')}
                >
                  <FiGlobe />
                  Integrations
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'behavior' ? 'active' : ''}
                  onClick={() => setActiveTab('behavior')}
                >
                  <FiZap />
                  Behavior
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'sources' ? 'active' : ''}
                  onClick={() => setActiveTab('sources')}
                >
                  <FiDatabase />
                  Sources
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'privacy' ? 'active' : ''}
                  onClick={() => setActiveTab('privacy')}
                >
                  <FiShield />
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div className="flex-1">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">General Settings</h2>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Download Directory
                        </span>
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={settings.general.downloadDirectory || ''}
                          readOnly
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSelectFolder('download')}
                        >
                          Browse
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Temp Directory
                        </span>
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={settings.general.tempDirectory || ''}
                          readOnly
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSelectFolder('temp')}
                        >
                          Browse
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Language</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={settings.general.language}
                        onChange={(e) =>
                          updateSettings({
                            general: {
                              ...settings.general,
                              language: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Integrations</h2>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          TorBox API Token
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your TorBox API token"
                        className="input input-bordered"
                        value={settings.integrations.torboxApiToken || ''}
                        onChange={(e) =>
                          updateSettings({
                            integrations: {
                              ...settings.integrations,
                              torboxApiToken: e.target.value,
                            },
                          })
                        }
                      />
                      <label className="label">
                        <span className="label-text-alt">
                          Get your API token from torbox.app
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'behavior' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Behavior</h2>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text font-semibold">
                          Auto-start on system boot
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={settings.behavior.autoStart}
                          onChange={(e) =>
                            updateSettings({
                              behavior: {
                                ...settings.behavior,
                                autoStart: e.target.checked,
                              },
                            })
                          }
                        />
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text font-semibold">
                          Minimize to system tray
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={settings.behavior.minimizeToTray}
                          onChange={(e) =>
                            updateSettings({
                              behavior: {
                                ...settings.behavior,
                                minimizeToTray: e.target.checked,
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'sources' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Media Sources</h2>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsAddSourceModalOpen(true)}
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Source
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = '.json'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                try {
                                  const text = await file.text()
                                  const data = JSON.parse(text)
                                  await importSources(data)
                                  toast({
                                    title: "Sources Imported",
                                    description: "Successfully imported sources from file",
                                  })
                                } catch (error) {
                                  toast({
                                    title: "Import Failed",
                                    description: "Failed to import sources. Please check the file format.",
                                    variant: "destructive",
                                  })
                                }
                              }
                            }
                            input.click()
                          }}
                        >
                          <FiUpload className="w-4 h-4" />
                          Import
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={async () => {
                            try {
                              const data = await exportSources()
                              const blob = new Blob([JSON.stringify(data, null, 2)], {
                                type: 'application/json',
                              })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `sources-${new Date().toISOString().split('T')[0]}.json`
                              a.click()
                              URL.revokeObjectURL(url)
                              toast({
                                title: "Sources Exported",
                                description: "Successfully exported sources to file",
                              })
                            } catch (error) {
                              toast({
                                title: "Export Failed",
                                description: "Failed to export sources",
                                variant: "destructive",
                              })
                            }
                          }}
                          disabled={sources.length === 0}
                        >
                          <FiDownload className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={async () => {
                            setSyncingAll(true)
                            try {
                              await syncAllSources()
                              toast({
                                title: "Sync Complete",
                                description: "All sources have been synced",
                              })
                            } catch (error) {
                              toast({
                                title: "Sync Failed",
                                description: "Failed to sync some sources. Check individual sources for details.",
                                variant: "destructive",
                              })
                            } finally {
                              setSyncingAll(false)
                            }
                          }}
                          disabled={sources.length === 0 || syncingAll}
                        >
                          {syncingAll ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <FiRefreshCw className="w-4 h-4" />
                          )}
                          Sync All
                        </button>
                      </div>
                    </div>

                    <div className="alert alert-warning">
                      <FiAlertTriangle className="w-4 h-4" />
                      <div>
                        <strong>Legal Notice:</strong> You are solely responsible for the content sources you add. 
                        Ensure you have the legal right to access and download content from any source.
                      </div>
                    </div>

                    {sources.length === 0 ? (
                      <div className="text-center py-12">
                        <FiDatabase className="w-16 h-16 mx-auto text-base-content/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Sources Added</h3>
                        <p className="text-base-content/70 mb-4">
                          Add media sources to browse and download games from various providers.
                        </p>
                        <div className="alert alert-info">
                          <strong>Example Source:</strong> You can add <strong>FitGirl Repacks</strong> 
                          using the URL: <code className="text-xs">https://hydralinks.pages.dev/sources/fitgirl.json</code>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => setIsAddSourceModalOpen(true)}
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Your First Source
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {sources.map((source) => (
                          <div key={source.id} className="card bg-base-100 shadow-sm">
                            <div className="card-body p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold truncate">{source.name}</h3>
                                    {source.url.startsWith('https://') ? (
                                      <FiLock className="w-4 h-4 text-success" title="Secure (HTTPS)" />
                                    ) : (
                                      <FiUnlock className="w-4 h-4 text-warning" title="Insecure (HTTP)" />
                                    )}
                                  </div>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-base-content/70 hover:text-primary flex items-center gap-1 truncate"
                                  >
                                    {source.url}
                                    <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1">
                                      Status:
                                      <span className={`badge badge-${
                                        source.status === 'synced' ? 'success' :
                                        source.status === 'syncing' ? 'warning' :
                                        source.status === 'error' ? 'error' :
                                        'neutral'
                                      }`}>
                                        {source.status.replace('_', ' ')}
                                      </span>
                                    </span>
                                    <span>
                                      Entries: {source.entryCount}
                                    </span>
                                    {source.lastSyncAt && (
                                      <span className="text-base-content/70">
                                        Last sync: {new Date(source.lastSyncAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {source.errorMessage && (
                                    <div className="alert alert-error alert-sm mt-2">
                                      <FiX className="w-4 h-4" />
                                      <span className="text-xs">{source.errorMessage}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <div className="form-control">
                                    <label className="label cursor-pointer">
                                      <span className="label-text">Auto-sync</span>
                                      <input
                                        type="checkbox"
                                        className="toggle toggle-sm"
                                        checked={source.autoSync}
                                        onChange={async () => {
                                          await updateSource(source.id, { autoSync: !source.autoSync })
                                          toast({
                                            title: "Source Updated",
                                            description: `Auto-sync ${!source.autoSync ? 'enabled' : 'disabled'} for ${source.name}`,
                                          })
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={async () => {
                                        setTestingConnection(source.id)
                                        try {
                                          await testConnection(source.url)
                                          toast({
                                            title: "Connection Successful",
                                            description: `Successfully connected to ${source.name}`,
                                          })
                                        } catch (error) {
                                          toast({
                                            title: "Connection Failed",
                                            description: error instanceof Error ? error.message : "Unknown error",
                                            variant: "destructive",
                                          })
                                        } finally {
                                          setTestingConnection(null)
                                        }
                                      }}
                                      disabled={testingConnection === source.id}
                                    >
                                      {testingConnection === source.id ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                      ) : (
                                        <FiExternalLink className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={async () => {
                                        setSyncingSource(source.id)
                                        try {
                                          await syncSource(source.id)
                                          toast({
                                            title: "Sync Complete",
                                            description: `Successfully synced ${source.name}`,
                                          })
                                        } catch (error) {
                                          toast({
                                            title: "Sync Failed",
                                            description: error instanceof Error ? error.message : "Unknown error",
                                            variant: "destructive",
                                          })
                                        } finally {
                                          setSyncingSource(null)
                                        }
                                      }}
                                      disabled={syncingSource === source.id}
                                    >
                                      {syncingSource === source.id ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                      ) : (
                                        <FiRefreshCw className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => setEditingSource(source)}
                                    >
                                      <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-ghost text-error"
                                      onClick={async () => {
                                        if (confirm(`Are you sure you want to delete "${source.name}"?`)) {
                                          await removeSource(source.id)
                                          toast({
                                            title: "Source Deleted",
                                            description: `${source.name} has been removed`,
                                          })
                                        }
                                      }}
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Privacy</h2>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text font-semibold">
                          Enable telemetry
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={settings.privacy?.enableTelemetry || false}
                          onChange={(e) =>
                            updateSettings({
                              privacy: {
                                ...settings.privacy,
                                enableTelemetry: e.target.checked,
                              },
                            })
                          }
                        />
                      </label>
                      <label className="label">
                        <span className="label-text-alt">
                          Help us improve by sending anonymous usage data
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Source Modal */}
      {(isAddSourceModalOpen || editingSource) && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">
              {editingSource ? 'Edit Source' : 'Add New Source'}
            </h3>
            
            <SourceModal
              source={editingSource}
              onClose={() => {
                setIsAddSourceModalOpen(false)
                setEditingSource(null)
              }}
            />
          </div>
          <div className="modal-backdrop" onClick={() => {
            setIsAddSourceModalOpen(false)
            setEditingSource(null)
          }}></div>
        </div>
      )}
    </AppLayout>
  )
}

// Source Modal Component
function SourceModal({ source, onClose }: { source: Source | null; onClose: () => void }) {
  const { addSource, updateSource, testConnection } = useSources()
  const { toast } = useToast()
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    url: '',
    autoSync: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Initialize form data when editing
  React.useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        url: source.url,
        autoSync: source.autoSync,
      })
    } else {
      // Reset form when adding new source
      setFormData({
        name: '',
        url: '',
        autoSync: true,
      })
    }
  }, [source])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name is too long (max 100 characters)'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Must be a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (source) {
        await updateSource(source.id, formData)
        toast({
          title: "Source Updated",
          description: `"${formData.name}" has been updated`,
        })
      } else {
        await addSource(formData)
        toast({
          title: "Source Added",
          description: `"${formData.name}" has been added successfully`,
        })
      }
      onClose()
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.url) {
      setErrors({ url: 'URL is required to test connection' })
      return
    }

    setIsTesting(true)
    try {
      await testConnection(formData.url)
      toast({
        title: "Connection Successful",
        description: "The source is accessible and returns valid JSON",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Name</span>
        </label>
        <input
          type="text"
          className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
          placeholder="e.g., FitGirl Repacks"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            if (errors.name) setErrors({ ...errors, name: '' })
          }}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">URL</span>
        </label>
        <div className="input-group">
          <input
            type="url"
            className={`input input-bordered flex-1 ${errors.url ? 'input-error' : ''}`}
            placeholder="https://example.com/source.json"
            value={formData.url}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value })
              if (errors.url) setErrors({ ...errors, url: '' })
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={!formData.url || isTesting}
          >
            {isTesting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Test'
            )}
          </button>
        </div>
        {errors.url && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.url}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">
            URL should return a JSON feed with the specified format
          </span>
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text font-semibold">Auto-sync</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={formData.autoSync}
            onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
          />
        </label>
        <label className="label">
          <span className="label-text-alt">
            Automatically sync this source when the app starts (if not synced in the last hour)
          </span>
        </label>
      </div>

      <div className="modal-action">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            source ? 'Update' : 'Add'
          )}
        </button>
      </div>
    </form>
  )
}
