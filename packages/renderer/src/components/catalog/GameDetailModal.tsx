import { useState, useMemo, useEffect } from 'react'
import { X, Download, Link, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GameEntry } from '@/hooks/useGames'
import { jobOrchestrator } from '@/services/job-orchestrator'
import { providerRegistry } from '@/services/providers/registry'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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
  const { toast } = useToast()
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
      toast({
        title: "Provider Required",
        description: "Please select a download provider",
        variant: "destructive",
      })
      return
    }

    if (selectedLinks.size === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one link to download",
        variant: "destructive",
      })
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

      toast({
        title: "Download Started",
        description: `Started downloading ${selectedLinks.size} link(s) for ${game.title}`,
      })

      onDownload?.(game)
      onClose()
    } catch (error) {
      console.error('[GameDetailModal] Download error:', error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'Failed to start download',
        variant: "destructive",
      })
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

  if (!game) return null

  const description = game.meta?.description as string | undefined
  const releaseDate = game.meta?.releaseDate as string | undefined
  const platform = game.meta?.platform as string | undefined
  const size = game.meta?.size as string | undefined
  const version = game.meta?.version as string | undefined
  const coverImage = game.meta?.coverImage as string | undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {coverImage && (
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold truncate">
                {game.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{game.sourceName}</Badge>
                  {platform && <Badge variant="outline">{platform}</Badge>}
                  {version && <Badge variant="outline">v{version}</Badge>}
                  {size && <Badge variant="outline">{size}</Badge>}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            {releaseDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Release Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{releaseDate}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download Provider</CardTitle>
                <CardDescription>
                  Select the service to handle your downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a download provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableProviders.length === 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No providers configured. Please configure a provider in
                      Settings → Integrations.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Download Links ({game.links.length})
                </CardTitle>
                <CardDescription>
                  Select the links you want to download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {game.links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`link-${index}`}
                        checked={selectedLinks.has(link)}
                        onCheckedChange={() => toggleLink(link)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`link-${index}`}
                          className="font-mono text-sm truncate block cursor-pointer"
                        >
                          {link.startsWith('magnet:')
                            ? `Magnet Link #${index + 1}`
                            : link}
                        </label>
                      </div>
                      <Badge
                        variant={link.startsWith('magnet:') ? 'default' : 'secondary'}
                      >
                        {link.startsWith('magnet:') ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Magnet
                          </>
                        ) : (
                          <>
                            <Link className="w-3 h-3 mr-1" />
                            URL
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
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
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download {selectedLinks.size > 0 && `(${selectedLinks.size})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}