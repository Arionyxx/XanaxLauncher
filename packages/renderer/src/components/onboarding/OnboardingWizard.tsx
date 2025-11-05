'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/hooks/useOnboarding'
import { toast } from 'sonner'

export function OnboardingWizard() {
  const router = useRouter()
  const { completeOnboarding } = useOnboarding()
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to XanaxLauncher',
      description:
        'A modern media management application built with Electron, Next.js, and DaisyUI.',
      icon: '🚀',
    },
    {
      title: 'Getting Started',
      description:
        'Configure your settings, add media sources, and start downloading!',
      icon: '⚙️',
    },
    {
      title: 'Ready to Go!',
      description:
        'You\'re all set! Let\'s explore your new media manager.',
      icon: '✨',
    },
  ]

  const currentStep = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      completeOnboarding()
      toast.success('Welcome to XanaxLauncher!')
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="text-8xl mb-8">{currentStep.icon}</div>
          <h1 className="text-5xl font-bold mb-4">{currentStep.title}</h1>
          <p className="text-lg mb-8">{currentStep.description}</p>

          <div className="flex gap-2 items-center justify-center mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full ${
                  index === step ? 'bg-primary' : 'bg-base-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button className="btn btn-ghost" onClick={handleSkip}>
              Skip
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
