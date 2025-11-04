'use client'

import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Spinner,
} from '@nextui-org/react'
import { useSettings } from '@/hooks/useSettings'
import { TorBoxProvider } from '@/services/providers/torbox'

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

  const getStatusColor = (
    status: IntegrationStatus
  ): 'default' | 'success' | 'danger' | 'warning' => {
    switch (status) {
      case 'configured':
        return 'success'
      case 'error':
        return 'danger'
      case 'testing':
        return 'warning'
      default:
        return 'default'
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

  return (
    <div className="space-y-6">
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold text-text">
              Service Integrations
            </h3>
            <p className="text-sm text-subtext0 mt-1">
              Connect external services to enhance your media management
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Card className="bg-surface1 border-surface2" shadow="none">
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="text-4xl">📦</div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-text">
                        TorBox
                      </h4>
                      <Chip
                        size="sm"
                        color={getStatusColor(torboxStatus)}
                        variant="flat"
                      >
                        {getStatusLabel(torboxStatus)}
                      </Chip>
                    </div>
                    <p className="text-sm text-subtext0 mb-3">
                      Premium torrent and usenet cloud service
                    </p>
                  </div>

                  <Input
                    label="API Token"
                    placeholder="Enter your TorBox API token"
                    value={torboxToken}
                    onValueChange={setTorboxToken}
                    type="password"
                    size="sm"
                    classNames={{
                      input: 'font-mono text-xs',
                    }}
                  />

                  {torboxMessage && (
                    <p
                      className={`text-sm ${
                        torboxStatus === 'configured'
                          ? 'text-green'
                          : torboxStatus === 'error'
                            ? 'text-red'
                            : 'text-subtext0'
                      }`}
                    >
                      {torboxMessage}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={handleTorboxTest}
                      isDisabled={!torboxToken.trim() || isTesting}
                      startContent={isTesting ? <Spinner size="sm" /> : null}
                    >
                      Test Connection
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      onPress={handleTorboxSave}
                      isDisabled={!torboxToken.trim() || isTesting}
                    >
                      Save Token
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={handleTorboxClear}
                      isDisabled={!torboxToken.trim() || isTesting}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-surface1 border-surface2" shadow="none">
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚡</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-text">
                      Real-Debrid
                    </h4>
                    <Chip size="sm" color="default" variant="flat">
                      Coming Soon
                    </Chip>
                  </div>
                  <p className="text-sm text-subtext0 mb-3">
                    Unrestricted downloader for premium links
                  </p>
                  <Button size="sm" color="primary" variant="flat" isDisabled>
                    Configure
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </CardBody>
      </Card>
    </div>
  )
}
