import { Card, CardBody, Button } from '@nextui-org/react'
import { useRouter } from 'next/navigation'

interface EmptyStateProps {
  type: 'no-sources' | 'no-games' | 'no-results'
  onRefresh?: () => void
}

export function EmptyState({ type, onRefresh }: EmptyStateProps) {
  const router = useRouter()

  const content = {
    'no-sources': {
      icon: '📚',
      title: 'No sources configured',
      message:
        'Get started by adding game sources in Settings. Sources provide the catalog of games you can browse and download.',
      action: 'Go to Settings',
      onAction: () => router.push('/settings'),
    },
    'no-games': {
      icon: '🎮',
      title: 'No games available',
      message:
        'Your sources are configured but haven\'t been synced yet. Sync your sources to see available games.',
      action: 'Refresh',
      onAction: onRefresh,
    },
    'no-results': {
      icon: '🔍',
      title: 'No games found',
      message:
        'Try adjusting your search or filter criteria to find what you\'re looking for.',
      action: 'Clear Filters',
      onAction: onRefresh,
    },
  }

  const { icon, title, message, action, onAction } = content[type]

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="bg-surface0 border-surface1 max-w-md">
        <CardBody className="p-8 text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
          <p className="text-subtext0 mb-6">{message}</p>
          {action && onAction && (
            <Button color="primary" onPress={onAction}>
              {action}
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
