import { useState } from 'react'
import { Card, CardHeader, CardBody, Button } from '@nextui-org/react'
import { toast } from 'sonner'
import { useOnboarding } from '@/hooks/useOnboarding'

export function AdvancedPanel() {
  const { resetOnboarding } = useOnboarding()
  const [isResetting, setIsResetting] = useState(false)

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
      toast.success('Onboarding reset successfully. Reload the app to see the wizard.')
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
      toast.error('Failed to reset onboarding')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
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
            <span className="text-text font-mono">0.1.0</span>
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
