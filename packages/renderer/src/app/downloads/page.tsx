'use client'

import { useEffect, useState, useCallback } from 'react'
import { FiRefreshCw, FiFilter, FiTrash2 } from 'react-icons/fi'
import { Job, JobStatus } from '@/types/provider'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { JobCard } from '@/components/downloads/JobCard'
import { JobDetailDrawer } from '@/components/downloads/JobDetailDrawer'
import { StatsHeader } from '@/components/downloads/StatsHeader'
import { AppLayout } from '@/components/AppLayout'

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

  const handleClearCompleted = useCallback(async () => {
    const completedIds = jobs
      .filter((j) => j.status === JobStatus.COMPLETED)
      .map((j) => j.id)

    for (const id of completedIds) {
      try {
        await jobOrchestrator.deleteJob(id)
      } catch (error) {
        console.error(`Failed to delete job ${id}:`, error)
      }
    }
    await loadJobs()
  }, [jobs, loadJobs])

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
    let filtered = jobs

    if (filter !== 'all') {
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
        filtered = filtered.filter(
          (job) =>
            job.status === JobStatus.FAILED ||
            job.status === JobStatus.CANCELLED
        )
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          (job.payload as any)?.url?.toLowerCase().includes(query) ||
          (job.payload as any)?.magnet?.toLowerCase().includes(query) ||
          job.provider.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => {
      if (sort === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime()
      } else if (sort === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sort === 'progress') {
        return (b.progress || 0) - (a.progress || 0)
      } else if (sort === 'provider') {
        return a.provider.localeCompare(b.provider)
      }
      return 0
    })

    setFilteredJobs(filtered)
  }, [jobs, filter, sort, searchQuery])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Downloads</h1>
            <p className="text-base-content/70 mt-1">
              Manage your active and completed downloads
            </p>
          </div>
          <button
            onClick={loadJobs}
            className="btn btn-circle btn-ghost"
            aria-label="Refresh downloads"
          >
            <FiRefreshCw size={20} />
          </button>
        </div>

        <StatsHeader jobs={jobs} />

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search downloads..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="select select-bordered w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
              >
                <option value="all">All Downloads</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                className="select select-bordered w-full"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="progress">By Progress</option>
                <option value="provider">By Provider</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-base-content/70">
                Showing {filteredJobs.length} of {jobs.length} downloads
              </span>
              {jobs.some((j) => j.status === JobStatus.COMPLETED) && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={handleClearCompleted}
                >
                  <FiTrash2 />
                  Clear Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center py-12">
              <div className="text-6xl mb-4">📥</div>
              <h2 className="card-title text-2xl">No downloads yet</h2>
              <p className="text-base-content/70">
                {searchQuery || filter !== 'all'
                  ? 'No downloads match your search or filter.'
                  : 'Start downloading media from the catalog!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => {
                  setSelectedJob(job)
                  setIsDetailOpen(true)
                }}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}

        {selectedJob && (
          <JobDetailDrawer
            job={selectedJob}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false)
              setSelectedJob(null)
            }}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AppLayout>
  )
}
