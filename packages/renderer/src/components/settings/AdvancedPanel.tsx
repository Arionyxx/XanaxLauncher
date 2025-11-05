import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { useOnboarding } from '@/hooks/useOnboarding'

export function AdvancedPanel() {
  const { resetOnboarding } = useOnboarding()
  const [isResetting, setIsResetting] = useState(false)
  const [isOpeningLogs, setIsOpeningLogs] = useState(false)
  const [logPath, setLogPath] = useState<string>('')
  const [appVersion, setAppVersion] = useState<string>('1.0.0')

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (window.api?.logs?.getPath) {
          const result = await window.api.logs.getPath()
          setLogPath(result.path)
        }
        if (window.api?.getVersion) {
          const version = await window.api.getVersion()
          setAppVersion(version.version)
        }
      } catch (error) {
        console.error('Failed to fetch app info:', error)
      }
    }
    fetchInfo()
  }, [])

  const handleResetOnboarding = async () => {
    if (
      !confirm(
        'Are you sure you want to reset the onboarding? You will see the setup wizard again on next app load.'
      )
    ) {
      return
    }

    setIsResetting(true)
    try {
      await resetOnboarding()
      toast({
        title: 'Success',
        description:
          'Onboarding reset successfully. Reload the app to see the wizard.',
      })
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset onboarding',
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleOpenLogs = async () => {
    setIsOpeningLogs(true)
    try {
      if (window.api?.logs?.openFolder) {
        await window.api.logs.openFolder()
        toast({
          title: 'Logs Opened',
          description: 'Logs folder opened successfully',
        })
      } else {
        toast({
          title: 'API Error',
          description: 'Logs API not available',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to open logs folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to open logs folder',
        variant: 'destructive',
      })
    } finally {
      setIsOpeningLogs(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Logs & Diagnostics</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-medium">Application Logs</h4>
              <p className="text-sm text-muted-foreground mt-1">
                View application logs for troubleshooting and debugging issues.
              </p>
              {logPath && (
                <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                  {logPath}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={handleOpenLogs}
              disabled={isOpeningLogs}
            >
              {isOpeningLogs ? 'Opening...' : 'Open Logs Folder'}
            </Button>
          </div>

          <Separator />

          <div className="bg-primary/20 border border-primary/50 rounded-lg p-3">
            <p className="text-sm text-primary">
              💡 <strong>Safe Mode:</strong> Launch the app with{' '}
              <code className="bg-muted px-2 py-1 rounded">--safe-mode</code>{' '}
              flag to disable extensions and troubleshoot issues.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Testing & Debug</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-medium">Reset Onboarding</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Clear the onboarding completion flag to see the first-run wizard
                again. Useful for testing.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleResetOnboarding}
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Onboarding'}
            </Button>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-sm text-yellow-600">
              ⚠️ After resetting, you'll need to reload the app or navigate away
              and back to see the onboarding wizard.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Application Info</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">{appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span>IndexedDB (Dexie)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Theme</span>
            <span>Catppuccin Macchiato</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

