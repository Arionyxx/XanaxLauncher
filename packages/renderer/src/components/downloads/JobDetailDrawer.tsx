'use client'

import { Job, JobStatus, JobFile } from '@/types/provider'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from '@nextui-org/react'
import { useState } from 'react'

interface JobDetailDrawerProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onGetLinks?: (jobId: string) => Promise<void>
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onGetLinks,
}: JobDetailDrawerProps) {
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null)

  if (!job) return null

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleCopyLink = async (file: JobFile) => {
    if (file.url) {
      await navigator.clipboard.writeText(file.url)
      setCopiedFileId(file.id)
      setTimeout(() => setCopiedFileId(null), 2000)
    }
  }

  const handleGetLinks = async () => {
    if (!onGetLinks) return
    setIsLoadingLinks(true)
    try {
      await onGetLinks(job.id)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  const hasFileLinks = job.files.some((file) => file.url)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-surface0',
        header: 'border-b border-surface1',
        body: 'py-6',
        footer: 'border-t border-surface1',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-text">Job Details</h2>
              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  color={statusChipColors[job.status]}
                  variant="flat"
                >
                  {statusLabels[job.status]}
                </Chip>
                <Chip size="sm" variant="flat" className="capitalize">
                  {job.provider}
                </Chip>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-subtext1 mb-2">
                    General Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-subtext0">Job ID:</span>
                      <span className="text-text font-mono text-xs">
                        {job.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtext0">Progress:</span>
                      <span className="text-text">{job.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtext0">Created:</span>
                      <span className="text-text">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtext0">Updated:</span>
                      <span className="text-text">
                        {formatDate(job.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {job.metadata.originalUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-subtext1 mb-2">
                      Source URL
                    </h3>
                    <div className="bg-surface1 p-3 rounded-lg">
                      <p className="text-xs text-text break-all font-mono">
                        {job.metadata.originalUrl as string}
                      </p>
                    </div>
                  </div>
                )}

                {job.status === JobStatus.FAILED &&
                  job.metadata.errorMessage && (
                    <div>
                      <h3 className="text-sm font-semibold text-red mb-2">
                        Error Message
                      </h3>
                      <div className="bg-red/10 border border-red/20 p-3 rounded-lg">
                        <p className="text-sm text-red">
                          {job.metadata.errorMessage as string}
                        </p>
                      </div>
                    </div>
                  )}

                <Divider className="bg-surface1" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-subtext1">
                      Files ({job.files.length})
                    </h3>
                    {job.status === JobStatus.COMPLETED &&
                      !hasFileLinks &&
                      onGetLinks && (
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={handleGetLinks}
                          isLoading={isLoadingLinks}
                        >
                          Get Download Links
                        </Button>
                      )}
                  </div>

                  {job.files.length === 0 ? (
                    <div className="bg-surface1 p-4 rounded-lg text-center">
                      <p className="text-sm text-subtext0">
                        No files available yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {job.files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-surface1 p-3 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text truncate">
                                {file.name}
                              </p>
                              {file.size > 0 && (
                                <p className="text-xs text-subtext0 mt-1">
                                  {formatSize(file.size)}
                                </p>
                              )}
                              {file.url && (
                                <p className="text-xs text-blue mt-1 break-all font-mono">
                                  {file.url}
                                </p>
                              )}
                            </div>
                            {file.url && (
                              <Button
                                size="sm"
                                variant="flat"
                                color={
                                  copiedFileId === file.id
                                    ? 'success'
                                    : 'default'
                                }
                                onPress={() => handleCopyLink(file)}
                              >
                                {copiedFileId === file.id ? '✓ Copied' : '📋'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {Object.keys(job.metadata).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-subtext1 mb-2">
                      Metadata
                    </h3>
                    <div className="bg-surface1 p-3 rounded-lg">
                      <pre className="text-xs text-text overflow-x-auto">
                        {JSON.stringify(job.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
