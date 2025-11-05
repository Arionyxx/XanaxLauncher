'use client'

import { Job, JobStatus } from '@/types/provider'
import { X, RefreshCw, Play, Square, CheckCircle, XCircle, Clock, HardDrive, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  onCancel?: (jobId: string) => void
  onRetry?: (jobId: string) => void
  onClick?: (job: Job) => void
}

export function JobCard({
  job,
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

  const statusBadgeVariant = {
    [JobStatus.QUEUED]: 'secondary' as const,
    [JobStatus.RESOLVING]: 'default' as const,
    [JobStatus.DOWNLOADING]: 'default' as const,
    [JobStatus.COMPLETED]: 'default' as const,
    [JobStatus.FAILED]: 'destructive' as const,
    [JobStatus.CANCELLED]: 'outline' as const,
  }

  const statusIcon = {
    [JobStatus.QUEUED]: <Clock className="w-3 h-3" />,
    [JobStatus.RESOLVING]: <RefreshCw className="w-3 h-3 animate-spin" />,
    [JobStatus.DOWNLOADING]: <Play className="w-3 h-3" />,
    [JobStatus.COMPLETED]: <CheckCircle className="w-3 h-3" />,
    [JobStatus.FAILED]: <XCircle className="w-3 h-3" />,
    [JobStatus.CANCELLED]: <Square className="w-3 h-3" />,
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

  const canCancel =
    job.status === JobStatus.QUEUED ||
    job.status === JobStatus.RESOLVING ||
    job.status === JobStatus.DOWNLOADING
  const canRetry = job.status === JobStatus.FAILED

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md hover:shadow-primary/10",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(job)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Badge 
                  variant={statusBadgeVariant[job.status]} 
                  className="flex items-center gap-1"
                >
                  {statusIcon[job.status]}
                  {statusLabels[job.status]}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {getJobTitle()}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {job.provider.toUpperCase()}
                  </Badge>
                  {getTotalSize() && (
                    <Badge variant="outline" className="text-xs">
                      <HardDrive className="w-3 h-3 mr-1" />
                      {getTotalSize()}
                    </Badge>
                  )}
                  {job.files.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {job.files.length} file{job.files.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel(job.id)
                }}
                aria-label="Cancel download"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {canRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRetry(job.id)
                }}
                aria-label="Retry download"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {job.status === JobStatus.DOWNLOADING && job.progress !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{Math.round(job.progress)}%</span>
            </div>
            <Progress 
              value={job.progress} 
              className="h-2"
            />
          </div>
        )}

        {job.status === JobStatus.FAILED && job.metadata.errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{job.metadata.errorMessage}</p>
            </div>
          </div>
        )}

        {job.status === JobStatus.COMPLETED && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Download completed successfully</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}