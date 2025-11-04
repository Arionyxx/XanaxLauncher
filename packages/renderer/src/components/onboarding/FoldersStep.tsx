import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, CardBody } from '@nextui-org/react'
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
        <h2 className="text-3xl font-bold text-text">Choose Your Folders</h2>
        <p className="text-subtext0">
          Select where you want to store downloads and temporary files
        </p>
      </div>

      <div className="space-y-4">
        <Card className="bg-surface0 border-surface1">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📥</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">
                  Download Directory
                </h3>
                <p className="text-sm text-subtext0">
                  Where completed downloads will be saved
                </p>
              </div>
            </div>
            <div className="bg-surface1 rounded-lg p-3 text-text font-mono text-sm">
              {downloadDir}
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={handleSelectDownloadDir}
              isLoading={isSelecting}
              fullWidth
            >
              Choose Download Folder
            </Button>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">
                  Temp Directory
                </h3>
                <p className="text-sm text-subtext0">
                  For temporary files during downloads
                </p>
              </div>
            </div>
            <div className="bg-surface1 rounded-lg p-3 text-text font-mono text-sm">
              {tempDir}
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={handleSelectTempDir}
              isLoading={isSelecting}
              fullWidth
            >
              Choose Temp Folder
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <Button variant="flat" onPress={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="light" onPress={handleSkip}>
            Skip (Use Defaults)
          </Button>
          <Button color="primary" onPress={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
