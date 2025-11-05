'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { providerRegistry } from '@/services/providers/registry'
import { MockProvider } from '@/services/providers/mock-provider'
import { TorBoxProvider } from '@/services/providers/torbox'
import { RealDebridProvider } from '@/services/providers/realdebrid'
import { Job, JobStatus } from '@/types/provider'
import { useSettings } from '@/hooks/useSettings'

export default function ProviderTestPage() {
  const router = useRouter()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('mock')
  const [testUrl, setTestUrl] = useState('https://example.com/test-file.zip')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

  useEffect(() => {
    const initializeProviders = () => {
      if (!providerRegistry.hasProvider('mock')) {
        providerRegistry.registerProvider('mock', new MockProvider())
      }

      const torboxToken = settings.integrations.torboxApiToken
      if (torboxToken && !providerRegistry.hasProvider('torbox')) {
        providerRegistry.registerProvider(
          'torbox',
          new TorBoxProvider({ apiToken: torboxToken })
        )
      }

      const realDebridToken = settings.integrations.realDebridApiToken
      if (realDebridToken && !providerRegistry.hasProvider('realdebrid')) {
        providerRegistry.registerProvider(
          'realdebrid',
          new RealDebridProvider({ apiToken: realDebridToken })
        )
      }
    }

    setMounted(true)
    initializeProviders()
    loadJobs()
  }, [
    settings.integrations.torboxApiToken,
    settings.integrations.realDebridApiToken,
  ])

  const loadJobs = async () => {
    try {
      const allJobs = await jobOrchestrator.getAllJobs()
      setJobs(allJobs)
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }

  const handleStartJob = async () => {
    if (!testUrl) {
      setError('Please enter a URL or magnet link')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = testUrl.startsWith('magnet:')
        ? { magnet: testUrl }
        : { url: testUrl }

      await jobOrchestrator.createJob({
        provider: selectedProvider,
        payload,
      })

      await loadJobs()
      setTestUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start job')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncJob = async (jobId: string) => {
    try {
      await jobOrchestrator.syncJobStatus(jobId)
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync job')
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      await jobOrchestrator.cancelJob(jobId)
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job')
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setError(null)
    setConnectionStatus(null)

    try {
      const provider = providerRegistry.getProvider(selectedProvider)
      const result = await provider.testConnection()

      if (result.success) {
        setConnectionStatus(
          `✓ Connected to ${selectedProvider} as ${result.user?.username || 'unknown'}`
        )
      } else {
        setConnectionStatus(`✗ Connection failed: ${result.message}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCompleted = async () => {
    try {
      const count = await jobOrchestrator.clearCompletedJobs()
      await loadJobs()
      setConnectionStatus(`Cleared ${count} completed jobs`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear completed jobs'
      )
    }
  }

  const getStatusVariant = (status: JobStatus) => {
    switch (status) {
      case JobStatus.QUEUED:
        return 'default'
      case JobStatus.RESOLVING:
        return 'default'
      case JobStatus.DOWNLOADING:
        return 'secondary'
      case JobStatus.COMPLETED:
        return 'default'
      case JobStatus.FAILED:
        return 'destructive'
      case JobStatus.CANCELLED:
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Provider Framework Test
            </h1>
            <p className="text-muted-foreground mt-1">
              Test provider operations and job orchestration
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive font-semibold">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {connectionStatus && (
          <Card className="border-green-600/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <p className="text-green-700 dark:text-green-300 font-semibold">{connectionStatus}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs">
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providerRegistry.listProviders().map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-w-2xl">
              <label className="text-sm font-medium mb-2 block">URL or Magnet Link</label>
              <Input
                placeholder="https://example.com/file.zip or magnet:?xt=..."
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleStartJob}
                disabled={loading || !testUrl}
              >
                {loading ? 'Starting...' : 'Start Job'}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearCompleted}
              >
                Clear Completed
              </Button>
              <Button variant="outline" onClick={loadJobs}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">
                No jobs yet. Create a job to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={getStatusVariant(job.status)}
                          >
                            {job.status}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {job.id}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {job.status !== JobStatus.COMPLETED &&
                            job.status !== JobStatus.FAILED &&
                            job.status !== JobStatus.CANCELLED && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSyncJob(job.id)}
                                >
                                  Sync
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelJob(job.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">Progress</span>
                          <span className="text-muted-foreground">{job.progress}%</span>
                        </div>
                        <Progress
                          value={job.progress}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Provider:</span>
                          <span className="text-foreground ml-2">{job.provider}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Files:</span>
                          <span className="text-foreground ml-2">
                            {job.files.length}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">URL:</span>
                          <span className="text-foreground ml-2 text-xs break-all">
                            {job.metadata.originalUrl || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {job.files.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Files:</p>
                          <div className="space-y-1">
                            {job.files.slice(0, 3).map((file, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-foreground flex justify-between"
                              >
                                <span className="truncate flex-1">
                                  {file.name}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            ))}
                            {job.files.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{job.files.length - 3} more files
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
