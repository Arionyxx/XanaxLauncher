import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { TorBoxProvider } from '@/services/providers/torbox/torbox-provider'

interface ProvidersStepProps {
  onNext: (data: { torboxToken?: string; realDebridToken?: string }) => void
  onBack: () => void
  initialTorboxToken?: string
  initialRealDebridToken?: string
}

export function ProvidersStep({
  onNext,
  onBack,
  initialTorboxToken,
  initialRealDebridToken,
}: ProvidersStepProps) {
  const [torboxToken, setTorboxToken] = useState(initialTorboxToken || '')
  const [realDebridToken, setRealDebridToken] = useState(
    initialRealDebridToken || ''
  )
  const [isTesting, setIsTesting] = useState(false)

  const handleTestTorBox = async () => {
    if (!torboxToken.trim()) {
      toast({
        title: 'Token Required',
        description: 'Please enter a TorBox API token',
        variant: 'destructive',
      })
      return
    }

    setIsTesting(true)
    try {
      const provider = new TorBoxProvider({ apiToken: torboxToken.trim() })
      const result = await provider.testConnection()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'TorBox connection successful!',
        })
      } else {
        toast({
          title: 'Test Failed',
          description: `TorBox test failed: ${result.message || 'Unknown error'}`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test TorBox connection',
        variant: 'destructive',
      })
      console.error('TorBox test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestRealDebrid = async () => {
    if (!realDebridToken.trim()) {
      toast({
        title: 'Token Required',
        description: 'Please enter a Real-Debrid API token',
        variant: 'destructive',
      })
      return
    }

    setIsTesting(true)
    try {
      toast({
        description: 'Real-Debrid provider not yet implemented',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test Real-Debrid connection',
        variant: 'destructive',
      })
      console.error('Real-Debrid test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleContinue = () => {
    onNext({
      torboxToken: torboxToken.trim() || undefined,
      realDebridToken: realDebridToken.trim() || undefined,
    })
  }

  const handleSkip = () => {
    onNext({ torboxToken: undefined, realDebridToken: undefined })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-text">Configure Providers</h2>
        <p className="text-subtext0">
          Connect to download providers for faster content delivery
        </p>
        <span className="inline-block bg-yellow/20 text-yellow px-3 py-1 rounded-full text-sm">
          Optional - You can configure these later in Settings
        </span>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">TorBox</h3>
                <p className="text-sm text-muted-foreground">
                  Premium torrent and usenet service
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="torbox-token">API Token</Label>
              <Input
                id="torbox-token"
                type="password"
                placeholder="Enter your TorBox API token"
                value={torboxToken}
                onChange={(e) => setTorboxToken(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleTestTorBox}
              disabled={isTesting || !torboxToken.trim()}
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Real-Debrid</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-hoster unrestricted downloader
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="realdebrid-token">API Token</Label>
              <Input
                id="realdebrid-token"
                type="password"
                placeholder="Enter your Real-Debrid API token"
                value={realDebridToken}
                onChange={(e) => setRealDebridToken(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleTestRealDebrid}
              disabled={isTesting || !realDebridToken.trim()}
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        <div className="bg-blue/20 border border-blue/50 rounded-lg p-3">
          <p className="text-sm text-blue">
            💡 You&apos;ll need an active subscription with these services. Visit
            their websites to sign up and get your API tokens.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </motion.div>
  )
}
