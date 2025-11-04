'use client'

import { Card, CardBody, CardHeader, Switch, Divider } from '@nextui-org/react'
import { PrivacySettings } from '@/types/settings'

interface PrivacyPanelProps {
  settings: PrivacySettings
  onUpdate: (settings: Partial<PrivacySettings>) => Promise<void>
}

export function PrivacyPanel({ settings, onUpdate }: PrivacyPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-text">
            Privacy & Telemetry
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-text font-medium">Enable Telemetry</p>
                <p className="text-sm text-subtext0 mt-1">
                  Send anonymous usage data to help improve the application.
                  This is completely optional and opt-in.
                </p>
              </div>
              <Switch
                isSelected={settings.telemetryEnabled}
                onValueChange={(value) =>
                  onUpdate({ telemetryEnabled: value })
                }
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-blue',
                }}
              />
            </div>

            <Divider className="bg-surface1" />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-text font-medium">Crash Reports</p>
                <p className="text-sm text-subtext0 mt-1">
                  Automatically send crash reports when the application
                  encounters errors. Helps us identify and fix bugs quickly.
                </p>
              </div>
              <Switch
                isSelected={settings.crashReportsEnabled}
                onValueChange={(value) =>
                  onUpdate({ crashReportsEnabled: value })
                }
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-blue',
                }}
              />
            </div>

            <Divider className="bg-surface1" />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-text font-medium">Usage Statistics</p>
                <p className="text-sm text-subtext0 mt-1">
                  Collect anonymous statistics about feature usage to help
                  prioritize development efforts.
                </p>
              </div>
              <Switch
                isSelected={settings.usageStatsEnabled}
                onValueChange={(value) =>
                  onUpdate({ usageStatsEnabled: value })
                }
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-blue',
                }}
              />
            </div>
          </div>

          <div className="p-4 bg-mantle rounded-lg border border-blue/30 mt-6">
            <h4 className="text-sm font-semibold text-blue mb-2">
              📊 What We Collect
            </h4>
            <ul className="text-xs text-subtext0 space-y-1 list-disc list-inside">
              <li>Application version and platform information</li>
              <li>Feature usage patterns (no personal data)</li>
              <li>Crash logs and error stack traces</li>
              <li>Performance metrics (startup time, memory usage)</li>
            </ul>
          </div>

          <div className="p-4 bg-mantle rounded-lg border border-green/30">
            <h4 className="text-sm font-semibold text-green mb-2">
              🔒 Privacy First
            </h4>
            <p className="text-xs text-subtext0">
              All telemetry is <strong>opt-in</strong> and{' '}
              <strong>anonymous</strong>. We never collect personal information,
              API tokens, or file paths. You can disable telemetry at any time.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
