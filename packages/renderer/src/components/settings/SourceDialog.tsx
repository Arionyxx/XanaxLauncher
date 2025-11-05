import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Source } from '@/db/schema'
import { sourceFormSchema, SourceFormData } from '@/types/source'
import { SecurityWarning } from '@/components/SecurityWarning'

interface SourceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SourceFormData) => Promise<void>
  source?: Source
  title?: string
}

export function SourceDialog({
  isOpen,
  onClose,
  onSave,
  source,
  title = 'Add Source',
}: SourceDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SourceFormData>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: {
      name: source?.name || '',
      url: source?.url || '',
      autoSync: source?.autoSync ?? true,
    },
  })

  const watchedUrl = watch('url')

  useEffect(() => {
    if (isOpen) {
      reset({
        name: source?.name || '',
        url: source?.url || '',
        autoSync: source?.autoSync ?? true,
      })
    }
  }, [isOpen, source, reset])

  const handleSave = async (data: SourceFormData) => {
    try {
      await onSave(data)
      onClose()
    } catch (error) {
      console.error('Failed to save source:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <>
                    <Label htmlFor="source-name">Name</Label>
                    <Input
                      {...field}
                      id="source-name"
                      placeholder="Enter source name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <>
                    <Label htmlFor="source-url">URL</Label>
                    <Input
                      {...field}
                      id="source-url"
                      placeholder="https://example.com/feed.json"
                      type="url"
                      className={
                        errors.url
                          ? 'border-destructive font-mono text-sm'
                          : 'font-mono text-sm'
                      }
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive">
                        {errors.url.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {watchedUrl && <SecurityWarning url={watchedUrl} type="http" />}

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Auto-sync</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically sync this source on app startup
                </p>
              </div>
              <Controller
                name="autoSync"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : source
                  ? 'Save Changes'
                  : 'Add Source'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
