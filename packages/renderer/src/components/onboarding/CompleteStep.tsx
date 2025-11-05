import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CompleteStepProps {
  onFinish: () => void
  summary: {
    hasCustomFolders: boolean
    hasSource: boolean
    hasTorBox: boolean
    hasRealDebrid: boolean
  }
}

export function CompleteStep({ onFinish, summary }: CompleteStepProps) {
  useEffect(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#89b4fa', '#cba6f7', '#a6e3a1', '#f9e2af', '#fab387']

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const confetti = () => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) return

      const particleCount = 3

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'fixed'
        particle.style.width = '10px'
        particle.style.height = '10px'
        particle.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)]
        particle.style.left = randomInRange(0, window.innerWidth) + 'px'
        particle.style.top = '-20px'
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'
        particle.style.zIndex = '9999'
        particle.style.opacity = '1'

        document.body.appendChild(particle)

        const xVelocity = randomInRange(-2, 2)
        const yVelocity = randomInRange(3, 8)
        let x = parseFloat(particle.style.left)
        let y = parseFloat(particle.style.top)
        let opacity = 1

        const animate = () => {
          x += xVelocity
          y += yVelocity
          opacity -= 0.01

          particle.style.left = x + 'px'
          particle.style.top = y + 'px'
          particle.style.opacity = opacity.toString()

          if (opacity > 0 && y < window.innerHeight) {
            requestAnimationFrame(animate)
          } else {
            particle.remove()
          }
        }

        animate()
      }

      requestAnimationFrame(confetti)
    }

    confetti()
  }, [])

  const configuredItems = [
    summary.hasCustomFolders && '✓ Custom folders configured',
    summary.hasSource && '✓ Content source added',
    summary.hasTorBox && '✓ TorBox provider configured',
    summary.hasRealDebrid && '✓ Real-Debrid provider configured',
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-8xl"
      >
        🎉
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold text-foreground">You're All Set!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Media Manager is ready to use. Start browsing your catalog and
          downloading content.
        </p>
      </motion.div>

      {configuredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="space-y-2 pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Configuration Summary
              </h3>
              {configuredItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                >
                  <span>{item}</span>
                </div>
              ))}
              {configuredItems.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Using default configuration. You can customize settings
                  anytime from the Settings page.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <Button size="lg" onClick={onFinish} className="px-12">
          Start Using Media Manager
        </Button>
        <p className="text-sm text-muted-foreground">
          You can always adjust these settings later
        </p>
      </motion.div>
    </motion.div>
  )
}
