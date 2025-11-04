'use client'

import { useEffect, useState, useCallback } from 'react'
import { Job, JobStatus } from '@/types/provider'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { JobCard } from '@/components/downloads/JobCard'
import { JobDetailDrawer } from '@/components/downloads/JobDetailDrawer'
import { StatsHeader } from '@/components/downloads/StatsHeader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react'

type FilterType = 'all' | 'active' | 'completed' | 'failed'
type SortType = 'newest' | 'oldest' | 'progress' | 'provider'

export default function DownloadsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const {
    isOpen: isCancelAllOpen,
    onOpen: onCancelAllOpen,
    onClose: onCancelAllClose,
  } = useDisclosure()

  const loadJobs = useCallback(async () => {
    try {
      const allJobs = await jobOrchestrator.getAllJobs()
      setJobs(allJobs)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const syncActiveJobs = useCallback(async () => {
    try {
      const activeJobs = jobs.filter(
        (job) =>
          job.status === JobStatus.QUEUED ||
          job.status === JobStatus.RESOLVING ||
          job.status === JobStatus.DOWNLOADING
      )

      for (const job of activeJobs) {
        try {
          await jobOrchestrator.syncJobStatus(job.id)
        } catch (error) {
          console.error(`Failed to sync job ${job.id}:`, error)
        }
      }

      await loadJobs()
    } catch (error) {
      console.error('Failed to sync jobs:', error)
    }
  }, [jobs, loadJobs])

  const handleCancel = useCallback(
    async (jobId: string) => {
      try {
        await jobOrchestrator.cancelJob(jobId)
        await loadJobs()
      } catch (error) {
        console.error('Failed to cancel job:', error)
      }
    },
    [loadJobs]
  )

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  useEffect(() => {
    const interval = setInterval(() => {
      syncActiveJobs()
    }, 3000)

    return () => clearInterval(interval)
  }, [syncActiveJobs])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailOpen) {
        setIsDetailOpen(false)
      }
      if (e.key === 'Delete' && selectedJob) {
        handleCancel(selectedJob.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDetailOpen, selectedJob, handleCancel])

  useEffect(() => {
    let filtered = [...jobs]

    if (filter === 'active') {
      filtered = filtered.filter(
        (job) =>
          job.status === JobStatus.QUEUED ||
          job.status === JobStatus.RESOLVING ||
          job.status === JobStatus.DOWNLOADING
      )
    } else if (filter === 'completed') {
      filtered = filtered.filter((job) => job.status === JobStatus.COMPLETED)
    } else if (filter === 'failed') {
      filtered = filtered.filter((job) => job.status === JobStatus.FAILED)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((job) => {
        const title = job.files[0]?.name || job.metadata.originalUrl || job.id
        return title.toLowerCase().includes(query)
      })
    }

    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.createdAt - a.createdAt
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'progress':
          return b.progress - a.progress
        case 'provider':
          return a.provider.localeCompare(b.provider)
        default:
          return 0
      }
    })

    setFilteredJobs(filtered)
  }, [jobs, filter, sort, searchQuery])

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsDetailOpen(true)
  }

  const handleRetry = async (jobId: string) => {
    console.log('Retry not implemented yet:', jobId)
  }

  const handleClearCompleted = async () => {
    try {
      await jobOrchestrator.clearCompletedJobs()
      await loadJobs()
    } catch (error) {
      console.error('Failed to clear completed jobs:', error)
    }
  }

  const handleCancelAll = async () => {
    try {
      const activeJobs = jobs.filter(
        (job) =>
          job.status === JobStatus.QUEUED ||
          job.status === JobStatus.RESOLVING ||
          job.status === JobStatus.DOWNLOADING
      )

      for (const job of activeJobs) {
        try {
          await jobOrchestrator.cancelJob(job.id)
        } catch (error) {
          console.error(`Failed to cancel job ${job.id}:`, error)
        }
      }

      await loadJobs()
      onCancelAllClose()
    } catch (error) {
      console.error('Failed to cancel all jobs:', error)
    }
  }

  const handleGetLinks = async (jobId: string) => {
    try {
      await jobOrchestrator.getFileLinks(jobId)
      await loadJobs()
      const updatedJob = await jobOrchestrator.getJob(jobId)
      if (updatedJob) {
        setSelectedJob(updatedJob)
      }
    } catch (error) {
      console.error('Failed to get file links:', error)
    }
  }

  const hasCompletedJobs = jobs.some(
    (job) => job.status === JobStatus.COMPLETED
  )
  const hasActiveJobs = jobs.some(
    (job) =>
      job.status === JobStatus.QUEUED ||
      job.status === JobStatus.RESOLVING ||
      job.status === JobStatus.DOWNLOADING
  )

  return (
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Downloads</h1>
          <p className="text-subtext0">
            Monitor your active and completed downloads
          </p>
        </div>

        <StatsHeader jobs={jobs} />

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <Input
              placeholder="Search downloads..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="w-full sm:w-64"
              classNames={{
                input: 'bg-surface0',
                inputWrapper: 'bg-surface0 border-surface1',
              }}
              startContent={<span>🔍</span>}
            />

            <Select
              label="Filter"
              selectedKeys={[filter]}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="w-full sm:w-40"
              classNames={{
                trigger: 'bg-surface0 border-surface1',
              }}
            >
              <SelectItem key="all" value="all">
                All
              </SelectItem>
              <SelectItem key="active" value="active">
                Active
              </SelectItem>
              <SelectItem key="completed" value="completed">
                Completed
              </SelectItem>
              <SelectItem key="failed" value="failed">
                Failed
              </SelectItem>
            </Select>

            <Select
              label="Sort by"
              selectedKeys={[sort]}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="w-full sm:w-40"
              classNames={{
                trigger: 'bg-surface0 border-surface1',
              }}
            >
              <SelectItem key="newest" value="newest">
                Newest
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Oldest
              </SelectItem>
              <SelectItem key="progress" value="progress">
                Progress
              </SelectItem>
              <SelectItem key="provider" value="provider">
                Provider
              </SelectItem>
            </Select>
          </div>

          <div className="flex gap-2">
            {hasCompletedJobs && (
              <Tooltip content="Remove completed downloads from the list">
                <Button
                  color="warning"
                  variant="flat"
                  onPress={handleClearCompleted}
                >
                  Clear Completed
                </Button>
              </Tooltip>
            )}
            {hasActiveJobs && (
              <Tooltip content="Cancel all active downloads">
                <Button color="danger" variant="flat" onPress={onCancelAllOpen}>
                  Cancel All
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading downloads..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-text mb-2">
                {searchQuery || filter !== 'all'
                  ? 'No downloads found'
                  : 'No downloads yet'}
              </h3>
              <p className="text-subtext0">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Start adding downloads to see them here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onCancel={handleCancel}
                onRetry={handleRetry}
                onClick={handleJobClick}
              />
            ))}
          </div>
        )}
      </div>

      <JobDetailDrawer
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onGetLinks={handleGetLinks}
      />

      <Modal
        isOpen={isCancelAllOpen}
        onClose={onCancelAllClose}
        classNames={{
          base: 'bg-surface0',
          header: 'border-b border-surface1',
          footer: 'border-t border-surface1',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold text-text">Cancel All Jobs</h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-text">
                  Are you sure you want to cancel all active downloads? This
                  action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  No, Keep Downloads
                </Button>
                <Button color="danger" onPress={handleCancelAll}>
                  Yes, Cancel All
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
