'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Rocket,
  Settings,
  Sparkles,
  ArrowRight,
  SkipForward,
} from 'lucide-react'

export function OnboardingWizard() {
  const router = useRouter()
  const { completeOnboarding } = useOnboarding()
  const { toast } = useToast()
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to XanaxLauncher',
      description:
        'A modern media management application built with Electron and Next.js. Experience the beautiful new interface with powerful features.',
      icon: Rocket,
      color: 'text-blue-500',
    },
    {
      title: 'Getting Started',
      description:
        'Configure your settings, add media sources, and start downloading your favorite content with ease.',
      icon: Settings,
      color: 'text-green-500',
    },
    {
      title: 'Ready to Go!',
      description:
        "You&apos;re all set! Explore your new media manager with a stunning dark interface and smooth animations.",
      icon: Sparkles,
      color: 'text-purple-500',
    },
  ]

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      completeOnboarding()
      toast({
        title: 'Welcome to XanaxLauncher! 🎉',
        description: 'Your media manager is ready to use.',
      })
      // Navigate to home page after completion
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    toast({
      title: 'Onboarding skipped',
      description: 'You can always access settings later.',
    })
    // Navigate to home page after skipping
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto">
              <div
                className={`w-24 h-24 rounded-2xl bg-muted flex items-center justify-center ${currentStep.color}`}
              >
                <currentStep.icon className="w-12 h-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {currentStep.title}
            </CardTitle>
            <CardDescription className="text-lg leading-relaxed text-muted-foreground">
              {currentStep.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Indicators */}
            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === step
                      ? 'w-8 bg-primary'
                      : index < step
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {step < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Get Started
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Version 1.0.0 • Built with ❤️ using modern web technologies</p>
        </div>
      </div>
    </div>
  )
}
