import { ReactNode } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { OnboardingWizard } from './OnboardingWizard'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OnboardingGateProps {
  children: ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isCompleted, isLoading } = useOnboarding()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-8 border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
              </div>
              <div className="space-y-2 pt-4">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!isCompleted) {
    return <OnboardingWizard />
  }

  return <>{children}</>
}