import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Source } from '@/db/schema'

interface SourceListItemProps {
  source: Source
  onSync: (id: string) => Promise<void>
  onEdit: (source: Source) => void
  onRemove: (id: string) => void
}

function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) return 'Never'

  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  return 'Just now'
}

function getStatusVariant(
  status: Source['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'synced':
      return 'default'
    case 'error':
      return 'destructive'
    case 'syncing':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: Source['status']): string {
  switch (status) {
    case 'synced':
      return 'Synced'
    case 'error':
      return 'Error'
    case 'syncing':
      return 'Syncing...'
    default:
      return 'Never Synced'
  }
}

export function SourceListItem({
  source,
  onSync,
  onEdit,
  onRemove,
}: SourceListItemProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await onSync(source.id)
    } catch (error) {
      console.error('Failed to sync source:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold truncate">
                {source.name}
              </h4>
              <Badge variant={getStatusVariant(source.status)}>
                {getStatusLabel(source.status)}
              </Badge>
              {source.autoSync && (
                <Badge variant="secondary" className="bg-primary/20">
                  Auto-sync
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {source.url}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing || source.status === 'syncing'}
            >
              {isSyncing || source.status === 'syncing' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span className="mr-2">🔄</span>
              )}
              Sync
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(source)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(source.id)}
            >
              Remove
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Last sync:</span>{' '}
            {formatTimestamp(source.lastSyncAt)}
          </div>
          <div>
            <span className="font-medium">Entries:</span>{' '}
            <span className="font-semibold">{source.entryCount}</span>
          </div>
        </div>

        {source.status === 'error' && source.errorMessage && (
          <div className="space-y-1">
            <button
              onClick={() => setShowError(!showError)}
              className="text-xs text-destructive hover:underline focus:outline-none"
            >
              {showError ? '▼' : '▶'} Error details
            </button>
            {showError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-2 text-xs text-destructive">
                {source.errorMessage}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
