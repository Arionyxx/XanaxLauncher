import { useState, useEffect, useCallback } from 'react'
import { db } from '@/db/db'
import type { OnboardingState } from '@/db/schema'

const ONBOARDING_KEY = 'onboarding'

export interface OnboardingData {
  downloadDir?: string
  tempDir?: string
  sourceUrl?: string
  torboxToken?: string
  realDebridToken?: string
}

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        setIsLoading(true)
        const state = await db.onboarding.get(ONBOARDING_KEY)

        if (state) {
          setIsCompleted(state.completed)
          setCurrentStep(state.currentStep)
          setData(state.data)
        } else {
          setIsCompleted(false)
          setCurrentStep(0)
          setData({})
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err)
        setIsCompleted(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadOnboardingState()
  }, [])

  const saveProgress = useCallback(
    async (step: number, partialData: Partial<OnboardingData>) => {
      const newData = { ...data, ...partialData }
      setCurrentStep(step)
      setData(newData)

      const state: OnboardingState = {
        key: ONBOARDING_KEY,
        completed: false,
        currentStep: step,
        data: newData,
        updatedAt: Date.now(),
      }

      await db.onboarding.put(state)
    },
    [data]
  )

  const completeOnboarding = useCallback(async () => {
    setIsCompleted(true)

    const state: OnboardingState = {
      key: ONBOARDING_KEY,
      completed: true,
      currentStep: 5,
      data: {},
      updatedAt: Date.now(),
    }

    await db.onboarding.put(state)
  }, [])

  const resetOnboarding = useCallback(async () => {
    setIsCompleted(false)
    setCurrentStep(0)
    setData({})

    await db.onboarding.delete(ONBOARDING_KEY)
  }, [])

  return {
    isCompleted,
    isLoading,
    currentStep,
    data,
    saveProgress,
    completeOnboarding,
    resetOnboarding,
  }
}
