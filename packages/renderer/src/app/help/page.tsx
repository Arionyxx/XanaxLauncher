'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Tabs,
  Tab,
  Code,
  Divider,
} from '@nextui-org/react'

export default function HelpPage() {
  const router = useRouter()
  const [appVersion, setAppVersion] = useState<string>('0.1.0')

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        if (window.api?.app?.getVersion) {
          const version = await window.api.app.getVersion()
          setAppVersion(version.version)
        }
      } catch (error) {
        console.error('Failed to fetch app version:', error)
      }
    }
    fetchVersion()
  }, [])

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">
                Help & About
              </h1>
              <p className="text-subtext0">
                Learn more about Media Manager and get help
              </p>
            </div>
            <Button color="default" variant="flat" onPress={() => router.back()}>
              ← Back
            </Button>
          </div>

          <Tabs
            aria-label="Help sections"
            color="primary"
            classNames={{
              tabList: 'bg-surface0',
              cursor: 'bg-blue',
              tab: 'text-text',
            }}
          >
            <Tab key="shortcuts" title="Keyboard Shortcuts">
              <Card className="bg-surface0 border-surface1">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text">
                    Global Keyboard Shortcuts
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <ShortcutRow
                      keys={['Ctrl/Cmd', 'F']}
                      description="Focus search bar in Catalog"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['Ctrl/Cmd', 'J']}
                      description="Navigate to Downloads page"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['Ctrl/Cmd', ',']}
                      description="Navigate to Settings page"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['Ctrl/Cmd', 'H']}
                      description="Navigate to Home/Catalog"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['Ctrl/Cmd', 'R']}
                      description="Refresh application"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['Escape']}
                      description="Close modals and dialogs"
                    />
                    <Divider className="bg-surface1" />
                    <ShortcutRow
                      keys={['/']}
                      description="Focus search in Catalog (alternative)"
                    />
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="about" title="About">
              <Card className="bg-surface0 border-surface1">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text">
                    About Media Manager
                  </h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue mb-2">
                      Version
                    </h3>
                    <Code className="bg-mantle text-text">{appVersion}</Code>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-mauve mb-2">
                      Description
                    </h3>
                    <p className="text-subtext0">
                      Media Manager is a modern, cross-platform application for
                      managing your media downloads. Built with Electron, Next.js,
                      and styled with the beautiful Catppuccin color scheme.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-green mb-2">
                      Technology Stack
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <TechItem name="Electron" version="28" />
                      <TechItem name="Next.js" version="14" />
                      <TechItem name="React" version="18" />
                      <TechItem name="TypeScript" version="5" />
                      <TechItem name="Tailwind CSS" version="3" />
                      <TechItem name="Framer Motion" version="Latest" />
                      <TechItem name="NextUI" version="Latest" />
                      <TechItem name="Catppuccin" version="Theme" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-yellow mb-2">
                      Credits
                    </h3>
                    <p className="text-subtext0">
                      • Catppuccin color scheme by{' '}
                      <a
                        href="https://github.com/catppuccin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue hover:underline"
                      >
                        @catppuccin
                      </a>
                    </p>
                    <p className="text-subtext0 mt-1">
                      • Icons and UI components by NextUI
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-red mb-2">
                      Legal Notice
                    </h3>
                    <div className="p-4 bg-mantle rounded-lg border border-red/30">
                      <p className="text-sm text-subtext0">
                        This application is a tool for managing media content.
                        Users are responsible for ensuring they have the legal
                        right to access and download any content. Always respect
                        copyright laws and terms of service.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="features" title="Features">
              <Card className="bg-surface0 border-surface1">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text">Features</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <FeatureItem
                    icon="📚"
                    title="Content Catalog"
                    description="Browse and search your media library with powerful filters"
                  />
                  <Divider className="bg-surface1" />
                  <FeatureItem
                    icon="⬇️"
                    title="Download Management"
                    description="Monitor and control your downloads with multiple providers"
                  />
                  <Divider className="bg-surface1" />
                  <FeatureItem
                    icon="🔗"
                    title="Provider Integration"
                    description="Support for TorBox, Real-Debrid, and more coming soon"
                  />
                  <Divider className="bg-surface1" />
                  <FeatureItem
                    icon="🎨"
                    title="Beautiful Theming"
                    description="Catppuccin color scheme with multiple flavors and accents"
                  />
                  <Divider className="bg-surface1" />
                  <FeatureItem
                    icon="⚡"
                    title="Performance"
                    description="Fast, responsive UI with smooth animations"
                  />
                  <Divider className="bg-surface1" />
                  <FeatureItem
                    icon="🔒"
                    title="Privacy First"
                    description="All data stored locally, no telemetry or tracking"
                  />
                </CardBody>
              </Card>
            </Tab>

            <Tab key="help" title="Getting Help">
              <Card className="bg-surface0 border-surface1">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-text">Need Help?</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue mb-2">
                      Common Issues
                    </h3>
                    <div className="space-y-3">
                      <HelpItem
                        question="Downloads not starting?"
                        answer="Make sure you have configured at least one provider in Settings > Integrations and tested the connection."
                      />
                      <HelpItem
                        question="No games showing in catalog?"
                        answer="Add content sources in Settings > Sources and sync them. The catalog will populate with available content."
                      />
                      <HelpItem
                        question="Application running slow?"
                        answer="Try clearing your browser cache, reducing the number of active downloads, or restarting the application."
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-mauve mb-2">
                      Tips & Tricks
                    </h3>
                    <ul className="space-y-2 text-subtext0 list-disc list-inside">
                      <li>Use keyboard shortcuts for faster navigation</li>
                      <li>Enable auto-sync on sources for automatic updates</li>
                      <li>Set bandwidth limits in Settings to control speeds</li>
                      <li>Use filters in the catalog to find content quickly</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

function ShortcutRow({
  keys,
  description,
}: {
  keys: string[]
  description: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-3 py-1 bg-mantle text-text text-sm rounded border border-surface1">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-1 text-subtext0">+</span>}
          </span>
        ))}
      </div>
      <p className="text-subtext0">{description}</p>
    </div>
  )
}

function TechItem({ name, version }: { name: string; version: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-mantle rounded">
      <span className="text-text text-sm">{name}</span>
      <span className="text-subtext0 text-xs">{version}</span>
    </div>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-text">{title}</h4>
        <p className="text-subtext0">{description}</p>
      </div>
    </div>
  )
}

function HelpItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <div className="p-3 bg-mantle rounded">
      <p className="font-semibold text-text mb-1">{question}</p>
      <p className="text-sm text-subtext0">{answer}</p>
    </div>
  )
}
