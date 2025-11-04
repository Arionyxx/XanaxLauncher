import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Input,
  Select,
  SelectItem,
  Switch,
  Card,
  CardBody,
} from '@nextui-org/react'
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
      <Card className="bg-surface0 border-surface1">
        <CardBody className="space-y-6">
          {/* Auto-start on System Boot */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-semibold text-text block">
                Auto-start on System Boot
              </label>
              <p className="text-xs text-subtext0 mt-1">
                Automatically launch the application when your system starts (UI
                only - not implemented)
              </p>
            </div>
            <Controller
              name="autoStartEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value}
                  onValueChange={(checked) => {
                    field.onChange(checked)
                    handleAutoStartChange(checked)
                  }}
                  classNames={{
                    wrapper: 'bg-surface2',
                  }}
                  isDisabled={isSaving}
                />
              )}
            />
          </div>

          {/* Minimize to Tray on Close */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-semibold text-text block">
                Minimize to Tray on Close
              </label>
              <p className="text-xs text-subtext0 mt-1">
                Keep the application running in the system tray when closed
              </p>
            </div>
            <Controller
              name="minimizeToTray"
              control={control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value}
                  onValueChange={(checked) => {
                    field.onChange(checked)
                    handleMinimizeToTrayChange(checked)
                  }}
                  classNames={{
                    wrapper: 'bg-surface2',
                  }}
                  isDisabled={isSaving}
                />
              )}
            />
          </div>

          {/* Bandwidth Limit */}
          <div>
            <label className="text-sm font-semibold text-text mb-2 block">
              Bandwidth Limit
            </label>
            <p className="text-xs text-subtext0 mb-3">
              Set a maximum download speed limit (0 = unlimited)
            </p>
            <div className="flex gap-2">
              <Controller
                name="bandwidthLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
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
                    classNames={{
                      input: 'bg-surface1 text-text',
                      inputWrapper: 'bg-surface1 border-surface2',
                    }}
                  />
                )}
              />
              <Controller
                name="bandwidthUnit"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      field.onChange(value)
                      handleBandwidthUnitChange(value)
                    }}
                    placeholder="Unit"
                    className="w-32"
                    classNames={{
                      trigger: 'bg-surface1 border-surface2',
                      value: 'text-text',
                    }}
                  >
                    {bandwidthUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            {errors.bandwidthLimit && (
              <p className="text-xs text-red mt-1">
                {errors.bandwidthLimit.message}
              </p>
            )}
            {watch('bandwidthLimit') > 0 && (
              <p className="text-xs text-subtext0 mt-1">
                Current limit: {watch('bandwidthLimit')}{' '}
                {watch('bandwidthUnit')}
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
