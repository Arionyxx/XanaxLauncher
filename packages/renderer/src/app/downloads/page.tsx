'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Trash2, Download, Search } from 'lucide-react'
import { Job, JobStatus } from '@/types/provider'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { JobCard } from '@/components/downloads/JobCard'
import { JobDetailDrawer } from '@/components/downloads/JobDetailDrawer'
import { StatsHeader } from '@/components/downloads/StatsHeader'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
          job.metadata.originalUrl?.toLowerCase().includes(query) ||
          job.provider.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => {
      if (sort === 'newest') {
        return b.createdAt - a.createdAt
      } else if (sort === 'oldest') {
        return a.createdAt - b.createdAt
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
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle>Loading Downloads</CardTitle>
              <CardDescription>
                Fetching your download history...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Downloads</h1>
              <p className="text-muted-foreground">
                Manage your active and completed downloads
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadJobs}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatsHeader jobs={jobs} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search downloads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Downloads</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as SortType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="progress">By Progress</SelectItem>
                    <SelectItem value="provider">By Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>
                    Showing {filteredJobs.length} of {jobs.length} downloads
                  </span>
                </div>
                {jobs.some((j) => j.status === JobStatus.COMPLETED) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCompleted}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Downloads List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                    <Download className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No downloads found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filter !== 'all'
                        ? 'No downloads match your search or filter.'
                        : 'Start downloading media from the catalog!'}
                    </p>
                  </div>
                  {searchQuery || filter !== 'all' ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setFilter('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => (window.location.href = '/')}>
                      Browse Catalog
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
        </motion.div>

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
