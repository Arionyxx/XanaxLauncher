import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleLanguageChange(value)
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger id="language" className="max-w-xs">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {languageLabels[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.language && (
              <p className="text-xs text-destructive mt-1">
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Download Directory */}
          <div className="space-y-2">
            <Label htmlFor="download-dir">Download Directory</Label>
            <div className="flex gap-2">
              <Controller
                name="downloadDirectory"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="download-dir"
                    placeholder="Select download directory"
                    className="flex-1"
                    readOnly
                  />
                )}
              />
              <Button onClick={handleSelectDownloadDirectory} className="shrink-0">
                Browse
              </Button>
            </div>
            {errors.downloadDirectory && (
              <p className="text-xs text-destructive mt-1">
                {errors.downloadDirectory.message}
              </p>
            )}
            {watch('downloadDirectory') && (
              <p className="text-xs text-muted-foreground mt-1">
                Current: {watch('downloadDirectory')}
              </p>
            )}
          </div>

          {/* Temp Directory */}
          <div className="space-y-2">
            <Label htmlFor="temp-dir">Temporary Directory</Label>
            <div className="flex gap-2">
              <Controller
                name="tempDirectory"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="temp-dir"
                    placeholder="Select temporary directory"
                    className="flex-1"
                    readOnly
                  />
                )}
              />
              <Button onClick={handleSelectTempDirectory} className="shrink-0">
                Browse
              </Button>
            </div>
            {errors.tempDirectory && (
              <p className="text-xs text-destructive mt-1">
                {errors.tempDirectory.message}
              </p>
            )}
            {watch('tempDirectory') && (
              <p className="text-xs text-muted-foreground mt-1">
                Current: {watch('tempDirectory')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
