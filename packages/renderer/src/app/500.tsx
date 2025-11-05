import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '500 - Server Error',
}

export default function ServerError() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
            <p className="text-muted-foreground mb-4">Something went wrong on our end.</p>
            <a href="/" className="text-blue-500 hover:underline">
              Go back home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}