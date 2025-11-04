import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Divider } from '@nextui-org/react'
import { toast } from 'sonner'
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
      toast.success(
        'Onboarding reset successfully. Reload the app to see the wizard.'
      )
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
      toast.error('Failed to reset onboarding')
    } finally {
      setIsResetting(false)
    }
  }

  const handleOpenLogs = async () => {
    setIsOpeningLogs(true)
    try {
      if (window.api?.logs?.openFolder) {
        await window.api.logs.openFolder()
        toast.success('Logs folder opened')
      } else {
        toast.error('Logs API not available')
      }
    } catch (error) {
      console.error('Failed to open logs folder:', error)
      toast.error('Failed to open logs folder')
    } finally {
      setIsOpeningLogs(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">
            Logs & Diagnostics
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-text font-medium">Application Logs</h4>
              <p className="text-sm text-subtext0 mt-1">
                View application logs for troubleshooting and debugging issues.
              </p>
              {logPath && (
                <p className="text-xs text-subtext1 mt-2 font-mono break-all">
                  {logPath}
                </p>
              )}
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={handleOpenLogs}
              isLoading={isOpeningLogs}
            >
              Open Logs Folder
            </Button>
          </div>

          <Divider className="bg-surface1" />

          <div className="bg-blue/20 border border-blue/50 rounded-lg p-3">
            <p className="text-sm text-blue">
              💡 <strong>Safe Mode:</strong> Launch the app with{' '}
              <code className="bg-mantle px-2 py-1 rounded">--safe-mode</code>{' '}
              flag to disable extensions and troubleshoot issues.
            </p>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Testing & Debug</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-text font-medium">Reset Onboarding</h4>
              <p className="text-sm text-subtext0 mt-1">
                Clear the onboarding completion flag to see the first-run wizard
                again. Useful for testing.
              </p>
            </div>
            <Button
              color="warning"
              variant="flat"
              onPress={handleResetOnboarding}
              isLoading={isResetting}
            >
              Reset Onboarding
            </Button>
          </div>

          <div className="bg-yellow/20 border border-yellow/50 rounded-lg p-3">
            <p className="text-sm text-yellow">
              ⚠️ After resetting, you'll need to reload the app or navigate away
              and back to see the onboarding wizard.
            </p>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-xl font-semibold text-text">Application Info</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex justify-between">
            <span className="text-subtext0">Version</span>
            <span className="text-text font-mono">{appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-subtext0">Database</span>
            <span className="text-text">IndexedDB (Dexie)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-subtext0">Theme</span>
            <span className="text-text">Catppuccin Macchiato</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

