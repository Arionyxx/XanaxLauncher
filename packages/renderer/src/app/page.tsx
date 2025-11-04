export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to Next.js!</h1>
        <p className="text-xl mb-8">
          This is a Next.js application with TypeScript and Tailwind CSS.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Documentation</h2>
            <p className="text-gray-600">
              Find in-depth information about Next.js features and API.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Learn</h2>
            <p className="text-gray-600">
              Learn about Next.js in an interactive course with quizzes!
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Templates</h2>
            <p className="text-gray-600">
              Discover and deploy boilerplate example Next.js projects.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Deploy</h2>
            <p className="text-gray-600">
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
