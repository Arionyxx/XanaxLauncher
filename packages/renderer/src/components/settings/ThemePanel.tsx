import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardBody, CardHeader, Switch, Button } from '@nextui-org/react'
import {
  ThemeSettings,
  themeSettingsSchema,
  catppuccinFlavors,
  catppuccinAccents,
  CatppuccinFlavor,
  CatppuccinAccent,
} from '@/types/settings'
import { flavors } from '@catppuccin/palette'

interface ThemePanelProps {
  settings: ThemeSettings
  onUpdate: (settings: Partial<ThemeSettings>) => Promise<void>
}

const flavorLabels: Record<CatppuccinFlavor, string> = {
  latte: 'Latte (Light)',
  frappe: 'Frappé (Dark)',
  macchiato: 'Macchiato (Darker)',
  mocha: 'Mocha (Darkest)',
}

const accentLabels: Record<CatppuccinAccent, string> = {
  rosewater: 'Rosewater',
  flamingo: 'Flamingo',
  pink: 'Pink',
  mauve: 'Mauve',
  red: 'Red',
  maroon: 'Maroon',
  peach: 'Peach',
  yellow: 'Yellow',
  green: 'Green',
  teal: 'Teal',
  sky: 'Sky',
  sapphire: 'Sapphire',
  blue: 'Blue',
  lavender: 'Lavender',
}

export function ThemePanel({ settings, onUpdate }: ThemePanelProps) {
  const [isSaving, setIsSaving] = useState(false)

  const { control } = useForm<ThemeSettings>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: settings,
    mode: 'onChange',
  })

  const handleFlavorChange = async (flavor: CatppuccinFlavor) => {
    try {
      setIsSaving(true)
      await onUpdate({ flavor })
    } catch (error) {
      console.error('Failed to update theme flavor:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAccentChange = async (accent: CatppuccinAccent) => {
    try {
      setIsSaving(true)
      await onUpdate({ accentColor: accent })
    } catch (error) {
      console.error('Failed to update accent color:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompactModeChange = async (checked: boolean) => {
    try {
      setIsSaving(true)
      await onUpdate({ compactMode: checked })
    } catch (error) {
      console.error('Failed to update compact mode:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Get current flavor colors
  const currentFlavor = flavors[settings.flavor]

  return (
    <div className="space-y-6">
      {/* Flavor Selection */}
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-text">Theme Flavor</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catppuccinFlavors.map((flavor) => {
              const flavorColors = flavors[flavor].colors
              const isSelected = settings.flavor === flavor

              return (
                <button
                  key={flavor}
                  onClick={() => handleFlavorChange(flavor)}
                  disabled={isSaving}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue bg-surface1'
                      : 'border-surface2 bg-surface1 hover:border-surface2 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text">
                      {flavorLabels[flavor]}
                    </span>
                    {isSelected && (
                      <span className="text-blue text-sm">✓ Active</span>
                    )}
                  </div>
                  <div className="flex gap-1 h-6 rounded overflow-hidden">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: flavorColors.base.hex }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: flavorColors.blue.hex }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: flavorColors.mauve.hex }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: flavorColors.green.hex }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: flavorColors.peach.hex }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Accent Color Selection */}
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-text">Accent Color</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-7 gap-2">
            {catppuccinAccents.map((accent) => {
              const color = currentFlavor.colors[accent].hex
              const isSelected = settings.accentColor === accent

              return (
                <button
                  key={accent}
                  onClick={() => handleAccentChange(accent)}
                  disabled={isSaving}
                  title={accentLabels[accent]}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-text scale-110'
                      : 'border-transparent hover:border-overlay0'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <span className="text-white drop-shadow-lg">✓</span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-subtext0 mt-3">
            Selected: {accentLabels[settings.accentColor]}
          </p>
        </CardBody>
      </Card>

      {/* Compact Mode */}
      <Card className="bg-surface0 border-surface1">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-semibold text-text block">
                Compact Mode
              </label>
              <p className="text-xs text-subtext0 mt-1">
                Reduce spacing and padding throughout the interface
              </p>
            </div>
            <Controller
              name="compactMode"
              control={control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value}
                  onValueChange={(checked) => {
                    field.onChange(checked)
                    handleCompactModeChange(checked)
                  }}
                  classNames={{
                    wrapper: 'bg-surface2',
                  }}
                  isDisabled={isSaving}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Preview Area */}
      <Card className="bg-surface0 border-surface1">
        <CardHeader>
          <h3 className="text-lg font-semibold text-text">Preview</h3>
        </CardHeader>
        <CardBody>
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: currentFlavor.colors.base.hex }}
          >
            <div className="space-y-4">
              <div>
                <h4
                  className="text-lg font-semibold mb-2"
                  style={{ color: currentFlavor.colors.text.hex }}
                >
                  Theme Preview
                </h4>
                <p style={{ color: currentFlavor.colors.subtext0.hex }}>
                  This is how text will appear in the{' '}
                  {flavorLabels[settings.flavor]} theme with{' '}
                  {accentLabels[settings.accentColor]} accent color.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  style={{
                    backgroundColor:
                      currentFlavor.colors[settings.accentColor].hex,
                    color: currentFlavor.colors.crust.hex,
                  }}
                >
                  Primary Button
                </Button>
                <Button
                  size="sm"
                  style={{
                    backgroundColor: currentFlavor.colors.surface1.hex,
                    color: currentFlavor.colors.text.hex,
                  }}
                >
                  Secondary Button
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['blue', 'green', 'yellow', 'red', 'mauve'].map((color) => (
                  <div
                    key={color}
                    className="w-12 h-12 rounded"
                    style={{
                      backgroundColor:
                        currentFlavor.colors[
                          color as keyof typeof currentFlavor.colors
                        ].hex,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
