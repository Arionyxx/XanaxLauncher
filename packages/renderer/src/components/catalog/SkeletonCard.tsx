'use client'

export function SkeletonCard() {
  return (
    <div className="card bg-base-200 shadow-xl">
      <figure className="aspect-[3/4] bg-base-300 animate-pulse"></figure>
      <div className="card-body p-4 space-y-3">
        <div className="h-5 w-3/4 bg-base-300 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-base-300 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-base-300 rounded-full animate-pulse"></div>
          <div className="h-6 w-16 bg-base-300 rounded-full animate-pulse"></div>
        </div>
        <div className="h-8 w-full bg-base-300 rounded animate-pulse"></div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
