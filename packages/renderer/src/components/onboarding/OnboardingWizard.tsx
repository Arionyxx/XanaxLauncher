import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { Modal, ModalContent, Progress } from '@nextui-org/react'
import { toast } from 'sonner'
import { useOnboarding, OnboardingData } from '@/hooks/useOnboarding'
import { useSettings } from '@/hooks/useSettings'
import { WelcomeStep } from './WelcomeStep'
import { FoldersStep } from './FoldersStep'
import { SourcesStep } from './SourcesStep'
import { ProvidersStep } from './ProvidersStep'
import { CompleteStep } from './CompleteStep'
import { db } from '@/db/db'

const TOTAL_STEPS = 5

export function OnboardingWizard() {
  const router = useRouter()
  const { currentStep, data, saveProgress, completeOnboarding } =
    useOnboarding()
  const { updateGeneralSettings, updateIntegrationsSettings } = useSettings()

  const [step, setStep] = useState(currentStep)
  const [stepData, setStepData] = useState<OnboardingData>(data)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step > 0 && step < TOTAL_STEPS - 1) {
        handleSkipAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step])

  const handleNext = useCallback(
    async (newData: Partial<OnboardingData> = {}) => {
      const updatedData = { ...stepData, ...newData }
      setStepData(updatedData)

      const nextStep = step + 1
      setStep(nextStep)

      if (nextStep < TOTAL_STEPS - 1) {
        await saveProgress(nextStep, updatedData)
      }
    },
    [step, stepData, saveProgress]
  )

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    }
  }, [step])

  const handleSkipAll = useCallback(() => {
    setStep(TOTAL_STEPS - 1)
  }, [])

  const handleFinish = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      if (stepData.downloadDir || stepData.tempDir) {
        await updateGeneralSettings({
          downloadDirectory: stepData.downloadDir,
          tempDirectory: stepData.tempDir,
        })
      }

      if (stepData.torboxToken || stepData.realDebridToken) {
        await updateIntegrationsSettings({
          torboxApiToken: stepData.torboxToken || '',
          realDebridApiToken: stepData.realDebridToken || '',
        })
      }

      if (stepData.sourceUrl) {
        try {
          await db.sources.add({
            id: crypto.randomUUID(),
            name: 'Onboarding Source',
            url: stepData.sourceUrl,
            autoSync: true,
            lastSyncAt: null,
            status: 'never_synced',
            entryCount: 0,
            data: null,
          })
          toast.success('Source added successfully')
        } catch (error) {
          console.error('Failed to add source:', error)
          toast.error('Failed to add source')
        }
      }

      await completeOnboarding()
      toast.success('Welcome to Media Manager!')

      router.push('/')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsProcessing(false)
    }
  }, [
    isProcessing,
    stepData,
    updateGeneralSettings,
    updateIntegrationsSettings,
    completeOnboarding,
    router,
  ])

  const progress = ((step + 1) / TOTAL_STEPS) * 100

  const summary = {
    hasCustomFolders: !!(stepData.downloadDir || stepData.tempDir),
    hasSource: !!stepData.sourceUrl,
    hasTorBox: !!stepData.torboxToken,
    hasRealDebrid: !!stepData.realDebridToken,
  }

  return (
    <Modal
      isOpen={true}
      isDismissable={false}
      hideCloseButton
      size="5xl"
      classNames={{
        base: 'bg-mantle',
        backdrop: 'bg-crust/80',
      }}
    >
      <ModalContent className="p-8">
        <div className="space-y-6">
          {step < TOTAL_STEPS - 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-subtext0">
                  Step {step + 1} of {TOTAL_STEPS}
                </span>
                <span className="text-subtext0">{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                classNames={{
                  indicator: 'bg-blue',
                  track: 'bg-surface0',
                }}
              />
            </div>
          )}

          <div className="min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <WelcomeStep key="welcome" onNext={() => handleNext()} />
              )}
              {step === 1 && (
                <FoldersStep
                  key="folders"
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  initialDownloadDir={stepData.downloadDir}
                  initialTempDir={stepData.tempDir}
                />
              )}
              {step === 2 && (
                <SourcesStep
                  key="sources"
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  initialSourceUrl={stepData.sourceUrl}
                />
              )}
              {step === 3 && (
                <ProvidersStep
                  key="providers"
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  initialTorboxToken={stepData.torboxToken}
                  initialRealDebridToken={stepData.realDebridToken}
                />
              )}
              {step === 4 && (
                <CompleteStep
                  key="complete"
                  onFinish={handleFinish}
                  summary={summary}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
