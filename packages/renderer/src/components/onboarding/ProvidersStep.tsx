import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Input, Card, CardBody } from '@nextui-org/react'
import { useToast } from '@/hooks/use-toast'
import { TorBoxProvider } from '@/services/providers/torbox/torbox-provider'

interface ProvidersStepProps {
  onNext: (data: { torboxToken?: string; realDebridToken?: string }) => void
  onBack: () => void
  initialTorboxToken?: string
  initialRealDebridToken?: string
}

export function ProvidersStep({
  onNext,
  onBack,
  initialTorboxToken,
  initialRealDebridToken,
}: ProvidersStepProps) {
  const { toast } = useToast()
  const [torboxToken, setTorboxToken] = useState(initialTorboxToken || '')
  const [realDebridToken, setRealDebridToken] = useState(
    initialRealDebridToken || ''
  )
  const [isTesting, setIsTesting] = useState(false)

  const handleTestTorBox = async () => {
    if (!torboxToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a TorBox API token",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const provider = new TorBoxProvider({ apiToken: torboxToken.trim() })
      const result = await provider.testConnection()

      if (result.success) {
        toast.success('TorBox connection successful!')
      } else {
        toast.error(`TorBox test failed: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error('Failed to test TorBox connection')
      console.error('TorBox test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestRealDebrid = async () => {
    if (!realDebridToken.trim()) {
      toast.error('Please enter a Real-Debrid API token')
      return
    }

    setIsTesting(true)
    try {
      toast.info('Real-Debrid provider not yet implemented')
    } catch (error) {
      toast.error('Failed to test Real-Debrid connection')
      console.error('Real-Debrid test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleContinue = () => {
    onNext({
      torboxToken: torboxToken.trim() || undefined,
      realDebridToken: realDebridToken.trim() || undefined,
    })
  }

  const handleSkip = () => {
    onNext({ torboxToken: undefined, realDebridToken: undefined })
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
        <h2 className="text-3xl font-bold text-text">Configure Providers</h2>
        <p className="text-subtext0">
          Connect to download providers for faster content delivery
        </p>
        <span className="inline-block bg-yellow/20 text-yellow px-3 py-1 rounded-full text-sm">
          Optional - You can configure these later in Settings
        </span>
      </div>

      <div className="space-y-4">
        <Card className="bg-surface0 border-surface1">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">TorBox</h3>
                <p className="text-sm text-subtext0">
                  Premium torrent and usenet service
                </p>
              </div>
            </div>
            <Input
              type="password"
              label="API Token"
              placeholder="Enter your TorBox API token"
              value={torboxToken}
              onValueChange={setTorboxToken}
              classNames={{
                inputWrapper: 'bg-surface1 border-surface2',
              }}
            />
            <Button
              color="secondary"
              variant="flat"
              onPress={handleTestTorBox}
              isLoading={isTesting}
              isDisabled={!torboxToken.trim()}
              fullWidth
            >
              Test Connection
            </Button>
          </CardBody>
        </Card>

        <Card className="bg-surface0 border-surface1">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">
                  Real-Debrid
                </h3>
                <p className="text-sm text-subtext0">
                  Multi-hoster unrestricted downloader
                </p>
              </div>
            </div>
            <Input
              type="password"
              label="API Token"
              placeholder="Enter your Real-Debrid API token"
              value={realDebridToken}
              onValueChange={setRealDebridToken}
              classNames={{
                inputWrapper: 'bg-surface1 border-surface2',
              }}
            />
            <Button
              color="secondary"
              variant="flat"
              onPress={handleTestRealDebrid}
              isLoading={isTesting}
              isDisabled={!realDebridToken.trim()}
              fullWidth
            >
              Test Connection
            </Button>
          </CardBody>
        </Card>

        <div className="bg-blue/20 border border-blue/50 rounded-lg p-3">
          <p className="text-sm text-blue">
            💡 You'll need an active subscription with these services. Visit
            their websites to sign up and get your API tokens.
          </p>
        </div>
      </div>

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
