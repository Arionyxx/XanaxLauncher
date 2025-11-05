'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Source } from '@/db/schema'
import {
  getSources,
  addSource,
  updateSource,
  removeSource,
} from '@/services/storage'
import { syncSource, syncAllSources } from '@/services/source-sync'
import { SourceFormData, sourcesExportSchema } from '@/types/source'
import { SourceListItem } from './SourceListItem'
import { SourceDialog } from './SourceDialog'
import { toast } from '@/hooks/use-toast'

export function SourcesPanel() {
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [syncProgress, setSyncProgress] = useState<{
    completed: number
    total: number
  } | null>(null)

  const [editingSource, setEditingSource] = useState<Source | undefined>()
  const [sourceToRemove, setSourceToRemove] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      setIsLoading(true)
      const fetchedSources = await getSources()
      setSources(fetchedSources)
    } catch (error) {
      console.error('Failed to load sources:', error)
      toast({
        title: 'Error',
        description: 'Failed to load sources',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSource = async (data: SourceFormData) => {
    try {
      await addSource({
        name: data.name,
        url: data.url,
        autoSync: data.autoSync,
      })
      toast({ title: 'Success', description: 'Source added successfully' })
      await loadSources()
    } catch (error) {
      console.error('Failed to add source:', error)
      toast({
        title: 'Error',
        description: 'Failed to add source',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleEditSource = async (data: SourceFormData) => {
    if (!editingSource) return

    try {
      await updateSource(editingSource.id, {
        name: data.name,
        url: data.url,
        autoSync: data.autoSync,
      })
      toast({ title: 'Success', description: 'Source updated successfully' })
      await loadSources()
    } catch (error) {
      console.error('Failed to update source:', error)
      toast({
        title: 'Error',
        description: 'Failed to update source',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleRemoveSource = async () => {
    if (!sourceToRemove) return

    try {
      await removeSource(sourceToRemove)
      toast({ title: 'Success', description: 'Source removed successfully' })
      await loadSources()
      setIsRemoveDialogOpen(false)
      setSourceToRemove(null)
    } catch (error) {
      console.error('Failed to remove source:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove source',
        variant: 'destructive',
      })
    }
  }

  const handleSyncSource = async (id: string) => {
    try {
      await syncSource(id)
      toast({ title: 'Success', description: 'Source synced successfully' })
      await loadSources()
    } catch (error) {
      console.error('Failed to sync source:', error)
      toast({
        title: 'Error',
        description: 'Failed to sync source',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleSyncAll = async () => {
    setIsSyncingAll(true)
    setSyncProgress({ completed: 0, total: sources.length })

    try {
      await syncAllSources((progress) => {
        setSyncProgress({
          completed: progress.completed,
          total: progress.total,
        })
      })

      await loadSources()
      toast({
        title: 'Sync Complete',
        description: 'All sources synced successfully',
      })
    } catch (error) {
      console.error('Failed to sync all sources:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync all sources',
        variant: 'destructive',
      })
    } finally {
      setIsSyncingAll(false)
      setSyncProgress(null)
    }
  }

  const handleEdit = (source: Source) => {
    setEditingSource(source)
    setIsEditDialogOpen(true)
  }

  const handleRemove = (id: string) => {
    setSourceToRemove(id)
    setIsRemoveDialogOpen(true)
  }

  const handleExport = () => {
    const exportData = {
      sources: sources.map((s) => ({
        name: s.name,
        url: s.url,
        autoSync: s.autoSync,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sources-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: 'Success', description: 'Sources exported successfully' })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        const validationResult = sourcesExportSchema.safeParse(data)
        if (!validationResult.success) {
          toast({
            title: 'Error',
            description: 'Invalid import file format',
            variant: 'destructive',
          })
          return
        }

        const existingUrls = new Set(sources.map((s) => s.url))
        let imported = 0

        for (const sourceData of validationResult.data.sources) {
          if (existingUrls.has(sourceData.url)) {
            console.log(`Skipping duplicate source: ${sourceData.url}`)
            continue
          }

          await addSource({
            name: sourceData.name,
            url: sourceData.url,
            autoSync: sourceData.autoSync,
          })
          imported++
        }

        await loadSources()
        toast({
          title: 'Success',
          description: `Imported ${imported} source${imported !== 1 ? 's' : ''}`,
        })
      } catch (error) {
        console.error('Failed to import sources:', error)
        toast({
          title: 'Error',
          description: 'Failed to import sources',
          variant: 'destructive',
        })
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legal Notice */}
      <Card className="bg-yellow/10 border-yellow/30 border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow mb-1">
                Legal Notice
              </h4>
              <p className="text-xs text-text leading-relaxed">
                Only add sources for content you have the legal right to access.
                Using this application to access copyrighted content without
                authorization may violate laws in your jurisdiction. Be cautious
                when adding sources from untrusted origins, as they may contain
                malicious content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-surface0 border-surface1">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <span>➕</span> Add Source
              </Button>
              <Button
                variant="outline"
                onClick={handleSyncAll}
                disabled={sources.length === 0 || isSyncingAll}
                className="bg-surface1"
              >
                {isSyncingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing {syncProgress?.completed}/{syncProgress?.total}
                  </>
                ) : (
                  <>
                    <span>🔄</span> Sync All
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleImport}
                className="bg-surface1"
              >
                <span>📥</span> Import
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={sources.length === 0}
                className="bg-surface1"
              >
                <span>📤</span> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      {sources.length === 0 ? (
        <Card className="bg-surface0 border-surface1">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-subtext0 mb-4">No sources configured</p>
              <Button
                variant="default"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Your First Source
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <SourceListItem
              key={source.id}
              source={source}
              onSync={handleSyncSource}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Add Source Dialog */}
      <SourceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddSource}
        title="Add Source"
      />

      {/* Edit Source Dialog */}
      <SourceDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingSource(undefined)
        }}
        onSave={handleEditSource}
        source={editingSource}
        title="Edit Source"
      />

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="bg-surface0 border border-surface1">
          <DialogHeader className="border-b border-surface1">
            <DialogTitle className="text-xl font-semibold text-text">
              Remove Source
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-text">
              Are you sure you want to remove this source? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter className="border-t border-surface1">
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              className="bg-surface1"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSource}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
