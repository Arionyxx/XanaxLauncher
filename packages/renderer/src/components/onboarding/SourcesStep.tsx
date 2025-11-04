import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Input, Card, CardBody } from '@nextui-org/react'
import { z } from 'zod'

interface SourcesStepProps {
  onNext: (data: { sourceUrl?: string }) => void
  onBack: () => void
  initialSourceUrl?: string
}

const urlSchema = z.string().url('Please enter a valid URL')

export function SourcesStep({
  onNext,
  onBack,
  initialSourceUrl,
}: SourcesStepProps) {
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '')
  const [error, setError] = useState('')

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setError('')
      return true
    }

    try {
      urlSchema.parse(url)
      setError('')
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      }
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setSourceUrl(value)
    if (value.trim()) {
      validateUrl(value)
    } else {
      setError('')
    }
  }

  const handleContinue = () => {
    if (sourceUrl.trim() && !validateUrl(sourceUrl)) {
      return
    }
    onNext({ sourceUrl: sourceUrl.trim() || undefined })
  }

  const handleSkip = () => {
    onNext({ sourceUrl: undefined })
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
        <h2 className="text-3xl font-bold text-text">Add a Content Source</h2>
        <p className="text-subtext0">
          Sources provide the catalog of available content
        </p>
        <span className="inline-block bg-yellow/20 text-yellow px-3 py-1 rounded-full text-sm">
          Optional - You can add sources later in Settings
        </span>
      </div>

      <Card className="bg-surface0 border-surface1">
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📡</span>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  What are sources?
                </h3>
                <p className="text-sm text-subtext0 mt-1">
                  Sources are JSON feeds that list available content. They help
                  you discover and browse items you can download.
                </p>
              </div>

              <Input
                label="Source URL"
                placeholder="https://example.com/feed.json"
                value={sourceUrl}
                onValueChange={handleUrlChange}
                isInvalid={!!error}
                errorMessage={error}
                classNames={{
                  inputWrapper: 'bg-surface1 border-surface2',
                }}
              />

              <div className="bg-red/20 border border-red/50 rounded-lg p-3">
                <p className="text-sm text-red font-semibold">⚠️ Legal Notice</p>
                <p className="text-xs text-red/90 mt-1">
                  Only add sources that provide legally authorized content. You
                  are responsible for ensuring your use complies with
                  applicable laws.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between gap-4 pt-4">
        <Button variant="flat" onPress={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="light" onPress={handleSkip}>
            Skip for Now
          </Button>
          <Button color="primary" onPress={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
