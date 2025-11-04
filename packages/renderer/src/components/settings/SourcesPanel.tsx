'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  Button,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react'
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
import { toast } from 'sonner'

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

  const {
    isOpen: isAddDialogOpen,
    onOpen: onAddDialogOpen,
    onClose: onAddDialogClose,
  } = useDisclosure()

  const {
    isOpen: isEditDialogOpen,
    onOpen: onEditDialogOpen,
    onClose: onEditDialogClose,
  } = useDisclosure()

  const {
    isOpen: isRemoveDialogOpen,
    onOpen: onRemoveDialogOpen,
    onClose: onRemoveDialogClose,
  } = useDisclosure()

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
      toast.error('Failed to load sources')
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
      toast.success('Source added successfully')
      await loadSources()
    } catch (error) {
      console.error('Failed to add source:', error)
      toast.error('Failed to add source')
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
      toast.success('Source updated successfully')
      await loadSources()
    } catch (error) {
      console.error('Failed to update source:', error)
      toast.error('Failed to update source')
      throw error
    }
  }

  const handleRemoveSource = async () => {
    if (!sourceToRemove) return

    try {
      await removeSource(sourceToRemove)
      toast.success('Source removed successfully')
      await loadSources()
      onRemoveDialogClose()
      setSourceToRemove(null)
    } catch (error) {
      console.error('Failed to remove source:', error)
      toast.error('Failed to remove source')
    }
  }

  const handleSyncSource = async (id: string) => {
    try {
      await syncSource(id)
      toast.success('Source synced successfully')
      await loadSources()
    } catch (error) {
      console.error('Failed to sync source:', error)
      toast.error('Failed to sync source')
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
      toast.success('All sources synced')
    } catch (error) {
      console.error('Failed to sync all sources:', error)
      toast.error('Failed to sync all sources')
    } finally {
      setIsSyncingAll(false)
      setSyncProgress(null)
    }
  }

  const handleEdit = (source: Source) => {
    setEditingSource(source)
    onEditDialogOpen()
  }

  const handleRemove = (id: string) => {
    setSourceToRemove(id)
    onRemoveDialogOpen()
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

    toast.success('Sources exported successfully')
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
          toast.error('Invalid import file format')
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
        toast.success(`Imported ${imported} source${imported !== 1 ? 's' : ''}`)
      } catch (error) {
        console.error('Failed to import sources:', error)
        toast.error('Failed to import sources')
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legal Notice */}
      <Card className="bg-yellow/10 border-yellow/30 border">
        <CardBody>
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
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-surface0 border-surface1">
        <CardBody>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                color="primary"
                onPress={onAddDialogOpen}
                startContent={<span>➕</span>}
              >
                Add Source
              </Button>
              <Button
                variant="flat"
                onPress={handleSyncAll}
                isDisabled={sources.length === 0 || isSyncingAll}
                startContent={
                  isSyncingAll ? <Spinner size="sm" /> : <span>🔄</span>
                }
                className="bg-surface1"
              >
                {isSyncingAll
                  ? `Syncing ${syncProgress?.completed}/${syncProgress?.total}`
                  : 'Sync All'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                onPress={handleImport}
                startContent={<span>📥</span>}
                className="bg-surface1"
              >
                Import
              </Button>
              <Button
                size="sm"
                variant="flat"
                onPress={handleExport}
                isDisabled={sources.length === 0}
                startContent={<span>📤</span>}
                className="bg-surface1"
              >
                Export
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sources List */}
      {sources.length === 0 ? (
        <Card className="bg-surface0 border-surface1">
          <CardBody className="py-12">
            <div className="text-center">
              <p className="text-subtext0 mb-4">No sources configured</p>
              <Button color="primary" onPress={onAddDialogOpen}>
                Add Your First Source
              </Button>
            </div>
          </CardBody>
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
        onClose={onAddDialogClose}
        onSave={handleAddSource}
        title="Add Source"
      />

      {/* Edit Source Dialog */}
      <SourceDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          onEditDialogClose()
          setEditingSource(undefined)
        }}
        onSave={handleEditSource}
        source={editingSource}
        title="Edit Source"
      />

      {/* Remove Confirmation Dialog */}
      <Modal
        isOpen={isRemoveDialogOpen}
        onClose={onRemoveDialogClose}
        classNames={{
          base: 'bg-surface0 border border-surface1',
          header: 'border-b border-surface1',
          footer: 'border-t border-surface1',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold text-text">Remove Source</h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-text">
              Are you sure you want to remove this source? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onRemoveDialogClose}
              className="bg-surface1"
            >
              Cancel
            </Button>
            <Button color="danger" onPress={handleRemoveSource}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
