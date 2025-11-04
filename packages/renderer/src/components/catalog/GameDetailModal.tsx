import { useState, useMemo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Chip,
  Checkbox,
  CheckboxGroup,
} from '@nextui-org/react'
import { toast } from 'sonner'
import { GameEntry } from '@/hooks/useGames'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { providerRegistry } from '@/services/providers/registry'

interface GameDetailModalProps {
  isOpen: boolean
  onClose: () => void
  game: GameEntry | null
  onDownloadStart?: () => void
}

export function GameDetailModal({
  isOpen,
  onClose,
  game,
  onDownloadStart,
}: GameDetailModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)

  const availableProviders = useMemo(() => {
    return providerRegistry.getAvailableProviders()
  }, [])

  const handleDownload = async () => {
    if (!game || !selectedProvider) {
      toast.error('Please select a provider')
      return
    }

    if (selectedLinks.length === 0) {
      toast.error('Please select at least one link to download')
      return
    }

    setIsDownloading(true)

    try {
      for (const link of selectedLinks) {
        const isMagnet = link.startsWith('magnet:')
        const payload = isMagnet
          ? { magnet: link }
          : { url: link }

        const job = await jobOrchestrator.createJob({
          provider: selectedProvider,
          payload,
        })

        console.log('[GameDetailModal] Created job:', job.id)
      }

      toast.success(
        `Started downloading ${selectedLinks.length} link(s) for ${game.title}`
      )
      
      onDownloadStart?.()
      onClose()
      
      setSelectedLinks([])
      setSelectedProvider('')
    } catch (error) {
      console.error('[GameDetailModal] Download error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to start download'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClose = () => {
    setSelectedLinks([])
    setSelectedProvider('')
    onClose()
  }

  if (!game) return null

  const description = game.meta?.description as string | undefined
  const releaseDate = game.meta?.releaseDate as string | undefined
  const platform = game.meta?.platform as string | undefined
  const size = game.meta?.size as string | undefined
  const version = game.meta?.version as string | undefined

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-mantle',
        header: 'border-b border-surface0',
        body: 'py-6',
        footer: 'border-t border-surface0',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-text">{game.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Chip size="sm" color="default" variant="flat">
              {game.sourceName}
            </Chip>
            {platform && (
              <Chip size="sm" color="primary" variant="flat">
                {platform}
              </Chip>
            )}
            {version && (
              <Chip size="sm" color="secondary" variant="flat">
                v{version}
              </Chip>
            )}
            {size && (
              <Chip size="sm" color="warning" variant="flat">
                {size}
              </Chip>
            )}
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Description */}
          {description && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text mb-2">
                Description
              </h3>
              <p className="text-subtext0 whitespace-pre-wrap">{description}</p>
            </div>
          )}

          {/* Additional Metadata */}
          {(releaseDate || Object.keys(game.meta || {}).length > 0) && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text mb-2">
                Additional Info
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {releaseDate && (
                  <div>
                    <span className="text-subtext1">Release Date:</span>{' '}
                    <span className="text-text">{releaseDate}</span>
                  </div>
                )}
                {game.meta &&
                  Object.entries(game.meta).map(([key, value]) => {
                    if (
                      ['description', 'coverImage', 'platform', 'size', 'version', 'releaseDate'].includes(
                        key
                      )
                    ) {
                      return null
                    }
                    return (
                      <div key={key}>
                        <span className="text-subtext1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>{' '}
                        <span className="text-text">{String(value)}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Provider Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text mb-2">
              Select Provider
            </h3>
            <Select
              label="Provider"
              placeholder="Choose a download provider"
              selectedKeys={selectedProvider ? [selectedProvider] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string
                setSelectedProvider(selected)
              }}
              classNames={{
                trigger: 'bg-surface0 border-surface1',
              }}
            >
              {availableProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </Select>
            {availableProviders.length === 0 && (
              <p className="text-sm text-yellow mt-2">
                No providers configured. Please configure a provider in Settings
                → Integrations.
              </p>
            )}
          </div>

          {/* Link Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text mb-2">
              Download Links ({game.links.length})
            </h3>
            <CheckboxGroup
              value={selectedLinks}
              onValueChange={setSelectedLinks}
              classNames={{
                base: 'w-full',
              }}
            >
              {game.links.map((link, index) => (
                <Checkbox
                  key={index}
                  value={link}
                  classNames={{
                    base: 'w-full max-w-full bg-surface0 rounded-lg p-3 mb-2 hover:bg-surface1 transition-colors',
                    label: 'w-full',
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text font-mono text-sm truncate flex-1">
                      {link.startsWith('magnet:')
                        ? `Magnet Link #${index + 1}`
                        : link}
                    </span>
                    <Chip
                      size="sm"
                      color={link.startsWith('magnet:') ? 'success' : 'primary'}
                      variant="flat"
                      className="ml-2"
                    >
                      {link.startsWith('magnet:') ? 'Magnet' : 'URL'}
                    </Chip>
                  </div>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleDownload}
            isDisabled={
              !selectedProvider ||
              selectedLinks.length === 0 ||
              availableProviders.length === 0
            }
            isLoading={isDownloading}
          >
            Download {selectedLinks.length > 0 && `(${selectedLinks.length})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
