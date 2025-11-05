'use client'

import { Job, JobStatus } from '@/types/provider'

interface StatsHeaderProps {
  jobs: Job[]
}

export function StatsHeader({ jobs }: StatsHeaderProps) {
  const totalCount = jobs.length
  const activeCount = jobs.filter(
    (job) =>
      job.status === JobStatus.QUEUED ||
      job.status === JobStatus.RESOLVING ||
      job.status === JobStatus.DOWNLOADING
  ).length
  const completedCount = jobs.filter(
    (job) => job.status === JobStatus.COMPLETED
  ).length
  const failedCount = jobs.filter(
    (job) => job.status === JobStatus.FAILED
  ).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-4xl">📦</div>
          <div className="stat-title">Total Downloads</div>
          <div className="stat-value">{totalCount}</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-4xl">⬇️</div>
          <div className="stat-title">Active</div>
          <div className="stat-value text-primary">{activeCount}</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-4xl">✅</div>
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">{completedCount}</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-4xl">❌</div>
          <div className="stat-title">Failed</div>
          <div className="stat-value text-error">{failedCount}</div>
        </div>
      </div>
    </div>
  )
}
