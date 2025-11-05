'use client'

import { Job, JobStatus } from '@/types/provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Play, CheckCircle, XCircle, Package } from 'lucide-react'

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

  const statCards = [
    {
      title: 'Total Downloads',
      value: totalCount,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Active',
      value: activeCount,
      icon: Download,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Failed',
      value: failedCount,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} ${stat.borderColor} border flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.title.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}