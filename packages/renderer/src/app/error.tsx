'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Error Page] Caught error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card bg-base-200 shadow-xl max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-error mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-base-content/70 mb-4">
            The application encountered an unexpected error. Don&apos;t worry,
            your data is safe.
          </p>
          {error && (
            <div className="alert alert-error mb-4">
              <p className="text-xs font-mono break-all text-left">
                {error.message}
              </p>
            </div>
          )}
          <div className="card-actions justify-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
            <button className="btn btn-ghost" onClick={() => reset()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
