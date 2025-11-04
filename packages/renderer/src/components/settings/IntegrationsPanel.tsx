import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react'

interface Integration {
  id: string
  name: string
  description: string
  status: 'not_configured' | 'configured' | 'error'
  icon: string
}

const integrations: Integration[] = [
  {
    id: 'torbox',
    name: 'TorBox',
    description: 'Premium torrent and usenet cloud service',
    status: 'not_configured',
    icon: '📦',
  },
  {
    id: 'real-debrid',
    name: 'Real-Debrid',
    description: 'Unrestricted downloader for premium links',
    status: 'not_configured',
    icon: '⚡',
  },
]

export function IntegrationsPanel() {
  const getStatusColor = (
    status: Integration['status']
  ): 'default' | 'success' | 'danger' => {
    switch (status) {
      case 'configured':
        return 'success'
      case 'error':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: Integration['status']): string => {
    switch (status) {
      case 'configured':
        return 'Connected'
      case 'error':
        return 'Error'
      default:
        return 'Not Configured'
    }
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
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="bg-surface1 border-surface2"
              shadow="none"
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{integration.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-text">
                        {integration.name}
                      </h4>
                      <Chip
                        size="sm"
                        color={getStatusColor(integration.status)}
                        variant="flat"
                      >
                        {getStatusLabel(integration.status)}
                      </Chip>
                    </div>
                    <p className="text-sm text-subtext0 mb-3">
                      {integration.description}
                    </p>
                    <Button size="sm" color="primary" variant="flat" isDisabled>
                      Configure
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardBody>
          <div className="text-center py-4">
            <p className="text-sm text-subtext0">
              💡 Integration configuration coming soon
            </p>
            <p className="text-xs text-subtext0 mt-2">
              These features will be available in a future update
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
