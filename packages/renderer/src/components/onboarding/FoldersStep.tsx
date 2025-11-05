import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSettings } from '@/hooks/useSettings'

interface FoldersStepProps {
  onNext: (data: { downloadDir: string; tempDir: string }) => void
  onBack: () => void
  initialDownloadDir?: string
  initialTempDir?: string
}

export function FoldersStep({
  onNext,
  onBack,
  initialDownloadDir,
  initialTempDir,
}: FoldersStepProps) {
  const { settings } = useSettings()
  const [downloadDir, setDownloadDir] = useState(
    initialDownloadDir || settings.general.downloadDirectory
  )
  const [tempDir, setTempDir] = useState(
    initialTempDir || settings.general.tempDirectory
  )
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSelectDownloadDir = async () => {
    if (isSelecting) return
    setIsSelecting(true)

    try {
      const result = await window.api.selectFolder()
      if (result && !result.canceled && result.filePaths[0]) {
        setDownloadDir(result.filePaths[0])
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleSelectTempDir = async () => {
    if (isSelecting) return
    setIsSelecting(true)

    try {
      const result = await window.api.selectFolder()
      if (result && !result.canceled && result.filePaths[0]) {
        setTempDir(result.filePaths[0])
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleContinue = () => {
    onNext({ downloadDir, tempDir })
  }

  const handleSkip = () => {
    onNext({
      downloadDir: settings.general.downloadDirectory,
      tempDir: settings.general.tempDirectory,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Choose Your Folders
        </h2>
        <p className="text-muted-foreground">
          Select where you want to store downloads and temporary files
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📥</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Download Directory
                </h3>
                <p className="text-sm text-muted-foreground">
                  Where completed downloads will be saved
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-foreground font-mono text-sm">
              {downloadDir}
            </div>
            <Button
              onClick={handleSelectDownloadDir}
              disabled={isSelecting}
              className="w-full"
            >
              {isSelecting ? 'Selecting...' : 'Choose Download Folder'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Temp Directory
                </h3>
                <p className="text-sm text-muted-foreground">
                  For temporary files during downloads
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-foreground font-mono text-sm">
              {tempDir}
            </div>
            <Button
              onClick={handleSelectTempDir}
              disabled={isSelecting}
              className="w-full"
            >
              {isSelecting ? 'Selecting...' : 'Choose Temp Folder'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip (Use Defaults)
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </motion.div>
  )
}
