import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BehaviorSettings,
  behaviorSettingsSchema,
  bandwidthUnits,
} from '@/types/settings'

interface BehaviorPanelProps {
  settings: BehaviorSettings
  onUpdate: (settings: Partial<BehaviorSettings>) => Promise<void>
}

export function BehaviorPanel({ settings, onUpdate }: BehaviorPanelProps) {
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    formState: { errors },
    watch,
  } = useForm<BehaviorSettings>({
    resolver: zodResolver(behaviorSettingsSchema),
    defaultValues: settings,
    mode: 'onChange',
  })

  const handleAutoStartChange = async (checked: boolean) => {
    try {
      setIsSaving(true)
      await onUpdate({ autoStartEnabled: checked })
    } catch (error) {
      console.error('Failed to update auto-start setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMinimizeToTrayChange = async (checked: boolean) => {
    try {
      setIsSaving(true)
      await onUpdate({ minimizeToTray: checked })
    } catch (error) {
      console.error('Failed to update minimize to tray setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBandwidthLimitChange = async (value: string) => {
    try {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        await onUpdate({ bandwidthLimit: numValue })
      }
    } catch (error) {
      console.error('Failed to update bandwidth limit:', error)
    }
  }

  const handleBandwidthUnitChange = async (value: string) => {
    try {
      await onUpdate({ bandwidthUnit: value as 'KB/s' | 'MB/s' })
    } catch (error) {
      console.error('Failed to update bandwidth unit:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Auto-start on System Boot */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Auto-start on System Boot</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically launch the application when your system starts (UI
                only - not implemented)
              </p>
            </div>
            <Controller
              name="autoStartEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    handleAutoStartChange(checked)
                  }}
                  disabled={isSaving}
                />
              )}
            />
          </div>

          {/* Minimize to Tray on Close */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Minimize to Tray on Close</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Keep the application running in the system tray when closed
              </p>
            </div>
            <Controller
              name="minimizeToTray"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    handleMinimizeToTrayChange(checked)
                  }}
                  disabled={isSaving}
                />
              )}
            />
          </div>

          {/* Bandwidth Limit */}
          <div className="space-y-2">
            <Label htmlFor="bandwidth-limit">Bandwidth Limit</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Set a maximum download speed limit (0 = unlimited)
            </p>
            <div className="flex gap-2">
              <Controller
                name="bandwidthLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="bandwidth-limit"
                    type="number"
                    min={0}
                    step={0.1}
                    value={field.value.toString()}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      handleBandwidthLimitChange(e.target.value)
                    }}
                    placeholder="0"
                    className="flex-1 max-w-xs"
                  />
                )}
              />
              <Controller
                name="bandwidthUnit"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleBandwidthUnitChange(value)
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {bandwidthUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.bandwidthLimit && (
              <p className="text-xs text-destructive mt-1">
                {errors.bandwidthLimit.message}
              </p>
            )}
            {watch('bandwidthLimit') > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Current limit: {watch('bandwidthLimit')} {watch('bandwidthUnit')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
