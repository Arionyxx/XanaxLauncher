'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { PrivacySettings } from '@/types/settings'

interface PrivacyPanelProps {
  settings: PrivacySettings
  onUpdate: (settings: Partial<PrivacySettings>) => Promise<void>
}

export function PrivacyPanel({ settings, onUpdate }: PrivacyPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Privacy & Telemetry</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label>Enable Telemetry</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Send anonymous usage data to help improve the application.
                  This is completely optional and opt-in.
                </p>
              </div>
              <Switch
                checked={settings.telemetryEnabled}
                onCheckedChange={(value) =>
                  onUpdate({ telemetryEnabled: value })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label>Crash Reports</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically send crash reports when the application
                  encounters errors. Helps us identify and fix bugs quickly.
                </p>
              </div>
              <Switch
                checked={settings.crashReportsEnabled}
                onCheckedChange={(value) =>
                  onUpdate({ crashReportsEnabled: value })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label>Usage Statistics</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Collect anonymous statistics about feature usage to help
                  prioritize development efforts.
                </p>
              </div>
              <Switch
                checked={settings.usageStatsEnabled}
                onCheckedChange={(value) =>
                  onUpdate({ usageStatsEnabled: value })
                }
              />
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 mt-6">
            <h4 className="text-sm font-semibold text-primary mb-2">
              📊 What We Collect
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Application version and platform information</li>
              <li>Feature usage patterns (no personal data)</li>
              <li>Crash logs and error stack traces</li>
              <li>Performance metrics (startup time, memory usage)</li>
            </ul>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="text-sm font-semibold text-green-600 mb-2">
              🔒 Privacy First
            </h4>
            <p className="text-xs text-muted-foreground">
              All telemetry is <strong>opt-in</strong> and{' '}
              <strong>anonymous</strong>. We never collect personal information,
              API tokens, or file paths. You can disable telemetry at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
