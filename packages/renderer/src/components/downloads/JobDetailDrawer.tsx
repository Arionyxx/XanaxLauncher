'use client'

import { Job, JobStatus } from '@/types/provider'
import { FiX } from 'react-icons/fi'

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
  if (!isOpen) return null

  const statusLabels = {
    [JobStatus.QUEUED]: 'Queued',
    [JobStatus.RESOLVING]: 'Resolving',
    [JobStatus.DOWNLOADING]: 'Downloading',
    [JobStatus.COMPLETED]: 'Completed',
    [JobStatus.FAILED]: 'Failed',
    [JobStatus.CANCELLED]: 'Cancelled',
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString()
  }

  return (
    <div className="drawer drawer-end z-50">
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="drawer-side">
        <label className="drawer-overlay" onClick={onClose}></label>
        <div className="menu p-6 w-96 min-h-full bg-base-200 text-base-content">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Download Details</h2>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                Status
              </h3>
              <div className="badge badge-lg">{statusLabels[job.status]}</div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                Provider
              </h3>
              <p className="text-base">{job.provider.toUpperCase()}</p>
            </div>

            {job.progress !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                  Progress
                </h3>
                <div className="flex items-center gap-2">
                  <progress
                    className="progress progress-primary w-full"
                    value={job.progress}
                    max="100"
                  ></progress>
                  <span className="text-sm">{Math.round(job.progress)}%</span>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                Created
              </h3>
              <p className="text-sm">{formatDate(job.createdAt)}</p>
            </div>

            {job.updatedAt && (
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                  Updated
                </h3>
                <p className="text-sm">{formatDate(job.updatedAt)}</p>
              </div>
            )}

            {job.files.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 mb-2">
                  Files ({job.files.length})
                </h3>
                <div className="space-y-2">
                  {job.files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-base-300 p-3 rounded-lg text-sm"
                    >
                      <div className="font-semibold truncate">{file.name}</div>
                      {file.size && (
                        <div className="text-xs text-base-content/60 mt-1">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.error && (
              <div>
                <h3 className="text-sm font-semibold text-base-content/70 mb-1">
                  Error
                </h3>
                <div className="alert alert-error">
                  <span className="text-sm">{job.error}</span>
                </div>
              </div>
            )}

            {onCancel &&
              (job.status === JobStatus.QUEUED ||
                job.status === JobStatus.RESOLVING ||
                job.status === JobStatus.DOWNLOADING) && (
                <button
                  className="btn btn-error btn-block"
                  onClick={() => {
                    onCancel(job.id)
                    onClose()
                  }}
                >
                  Cancel Download
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
