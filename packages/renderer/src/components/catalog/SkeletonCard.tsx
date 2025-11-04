'use client'

import { Card, CardBody, Skeleton } from '@nextui-org/react'

export function SkeletonCard() {
  return (
    <Card className="bg-surface0 border-surface1">
      <CardBody className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="w-3/4 h-5 rounded" />
          <Skeleton className="w-1/2 h-4 rounded" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="w-20 h-8 rounded" />
            <Skeleton className="w-20 h-8 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
