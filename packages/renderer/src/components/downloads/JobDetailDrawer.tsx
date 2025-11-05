'use client'

import { Job, JobStatus } from '@/types/provider'
import { Calendar, Clock, FileText, AlertTriangle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

interface JobDetailDrawerProps {
  job: Job
  isOpen: boolean
  onClose: () => void
  onCancel?: (jobId: string) => void
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onCancel,
}: JobDetailDrawerProps) {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
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

  const canCancel =
    job.status === JobStatus.QUEUED ||
    job.status === JobStatus.RESOLVING ||
    job.status === JobStatus.DOWNLOADING

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-lg overflow-hidden">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>Download Details</SheetTitle>
            <SheetDescription>
              View detailed information about this download job
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={statusBadgeVariant[job.status]} className="text-sm">
                  {statusLabels[job.status]}
                </Badge>
              </CardContent>
            </Card>

            {/* Provider */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm">{job.provider.toUpperCase()}</p>
              </CardContent>
            </Card>

            {/* Progress */}
            {job.progress !== undefined && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={job.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Downloaded</span>
                    <span className="font-medium">{Math.round(job.progress)}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(job.createdAt)}</p>
                  </div>
                </div>
                {job.updatedAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="text-sm">{formatDate(job.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files */}
            {job.files.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Files ({job.files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {job.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      {file.size && (
                        <span className="text-xs text-muted-foreground">
                          {formatSize(file.size)}
                        </span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {job.metadata.errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Error Details</p>
                    <p className="text-sm">{job.metadata.errorMessage}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            {canCancel && onCancel && (
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    onCancel(job.id)
                    onClose()
                  }}
                >
                  Cancel Download
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}