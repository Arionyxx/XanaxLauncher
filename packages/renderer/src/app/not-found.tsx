import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card bg-base-200 shadow-xl max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-base-content/70 mb-4">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="card-actions justify-center">
            <Link href="/" className="btn btn-primary">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
