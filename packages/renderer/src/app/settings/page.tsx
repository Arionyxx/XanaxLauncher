'use client'

import { useRouter } from 'next/navigation'
import { Tabs, Tab, Card, CardBody, Spinner, Button } from '@nextui-org/react'
import { useSettings } from '@/hooks/useSettings'
import { GeneralPanel } from '@/components/settings/GeneralPanel'
import { BehaviorPanel } from '@/components/settings/BehaviorPanel'
import { ThemePanel } from '@/components/settings/ThemePanel'
import { IntegrationsPanel } from '@/components/settings/IntegrationsPanel'
import { AccountPanel } from '@/components/settings/AccountPanel'
import { SourcesPanel } from '@/components/settings/SourcesPanel'
import { AdvancedPanel } from '@/components/settings/AdvancedPanel'

export default function SettingsPage() {
  const router = useRouter()
  const {
    settings,
    isLoading,
    error,
    updateGeneralSettings,
    updateBehaviorSettings,
    updateThemeSettings,
  } = useSettings()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-base">
        <Card className="bg-surface0 border-surface1">
          <CardBody>
            <p className="text-red">{error}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            isIconOnly
            variant="flat"
            onPress={() => router.push('/')}
            className="bg-surface0"
          >
            ←
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
            <p className="text-subtext0">
              Configure your application preferences and integrations
            </p>
          </div>
        </div>

        <Tabs
          aria-label="Settings tabs"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: 'gap-6 border-b border-surface0',
            cursor: 'bg-blue',
            tab: 'px-4 h-12',
            tabContent: 'text-subtext0 group-data-[selected=true]:text-text',
          }}
        >
          <Tab
            key="general"
            title={
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span>General</span>
              </div>
            }
          >
            <div className="py-6">
              <GeneralPanel
                settings={settings.general}
                onUpdate={updateGeneralSettings}
              />
            </div>
          </Tab>

          <Tab
            key="behavior"
            title={
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>Behavior</span>
              </div>
            }
          >
            <div className="py-6">
              <BehaviorPanel
                settings={settings.behavior}
                onUpdate={updateBehaviorSettings}
              />
            </div>
          </Tab>

          <Tab
            key="theme"
            title={
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Theme</span>
              </div>
            }
          >
            <div className="py-6">
              <ThemePanel
                settings={settings.theme}
                onUpdate={updateThemeSettings}
              />
            </div>
          </Tab>

          <Tab
            key="sources"
            title={
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span>Sources</span>
              </div>
            }
          >
            <div className="py-6">
              <SourcesPanel />
            </div>
          </Tab>

          <Tab
            key="integrations"
            title={
              <div className="flex items-center gap-2">
                <span>🔌</span>
                <span>Integrations</span>
              </div>
            }
          >
            <div className="py-6">
              <IntegrationsPanel />
            </div>
          </Tab>

          <Tab
            key="account"
            title={
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span>Account</span>
              </div>
            }
          >
            <div className="py-6">
              <AccountPanel />
            </div>
          </Tab>

          <Tab
            key="advanced"
            title={
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <span>Advanced</span>
              </div>
            }
          >
            <div className="py-6">
              <AdvancedPanel />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
