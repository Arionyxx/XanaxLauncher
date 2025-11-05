import { ReactNode } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { OnboardingWizard } from './OnboardingWizard'

interface OnboardingGateProps {
  children: ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isCompleted, isLoading } = useOnboarding()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!isCompleted) {
    return <OnboardingWizard />
  }

  return <>{children}</>
}
