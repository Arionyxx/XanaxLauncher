import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AccountPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold">Account Status</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account and sync settings across devices
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold">Not Signed In</span>
                <Badge variant="secondary">Local Only</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in to sync your settings and preferences
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="secondary" disabled className="w-full">
              Sign In with Email
            </Button>
            <Button variant="outline" disabled className="w-full">
              Sign In with Google
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Features</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">☁️</span>
              <div>
                <p className="text-sm font-semibold">Cloud Sync</p>
                <p className="text-xs text-muted-foreground">
                  Sync your settings across multiple devices
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="text-sm font-semibold">Backup & Restore</p>
                <p className="text-xs text-muted-foreground">
                  Never lose your configuration and preferences
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔐</span>
              <div>
                <p className="text-sm font-semibold">Secure Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted and secured
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              💡 Account features coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Authentication will be available in a future update
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
