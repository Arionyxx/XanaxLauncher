import { FiSettings } from 'react-icons/fi'

interface EmptyStateProps {
  onAddSource: () => void
}

export function EmptyState({ onAddSource }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="card bg-base-200 shadow-xl max-w-md">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="card-title text-2xl">No sources configured</h2>
          <p className="text-base-content/70">
            Get started by adding media sources in Settings. Sources provide the
            catalog of items you can browse and download.
          </p>
          <div className="card-actions justify-center mt-4">
            <button className="btn btn-primary" onClick={onAddSource}>
              <FiSettings />
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
