'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const handleNavigation = (section: Section) => {
    if (section === 'settings') {
      router.push('/settings')
    } else if (section === 'downloads') {
      router.push('/downloads')
    } else {
      setActiveSection(section)
    }
  }

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
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id && item.id !== 'settings'
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
          {activeSection === 'home' && <HomeSection router={router} />}
          {activeSection === 'catalog' && <CatalogSection />}
          {activeSection === 'downloads' && <DownloadsSection />}
        </motion.div>
      </main>
    </div>
  )
}

function HomeSection({ router }: { router: ReturnType<typeof useRouter> }) {
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
          <div className="flex items-center gap-3">
            <Button
              color="warning"
              size="sm"
              onPress={() => router.push('/provider-test')}
            >
              Test Providers
            </Button>
            <span className="text-subtext0">
              Test provider framework with mock jobs
            </span>
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
