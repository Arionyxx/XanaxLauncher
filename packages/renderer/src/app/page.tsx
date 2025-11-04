'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardBody, CardHeader, Button } from '@nextui-org/react'

type Section = 'home' | 'catalog' | 'downloads' | 'settings'

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'catalog', label: 'Catalog', icon: '📚' },
  { id: 'downloads', label: 'Downloads', icon: '⬇️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('home')

  return (
    <div className="flex h-screen w-screen bg-base">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-64 bg-mantle border-r border-surface0 flex flex-col"
      >
        {/* App Title */}
        <div className="p-6 border-b border-surface0">
          <h1 className="text-2xl font-bold text-blue">Media Manager</h1>
          <p className="text-sm text-subtext0 mt-1">Catppuccin Edition</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-blue text-crust font-semibold'
                      : 'text-text hover:bg-surface0'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface0">
          <p className="text-xs text-subtext0 text-center">v0.1.0</p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {activeSection === 'home' && <HomeSection />}
          {activeSection === 'catalog' && <CatalogSection />}
          {activeSection === 'downloads' && <DownloadsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </motion.div>
      </main>
    </div>
  )
}

function HomeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Welcome Home</h2>
        <p className="text-subtext0">
          Your media management dashboard with Catppuccin Macchiato theming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-blue">Quick Stats</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Your statistics will appear here</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-mauve">Recent Items</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Recently added items will show here</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader className="pb-0">
            <h3 className="text-xl font-semibold text-green">Activity</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">
              Recent activity will be tracked here
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Getting Started</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-3">
            <Button color="primary" size="sm">
              Add Media
            </Button>
            <span className="text-subtext0">
              Start by adding your first media item
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button color="secondary" size="sm">
              Browse Catalog
            </Button>
            <span className="text-subtext0">Explore your media collection</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function CatalogSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Catalog</h2>
        <p className="text-subtext0">Browse and manage your media collection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Card
            key={item}
            className="bg-surface0 border-surface1 hover:border-blue transition-colors cursor-pointer"
          >
            <CardBody className="p-0">
              <div className="aspect-video bg-surface1 flex items-center justify-center">
                <span className="text-4xl">🎬</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-text">Media Item {item}</h3>
                <p className="text-sm text-subtext0">Placeholder content</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DownloadsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Downloads</h2>
        <p className="text-subtext0">
          Monitor your active and completed downloads
        </p>
      </div>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Active Downloads</h3>
        </CardHeader>
        <CardBody>
          <p className="text-subtext0">No active downloads at the moment</p>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Download History</h3>
        </CardHeader>
        <CardBody>
          <p className="text-subtext0">
            Your download history will appear here
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function SettingsSection() {
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [appVersion, setAppVersion] = useState<string>('')
  const [testSetting, setTestSetting] = useState<string>('')
  const [dbSetting, setDbSetting] = useState<string>('')
  const [sourcesList, setSourcesList] = useState<string>('')
  const [jobsList, setJobsList] = useState<string>('')
  const [allSettings, setAllSettings] = useState<string>('')

  const handleSelectFolder = async () => {
    try {
      const result = await window.api.selectFolder()
      if (!result.canceled && result.filePaths.length > 0) {
        setSelectedFolder(result.filePaths[0])
        console.log('Selected folder:', result.filePaths[0])
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
    }
  }

  const handleGetVersion = async () => {
    try {
      const version = await window.api.getVersion()
      const versionInfo = `App: ${version.version} | Electron: ${version.electron} | Node: ${version.node}`
      setAppVersion(versionInfo)
      console.log('App version:', version)
    } catch (error) {
      console.error('Error getting version:', error)
    }
  }

  const handleSaveSetting = async () => {
    try {
      await window.api.setSettings('testKey', 'testValue123')
      console.log('Setting saved successfully')
    } catch (error) {
      console.error('Error saving setting:', error)
    }
  }

  const handleLoadSetting = async () => {
    try {
      const result = await window.api.getSettings('testKey')
      setTestSetting(result.value as string)
      console.log('Setting loaded:', result)
    } catch (error) {
      console.error('Error loading setting:', error)
    }
  }

  const handleSaveDbSetting = async () => {
    try {
      const { setSetting } = await import('@/services/storage')
      await setSetting('appTheme', 'catppuccin-macchiato')
      await setSetting('lastUsed', new Date().toISOString())
      setDbSetting('Settings saved to IndexedDB!')
    } catch (error) {
      console.error('Error saving to IndexedDB:', error)
      setDbSetting('Error saving settings')
    }
  }

  const handleLoadDbSettings = async () => {
    try {
      const { getAllSettings } = await import('@/services/storage')
      const settings = await getAllSettings()
      setAllSettings(JSON.stringify(settings, null, 2))
      console.log('Loaded settings:', settings)
    } catch (error) {
      console.error('Error loading from IndexedDB:', error)
      setAllSettings('Error loading settings')
    }
  }

  const handleAddSource = async () => {
    try {
      const { addSource } = await import('@/services/storage')
      const id = await addSource({
        name: `Test Source ${Date.now()}`,
        url: 'https://example.com',
        lastSyncAt: Date.now(),
        status: 'active',
        data: { type: 'test', items: [] },
      })
      setSourcesList(`Source added with ID: ${id}`)
    } catch (error) {
      console.error('Error adding source:', error)
      setSourcesList('Error adding source')
    }
  }

  const handleListSources = async () => {
    try {
      const { getSources } = await import('@/services/storage')
      const sources = await getSources()
      setSourcesList(JSON.stringify(sources, null, 2))
      console.log('Sources:', sources)
    } catch (error) {
      console.error('Error listing sources:', error)
      setSourcesList('Error listing sources')
    }
  }

  const handleAddJob = async () => {
    try {
      const { addJob } = await import('@/services/storage')
      const id = await addJob({
        provider: 'test-provider',
        status: 'pending',
        progress: 0,
        metadata: { task: 'test-task', priority: 'high' },
      })
      setJobsList(`Job added with ID: ${id}`)
    } catch (error) {
      console.error('Error adding job:', error)
      setJobsList('Error adding job')
    }
  }

  const handleListJobs = async () => {
    try {
      const { getJobs } = await import('@/services/storage')
      const jobs = await getJobs()
      setJobsList(JSON.stringify(jobs, null, 2))
      console.log('Jobs:', jobs)
    } catch (error) {
      console.error('Error listing jobs:', error)
      setJobsList('Error listing jobs')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text mb-2">Settings</h2>
        <p className="text-subtext0">Configure your application preferences</p>
      </div>

      <div className="space-y-4">
        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-text">
              IndexedDB Test (Persistent)
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-blue mb-2">
                Settings Storage
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Button color="primary" size="sm" onClick={handleSaveDbSetting}>
                  Save Test Settings
                </Button>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={handleLoadDbSettings}
                >
                  Load All Settings
                </Button>
              </div>
              {dbSetting && (
                <p className="text-sm text-green mt-2">{dbSetting}</p>
              )}
              {allSettings && (
                <pre className="text-xs text-subtext0 mt-2 p-2 bg-surface1 rounded overflow-auto max-h-40">
                  {allSettings}
                </pre>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-mauve mb-2">
                Sources Storage
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Button color="primary" size="sm" onClick={handleAddSource}>
                  Add Test Source
                </Button>
                <Button color="secondary" size="sm" onClick={handleListSources}>
                  List All Sources
                </Button>
              </div>
              {sourcesList && (
                <pre className="text-xs text-subtext0 mt-2 p-2 bg-surface1 rounded overflow-auto max-h-40">
                  {sourcesList}
                </pre>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-peach mb-2">
                Jobs Storage
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Button color="primary" size="sm" onClick={handleAddJob}>
                  Add Test Job
                </Button>
                <Button color="secondary" size="sm" onClick={handleListJobs}>
                  List All Jobs
                </Button>
              </div>
              {jobsList && (
                <pre className="text-xs text-subtext0 mt-2 p-2 bg-surface1 rounded overflow-auto max-h-40">
                  {jobsList}
                </pre>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-text">
              IPC Test (Main Process)
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Button color="primary" onClick={handleSelectFolder}>
                Select Folder
              </Button>
              {selectedFolder && (
                <p className="text-sm text-green mt-2">
                  Selected: {selectedFolder}
                </p>
              )}
            </div>

            <div>
              <Button color="secondary" onClick={handleGetVersion}>
                Get App Version
              </Button>
              {appVersion && (
                <p className="text-sm text-blue mt-2">{appVersion}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button color="success" onClick={handleSaveSetting}>
                Save Test Setting
              </Button>
              <Button color="warning" onClick={handleLoadSetting}>
                Load Test Setting
              </Button>
              {testSetting && (
                <p className="text-sm text-mauve mt-2">Value: {testSetting}</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-text">Appearance</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Theme and display settings</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-text">Downloads</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Download preferences and paths</p>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h3 className="text-xl font-semibold text-text">Advanced</h3>
          </CardHeader>
          <CardBody>
            <p className="text-subtext0">Advanced configuration options</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
