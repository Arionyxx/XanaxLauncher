'use client'

import { Job, JobStatus } from '@/types/provider'
import { FiX, FiRefreshCw, FiPlay, FiPause } from 'react-icons/fi'

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

  const statusBadgeClass = {
    [JobStatus.QUEUED]: 'badge-neutral',
    [JobStatus.RESOLVING]: 'badge-info',
    [JobStatus.DOWNLOADING]: 'badge-primary',
    [JobStatus.COMPLETED]: 'badge-success',
    [JobStatus.FAILED]: 'badge-error',
    [JobStatus.CANCELLED]: 'badge-ghost',
  }

  const progressBarClass = {
    [JobStatus.QUEUED]: 'progress-neutral',
    [JobStatus.RESOLVING]: 'progress-info',
    [JobStatus.DOWNLOADING]: 'progress-primary',
    [JobStatus.COMPLETED]: 'progress-success',
    [JobStatus.FAILED]: 'progress-error',
    [JobStatus.CANCELLED]: 'progress-ghost',
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
    <div
      className={`card bg-base-200 shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
      onClick={() => onClick?.(job)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="card-title text-base truncate">{getJobTitle()}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className={`badge badge-sm ${statusBadgeClass[job.status]}`}>
                {statusLabels[job.status]}
              </div>
              <div className="badge badge-sm badge-outline">
                {job.provider.toUpperCase()}
              </div>
              {getTotalSize() && (
                <div className="badge badge-sm badge-ghost">{getTotalSize()}</div>
              )}
              {job.files.length > 0 && (
                <div className="badge badge-sm badge-ghost">
                  {job.files.length} file{job.files.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {canCancel && onCancel && (
              <button
                className="btn btn-sm btn-ghost btn-circle"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel(job.id)
                }}
                aria-label="Cancel download"
              >
                <FiX />
              </button>
            )}
            {canRetry && onRetry && (
              <button
                className="btn btn-sm btn-ghost btn-circle"
                onClick={(e) => {
                  e.stopPropagation()
                  onRetry(job.id)
                }}
                aria-label="Retry download"
              >
                <FiRefreshCw />
              </button>
            )}
          </div>
        </div>

        {job.status === JobStatus.DOWNLOADING && job.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-base-content/70 mb-1">
              <span>Progress</span>
              <span>{Math.round(job.progress)}%</span>
            </div>
            <progress
              className={`progress ${progressBarClass[job.status]} w-full`}
              value={job.progress}
              max="100"
            ></progress>
          </div>
        )}

        {job.status === JobStatus.FAILED && job.error && (
          <div className="alert alert-error mt-2">
            <span className="text-sm">{job.error}</span>
          </div>
        )}

        {job.status === JobStatus.COMPLETED && (
          <div className="mt-2">
            <div className="text-sm text-success">
              ✓ Download completed successfully
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
