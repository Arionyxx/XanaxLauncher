'use client'

import { Job, JobStatus } from '@/types/provider'
import { Card, CardBody, Progress, Button, Chip } from '@nextui-org/react'

interface JobCardProps {
  job: Job
  onPause?: (jobId: string) => void
  onResume?: (jobId: string) => void
  onCancel?: (jobId: string) => void
  onRetry?: (jobId: string) => void
  onClick?: (job: Job) => void
}

export function JobCard({
  job,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClick,
}: JobCardProps) {
  const statusLabels = {
    [JobStatus.QUEUED]: 'Queued',
    [JobStatus.RESOLVING]: 'Resolving',
    [JobStatus.DOWNLOADING]: 'Downloading',
    [JobStatus.COMPLETED]: 'Completed',
    [JobStatus.FAILED]: 'Failed',
    [JobStatus.CANCELLED]: 'Cancelled',
  }

  const statusChipColors = {
    [JobStatus.QUEUED]: 'default' as const,
    [JobStatus.RESOLVING]: 'secondary' as const,
    [JobStatus.DOWNLOADING]: 'primary' as const,
    [JobStatus.COMPLETED]: 'success' as const,
    [JobStatus.FAILED]: 'danger' as const,
    [JobStatus.CANCELLED]: 'default' as const,
  }

  const progressColors = {
    [JobStatus.QUEUED]: 'default' as const,
    [JobStatus.RESOLVING]: 'secondary' as const,
    [JobStatus.DOWNLOADING]: 'primary' as const,
    [JobStatus.COMPLETED]: 'success' as const,
    [JobStatus.FAILED]: 'danger' as const,
    [JobStatus.CANCELLED]: 'default' as const,
  }

  const getJobTitle = () => {
    if (job.files.length > 0 && job.files[0].name) {
      return job.files[0].name
    }
    if (job.metadata.originalUrl) {
      const url = job.metadata.originalUrl as string
      const parts = url.split('/')
      return parts[parts.length - 1] || url
    }
    return job.id
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  const getTotalSize = () => {
    if (job.files.length === 0) return null
    const total = job.files.reduce((acc, file) => acc + (file.size || 0), 0)
    return total > 0 ? formatSize(total) : null
  }

  const getProviderBadgeColor = () => {
    const colors: Record<string, 'primary' | 'secondary' | 'warning'> = {
      torbox: 'primary',
      'real-debrid': 'secondary',
      mock: 'warning',
    }
    return colors[job.provider.toLowerCase()] || 'default'
  }

  const canPause = job.status === JobStatus.DOWNLOADING
  const canResume = false
  const canCancel =
    job.status === JobStatus.QUEUED ||
    job.status === JobStatus.RESOLVING ||
    job.status === JobStatus.DOWNLOADING
  const canRetry = job.status === JobStatus.FAILED

  return (
    <Card
      isPressable={!!onClick}
      onPress={() => onClick?.(job)}
      className="bg-surface0 border-surface1 hover:border-blue transition-colors"
    >
      <CardBody className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text truncate">
                {getJobTitle()}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  color={getProviderBadgeColor()}
                  variant="flat"
                  className="capitalize"
                >
                  {job.provider}
                </Chip>
                <Chip
                  size="sm"
                  color={statusChipColors[job.status]}
                  variant="flat"
                >
                  {statusLabels[job.status]}
                </Chip>
              </div>
            </div>

            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {canPause && onPause && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="warning"
                  onPress={() => onPause(job.id)}
                  aria-label="Pause"
                >
                  ⏸
                </Button>
              )}
              {canResume && onResume && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => onResume(job.id)}
                  aria-label="Resume"
                >
                  ▶
                </Button>
              )}
              {canRetry && onRetry && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={() => onRetry(job.id)}
                  aria-label="Retry"
                >
                  🔄
                </Button>
              )}
              {canCancel && onCancel && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={() => onCancel(job.id)}
                  aria-label="Cancel"
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {job.status !== JobStatus.FAILED &&
            job.status !== JobStatus.CANCELLED && (
              <div>
                <Progress
                  value={job.progress}
                  color={progressColors[job.status]}
                  size="sm"
                  showValueLabel
                  className="max-w-full"
                />
              </div>
            )}

          <div className="flex items-center justify-between text-sm text-subtext0">
            <div className="flex items-center gap-4">
              {job.files.length > 0 && (
                <span>
                  {job.files.length} file{job.files.length !== 1 ? 's' : ''}
                </span>
              )}
              {getTotalSize() && <span>{getTotalSize()}</span>}
            </div>

            {job.status === JobStatus.FAILED && job.metadata.errorMessage && (
              <span className="text-red text-xs truncate max-w-xs">
                {job.metadata.errorMessage as string}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
