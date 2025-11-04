import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react'

export function AccountPanel() {
  return (
    <div className="space-y-6">
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold text-text">Account Status</h3>
            <p className="text-sm text-subtext0 mt-1">
              Manage your account and sync settings across devices
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-text">
                  Not Signed In
                </span>
                <Chip size="sm" color="default" variant="flat">
                  Local Only
                </Chip>
              </div>
              <p className="text-sm text-subtext0">
                Sign in to sync your settings and preferences
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button color="primary" variant="flat" isDisabled fullWidth>
              Sign In with Email
            </Button>
            <Button color="default" variant="flat" isDisabled fullWidth>
              Sign In with Google
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-text">Features</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">☁️</span>
              <div>
                <p className="text-sm font-semibold text-text">Cloud Sync</p>
                <p className="text-xs text-subtext0">
                  Sync your settings across multiple devices
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="text-sm font-semibold text-text">
                  Backup & Restore
                </p>
                <p className="text-xs text-subtext0">
                  Never lose your configuration and preferences
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="text-sm font-semibold text-text">
                  Secure Authentication
                </p>
                <p className="text-xs text-subtext0">
                  Your data is encrypted and secured
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardBody>
          <div className="text-center py-4">
            <p className="text-sm text-subtext0">
              💡 Account features coming soon
            </p>
            <p className="text-xs text-subtext0 mt-2">
              Authentication will be available in a future update
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
