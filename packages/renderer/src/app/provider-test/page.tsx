'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Progress,
  Chip,
} from '@nextui-org/react'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { providerRegistry } from '@/services/providers/registry'
import { MockProvider } from '@/services/providers/mock-provider'
import { Job, JobStatus } from '@/types/provider'

export default function ProviderTestPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('mock')
  const [testUrl, setTestUrl] = useState('https://example.com/test-file.zip')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    initializeProviders()
    loadJobs()
  }, [])

  const initializeProviders = () => {
    if (!providerRegistry.hasProvider('mock')) {
      providerRegistry.registerProvider('mock', new MockProvider())
    }
  }

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
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await jobOrchestrator.createJob({
        provider: selectedProvider,
        payload: { url: testUrl },
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

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.QUEUED:
        return 'default'
      case JobStatus.RESOLVING:
        return 'primary'
      case JobStatus.DOWNLOADING:
        return 'secondary'
      case JobStatus.COMPLETED:
        return 'success'
      case JobStatus.FAILED:
        return 'danger'
      case JobStatus.CANCELLED:
        return 'warning'
      default:
        return 'default'
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">
              Provider Framework Test
            </h1>
            <p className="text-subtext0 mt-1">
              Test provider operations and job orchestration
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>

        {error && (
          <Card className="bg-red border-red">
            <CardBody>
              <p className="text-crust font-semibold">Error: {error}</p>
            </CardBody>
          </Card>
        )}

        {connectionStatus && (
          <Card className="bg-green border-green">
            <CardBody>
              <p className="text-crust font-semibold">{connectionStatus}</p>
            </CardBody>
          </Card>
        )}

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h2 className="text-xl font-semibold text-text">Create New Job</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              label="Provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="max-w-xs"
            >
              {providerRegistry.listProviders().map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="URL or Magnet Link"
              placeholder="https://example.com/file.zip"
              value={testUrl}
              onValueChange={setTestUrl}
              className="max-w-2xl"
            />

            <div className="flex gap-2">
              <Button
                color="primary"
                onPress={handleStartJob}
                isLoading={loading}
                isDisabled={!testUrl}
              >
                Start Job
              </Button>
              <Button
                color="secondary"
                variant="flat"
                onPress={handleTestConnection}
                isLoading={loading}
              >
                Test Connection
              </Button>
              <Button
                color="warning"
                variant="flat"
                onPress={handleClearCompleted}
              >
                Clear Completed
              </Button>
              <Button color="default" variant="flat" onPress={loadJobs}>
                Refresh
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardHeader>
            <h2 className="text-xl font-semibold text-text">
              Jobs ({jobs.length})
            </h2>
          </CardHeader>
          <CardBody>
            {jobs.length === 0 ? (
              <p className="text-subtext0">
                No jobs yet. Create a job to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="bg-surface1 border-surface2">
                    <CardBody className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Chip
                            color={getStatusColor(job.status)}
                            size="sm"
                            variant="flat"
                          >
                            {job.status}
                          </Chip>
                          <span className="text-sm font-mono text-subtext0">
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
                                  color="primary"
                                  variant="flat"
                                  onPress={() => handleSyncJob(job.id)}
                                >
                                  Sync
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => handleCancelJob(job.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text">Progress</span>
                          <span className="text-subtext0">{job.progress}%</span>
                        </div>
                        <Progress
                          value={job.progress}
                          color={
                            job.status === JobStatus.COMPLETED
                              ? 'success'
                              : 'primary'
                          }
                          size="sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-subtext0">Provider:</span>
                          <span className="text-text ml-2">{job.provider}</span>
                        </div>
                        <div>
                          <span className="text-subtext0">Files:</span>
                          <span className="text-text ml-2">
                            {job.files.length}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-subtext0">URL:</span>
                          <span className="text-text ml-2 text-xs break-all">
                            {job.metadata.originalUrl || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {job.files.length > 0 && (
                        <div className="pt-2 border-t border-surface2">
                          <p className="text-sm text-subtext0 mb-2">Files:</p>
                          <div className="space-y-1">
                            {job.files.slice(0, 3).map((file, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-text flex justify-between"
                              >
                                <span className="truncate flex-1">
                                  {file.name}
                                </span>
                                <span className="text-subtext0 ml-2">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            ))}
                            {job.files.length > 3 && (
                              <p className="text-xs text-subtext0">
                                +{job.files.length - 3} more files
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
