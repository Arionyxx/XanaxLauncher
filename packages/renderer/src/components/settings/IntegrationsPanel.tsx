'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { TorBoxProvider } from '@/services/providers/torbox'
import { RealDebridProvider } from '@/services/providers/realdebrid'

type IntegrationStatus = 'not_configured' | 'configured' | 'error' | 'testing'

export function IntegrationsPanel() {
  const { settings, updateSettings } = useSettings()
  const [torboxToken, setTorboxToken] = useState(
    settings.integrations.torboxApiToken || ''
  )
  const [torboxStatus, setTorboxStatus] =
    useState<IntegrationStatus>('not_configured')
  const [torboxMessage, setTorboxMessage] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const [realDebridToken, setRealDebridToken] = useState(
    settings.integrations.realDebridApiToken || ''
  )
  const [realDebridStatus, setRealDebridStatus] =
    useState<IntegrationStatus>('not_configured')
  const [realDebridMessage, setRealDebridMessage] = useState<string>('')

  const getStatusVariant = (
    status: IntegrationStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'configured':
        return 'default'
      case 'error':
        return 'destructive'
      case 'testing':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: IntegrationStatus): string => {
    switch (status) {
      case 'configured':
        return 'Connected'
      case 'error':
        return 'Error'
      case 'testing':
        return 'Testing...'
      default:
        return 'Not Configured'
    }
  }

  const handleTorboxSave = async () => {
    if (!torboxToken.trim()) {
      setTorboxStatus('error')
      setTorboxMessage('API token is required')
      return
    }

    await updateSettings({
      integrations: {
        ...settings.integrations,
        torboxApiToken: torboxToken.trim(),
      },
    })

    setTorboxMessage('API token saved')
    setTorboxStatus('not_configured')
  }

  const handleTorboxTest = async () => {
    if (!torboxToken.trim()) {
      setTorboxStatus('error')
      setTorboxMessage('Please enter an API token')
      return
    }

    setIsTesting(true)
    setTorboxStatus('testing')
    setTorboxMessage('')

    try {
      const provider = new TorBoxProvider({
        apiToken: torboxToken.trim(),
      })

      const result = await provider.testConnection()

      if (result.success) {
        setTorboxStatus('configured')
        setTorboxMessage(
          `Connected successfully${result.user?.email ? ` as ${result.user.email}` : ''}`
        )

        await updateSettings({
          integrations: {
            ...settings.integrations,
            torboxApiToken: torboxToken.trim(),
          },
        })
      } else {
        setTorboxStatus('error')
        setTorboxMessage(result.message || 'Connection failed')
      }
    } catch (error) {
      setTorboxStatus('error')
      setTorboxMessage(
        error instanceof Error ? error.message : 'Connection test failed'
      )
    } finally {
      setIsTesting(false)
    }
  }

  const handleTorboxClear = async () => {
    setTorboxToken('')
    setTorboxStatus('not_configured')
    setTorboxMessage('')

    await updateSettings({
      integrations: {
        ...settings.integrations,
        torboxApiToken: undefined,
      },
    })
  }

  const handleRealDebridSave = async () => {
    if (!realDebridToken.trim()) {
      setRealDebridStatus('error')
      setRealDebridMessage('API token is required')
      return
    }

    await updateSettings({
      integrations: {
        ...settings.integrations,
        realDebridApiToken: realDebridToken.trim(),
      },
    })

    setRealDebridMessage('API token saved')
    setRealDebridStatus('not_configured')
  }

  const handleRealDebridTest = async () => {
    if (!realDebridToken.trim()) {
      setRealDebridStatus('error')
      setRealDebridMessage('Please enter an API token')
      return
    }

    setIsTesting(true)
    setRealDebridStatus('testing')
    setRealDebridMessage('')

    try {
      const provider = new RealDebridProvider({
        apiToken: realDebridToken.trim(),
      })

      const result = await provider.testConnection()

      if (result.success) {
        setRealDebridStatus('configured')
        setRealDebridMessage(
          `Connected successfully${result.user?.username ? ` as ${result.user.username}` : ''}`
        )

        await updateSettings({
          integrations: {
            ...settings.integrations,
            realDebridApiToken: realDebridToken.trim(),
          },
        })
      } else {
        setRealDebridStatus('error')
        setRealDebridMessage(result.message || 'Connection failed')
      }
    } catch (error) {
      setRealDebridStatus('error')
      setRealDebridMessage(
        error instanceof Error ? error.message : 'Connection test failed'
      )
    } finally {
      setIsTesting(false)
    }
  }

  const handleRealDebridClear = async () => {
    setRealDebridToken('')
    setRealDebridStatus('not_configured')
    setRealDebridMessage('')

    await updateSettings({
      integrations: {
        ...settings.integrations,
        realDebridApiToken: undefined,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold">Service Integrations</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect external services to enhance your media management
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📦</div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold">TorBox</h4>
                      <Badge variant={getStatusVariant(torboxStatus)}>
                        {getStatusLabel(torboxStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Premium torrent and usenet cloud service
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="torbox-token">API Token</Label>
                    <Input
                      id="torbox-token"
                      placeholder="Enter your TorBox API token"
                      value={torboxToken}
                      onChange={(e) => setTorboxToken(e.target.value)}
                      type="password"
                      className="font-mono text-xs"
                    />
                  </div>

                  {torboxMessage && (
                    <p
                      className={`text-sm ${
                        torboxStatus === 'configured'
                          ? 'text-green-600'
                          : torboxStatus === 'error'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {torboxMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleTorboxTest}
                      disabled={!torboxToken.trim() || isTesting}
                    >
                      {isTesting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Test Connection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleTorboxSave}
                      disabled={!torboxToken.trim() || isTesting}
                    >
                      Save Token
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleTorboxClear}
                      disabled={!torboxToken.trim() || isTesting}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚡</div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold">Real-Debrid</h4>
                      <Badge variant={getStatusVariant(realDebridStatus)}>
                        {getStatusLabel(realDebridStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unrestricted downloader for premium links
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="realdebrid-token">API Token</Label>
                    <Input
                      id="realdebrid-token"
                      placeholder="Enter your Real-Debrid API token"
                      value={realDebridToken}
                      onChange={(e) => setRealDebridToken(e.target.value)}
                      type="password"
                      className="font-mono text-xs"
                    />
                  </div>

                  {realDebridMessage && (
                    <p
                      className={`text-sm ${
                        realDebridStatus === 'configured'
                          ? 'text-green-600'
                          : realDebridStatus === 'error'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {realDebridMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRealDebridTest}
                      disabled={!realDebridToken.trim() || isTesting}
                    >
                      {isTesting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Test Connection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRealDebridSave}
                      disabled={!realDebridToken.trim() || isTesting}
                    >
                      Save Token
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRealDebridClear}
                      disabled={!realDebridToken.trim() || isTesting}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
