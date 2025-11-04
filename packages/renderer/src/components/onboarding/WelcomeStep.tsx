import { motion } from 'framer-motion'
import { Button } from '@nextui-org/react'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center space-y-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-8xl"
      >
        🎮
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold text-text">
          Welcome to Media Manager
        </h1>
        <p className="text-xl text-subtext0 max-w-2xl">
          Your all-in-one solution for managing and downloading media content.
          Let's get you set up in just a few steps.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-4 max-w-md"
      >
        <div className="bg-surface0 rounded-lg p-4 text-left">
          <p className="text-text">✨ Browse and search your media catalog</p>
        </div>
        <div className="bg-surface0 rounded-lg p-4 text-left">
          <p className="text-text">⚡ Fast downloads with provider integration</p>
        </div>
        <div className="bg-surface0 rounded-lg p-4 text-left">
          <p className="text-text">🎨 Beautiful Catppuccin themed interface</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button size="lg" color="primary" onPress={onNext} className="px-12">
          Get Started
        </Button>
      </motion.div>
    </motion.div>
  )
}
