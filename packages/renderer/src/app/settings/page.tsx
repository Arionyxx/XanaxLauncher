'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { FiFolder, FiGlobe, FiShield, FiZap, FiDatabase } from 'react-icons/fi'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('general')

  const handleSelectFolder = async (type: 'download' | 'temp') => {
    if (window.api) {
      const result = await window.api.selectFolder()
      if (result.success && result.path) {
        updateSettings({
          general: {
            ...settings.general,
            [type === 'download' ? 'downloadDirectory' : 'tempDirectory']:
              result.path,
          },
        })
        toast({
          title: "Directory Updated",
          description: `${type === 'download' ? 'Download' : 'Temp'} directory updated`,
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
                    <h2 className="text-2xl font-bold">Media Sources</h2>
                    <div className="alert alert-info">
                      <span>
                        Source management is coming soon. For now, configure sources
                        via the settings database.
                      </span>
                    </div>
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
    </AppLayout>
  )
}
