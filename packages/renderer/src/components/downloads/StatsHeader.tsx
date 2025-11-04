'use client'

import { Job, JobStatus } from '@/types/provider'
import { Card, CardBody } from '@nextui-org/react'

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
      <Card className="bg-surface0 border-surface1">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-subtext0">Total Downloads</p>
              <p className="text-2xl font-bold text-text mt-1">{totalCount}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-subtext0">Active</p>
              <p className="text-2xl font-bold text-blue mt-1">{activeCount}</p>
            </div>
            <div className="text-3xl">⬇️</div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-subtext0">Completed</p>
              <p className="text-2xl font-bold text-green mt-1">
                {completedCount}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-surface0 border-surface1">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-subtext0">Failed</p>
              <p className="text-2xl font-bold text-red mt-1">{failedCount}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
