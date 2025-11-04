import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
} from '@nextui-org/react'
import {
  GeneralSettings,
  generalSettingsSchema,
  languages,
} from '@/types/settings'

interface GeneralPanelProps {
  settings: GeneralSettings
  onUpdate: (settings: Partial<GeneralSettings>) => Promise<void>
}

const languageLabels: Record<string, string> = {
  en: 'English',
  es: 'Español',
}

export function GeneralPanel({ settings, onUpdate }: GeneralPanelProps) {
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    formState: { errors },
    watch,
  } = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings,
    mode: 'onChange',
  })

  const handleLanguageChange = async (value: string) => {
    try {
      setIsSaving(true)
      await onUpdate({ language: value as 'en' | 'es' })
    } catch (error) {
      console.error('Failed to update language:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectDownloadDirectory = async () => {
    try {
      const result = await window.api.selectFolder()
      if (!result.canceled && result.filePaths.length > 0) {
        await onUpdate({ downloadDirectory: result.filePaths[0] })
      }
    } catch (error) {
      console.error('Failed to select download directory:', error)
    }
  }

  const handleSelectTempDirectory = async () => {
    try {
      const result = await window.api.selectFolder()
      if (!result.canceled && result.filePaths.length > 0) {
        await onUpdate({ tempDirectory: result.filePaths[0] })
      }
    } catch (error) {
      console.error('Failed to select temp directory:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-surface0 border-surface1">
        <CardBody className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="text-sm font-semibold text-text mb-2 block">
              Language
            </label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  selectedKeys={[field.value]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    field.onChange(value)
                    handleLanguageChange(value)
                  }}
                  placeholder="Select a language"
                  className="max-w-xs"
                  classNames={{
                    trigger: 'bg-surface1 border-surface2',
                    value: 'text-text',
                  }}
                  isDisabled={isSaving}
                >
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {languageLabels[lang]}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {errors.language && (
              <p className="text-xs text-red mt-1">{errors.language.message}</p>
            )}
          </div>

          {/* Download Directory */}
          <div>
            <label className="text-sm font-semibold text-text mb-2 block">
              Download Directory
            </label>
            <div className="flex gap-2">
              <Controller
                name="downloadDirectory"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Select download directory"
                    className="flex-1"
                    classNames={{
                      input: 'bg-surface1 text-text',
                      inputWrapper: 'bg-surface1 border-surface2',
                    }}
                    isReadOnly
                  />
                )}
              />
              <Button
                color="primary"
                onClick={handleSelectDownloadDirectory}
                className="shrink-0"
              >
                Browse
              </Button>
            </div>
            {errors.downloadDirectory && (
              <p className="text-xs text-red mt-1">
                {errors.downloadDirectory.message}
              </p>
            )}
            {watch('downloadDirectory') && (
              <p className="text-xs text-subtext0 mt-1">
                Current: {watch('downloadDirectory')}
              </p>
            )}
          </div>

          {/* Temp Directory */}
          <div>
            <label className="text-sm font-semibold text-text mb-2 block">
              Temporary Directory
            </label>
            <div className="flex gap-2">
              <Controller
                name="tempDirectory"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Select temporary directory"
                    className="flex-1"
                    classNames={{
                      input: 'bg-surface1 text-text',
                      inputWrapper: 'bg-surface1 border-surface2',
                    }}
                    isReadOnly
                  />
                )}
              />
              <Button
                color="primary"
                onClick={handleSelectTempDirectory}
                className="shrink-0"
              >
                Browse
              </Button>
            </div>
            {errors.tempDirectory && (
              <p className="text-xs text-red mt-1">
                {errors.tempDirectory.message}
              </p>
            )}
            {watch('tempDirectory') && (
              <p className="text-xs text-subtext0 mt-1">
                Current: {watch('tempDirectory')}
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
