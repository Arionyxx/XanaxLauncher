import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
} from '@nextui-org/react'
import { Source } from '@/db/schema'
import { sourceFormSchema, SourceFormData } from '@/types/source'

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
    formState: { errors, isSubmitting },
  } = useForm<SourceFormData>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: {
      name: source?.name || '',
      url: source?.url || '',
      autoSync: source?.autoSync ?? true,
    },
  })

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'bg-surface0 border border-surface1',
        header: 'border-b border-surface1',
        body: 'py-6',
        footer: 'border-t border-surface1',
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleSave)}>
          <ModalHeader>
            <h2 className="text-xl font-semibold text-text">{title}</h2>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Name"
                    placeholder="Enter source name"
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    classNames={{
                      label: 'text-text',
                      input: 'bg-surface1 text-text',
                      inputWrapper: 'bg-surface1 border-surface2',
                    }}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="URL"
                    placeholder="https://example.com/feed.json"
                    type="url"
                    isInvalid={!!errors.url}
                    errorMessage={errors.url?.message}
                    classNames={{
                      label: 'text-text',
                      input: 'bg-surface1 text-text font-mono text-sm',
                      inputWrapper: 'bg-surface1 border-surface2',
                    }}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface1 rounded-lg">
              <div>
                <p className="text-sm font-medium text-text">Auto-sync</p>
                <p className="text-xs text-subtext0 mt-1">
                  Automatically sync this source on app startup
                </p>
              </div>
              <Controller
                name="autoSync"
                control={control}
                render={({ field }) => (
                  <Switch
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    classNames={{
                      wrapper: 'group-data-[selected=true]:bg-blue',
                    }}
                  />
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={isSubmitting}
              className="bg-surface1"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {source ? 'Save Changes' : 'Add Source'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
