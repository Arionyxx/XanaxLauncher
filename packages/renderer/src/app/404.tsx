import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
}

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-4">The page you&apos;re looking for doesn&apos;t exist.</p>
            <a href="/" className="text-blue-500 hover:underline">
              Go back home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}