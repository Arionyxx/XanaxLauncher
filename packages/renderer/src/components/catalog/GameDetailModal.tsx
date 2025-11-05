import { useState, useMemo, useEffect } from 'react'
import { FiX, FiDownload, FiLink } from 'react-icons/fi'
import { toast } from 'sonner'
import { GameEntry } from '@/hooks/useGames'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { providerRegistry } from '@/services/providers/registry'

interface GameDetailModalProps {
  isOpen: boolean
  onClose: () => void
  game: GameEntry | null
  onDownload?: (game: GameEntry) => void
}

export function GameDetailModal({
  isOpen,
  onClose,
  game,
  onDownload,
}: GameDetailModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)

  const availableProviders = useMemo(() => {
    return providerRegistry.getAvailableProviders()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSelectedLinks(new Set())
      setSelectedProvider('')
    }
  }, [isOpen])

  const handleDownload = async () => {
    if (!game || !selectedProvider) {
      toast.error('Please select a provider')
      return
    }

    if (selectedLinks.size === 0) {
      toast.error('Please select at least one link to download')
      return
    }

    setIsDownloading(true)

    try {
      for (const link of Array.from(selectedLinks)) {
        const isMagnet = link.startsWith('magnet:')
        const payload = isMagnet ? { magnet: link } : { url: link }

        const job = await jobOrchestrator.createJob({
          provider: selectedProvider,
          payload,
        })

        console.log('[GameDetailModal] Created job:', job.id)
      }

      toast.success(
        `Started downloading ${selectedLinks.size} link(s) for ${game.title}`
      )

      onDownload?.(game)
      onClose()
    } catch (error) {
      console.error('[GameDetailModal] Download error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to start download'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const toggleLink = (link: string) => {
    const newSet = new Set(selectedLinks)
    if (newSet.has(link)) {
      newSet.delete(link)
    } else {
      newSet.add(link)
    }
    setSelectedLinks(newSet)
  }

  if (!game || !isOpen) return null

  const description = game.meta?.description as string | undefined
  const releaseDate = game.meta?.releaseDate as string | undefined
  const platform = game.meta?.platform as string | undefined
  const size = game.meta?.size as string | undefined
  const version = game.meta?.version as string | undefined

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">{game.title}</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="badge badge-neutral">{game.sourceName}</div>
          {platform && <div className="badge badge-primary">{platform}</div>}
          {version && <div className="badge badge-secondary">v{version}</div>}
          {size && <div className="badge badge-accent">{size}</div>}
        </div>

        <div className="divider"></div>

        <div className="space-y-4 overflow-y-auto max-h-[50vh]">
          {description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-base-content/70 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {releaseDate && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Release Date</h3>
              <p className="text-base-content/70">{releaseDate}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Select Provider</h3>
            <select
              className="select select-bordered w-full"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="">Choose a download provider</option>
              {availableProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
            {availableProviders.length === 0 && (
              <div className="alert alert-warning mt-2">
                <span className="text-sm">
                  No providers configured. Please configure a provider in
                  Settings → Integrations.
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Download Links ({game.links.length})
            </h3>
            <div className="space-y-2">
              {game.links.map((link, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedLinks.has(link)}
                    onChange={() => toggleLink(link)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm truncate block">
                      {link.startsWith('magnet:')
                        ? `Magnet Link #${index + 1}`
                        : link}
                    </span>
                  </div>
                  <div
                    className={`badge ${link.startsWith('magnet:') ? 'badge-success' : 'badge-info'}`}
                  >
                    {link.startsWith('magnet:') ? 'Magnet' : 'URL'}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={
              !selectedProvider ||
              selectedLinks.size === 0 ||
              availableProviders.length === 0 ||
              isDownloading
            }
          >
            {isDownloading ? (
              <>
                <span className="loading loading-spinner"></span>
                Downloading...
              </>
            ) : (
              <>
                <FiDownload />
                Download {selectedLinks.size > 0 && `(${selectedLinks.size})`}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
