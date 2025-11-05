'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface SecurityWarningProps {
  url: string
  type?: 'http' | 'untrusted'
}

export function SecurityWarning({ url, type = 'http' }: SecurityWarningProps) {
  const isHttp = url.startsWith('http:')

  if (!isHttp && type === 'http') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="flex flex-row gap-3 items-start pt-6">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
              {type === 'http' ? 'Insecure Connection' : 'Untrusted Source'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {type === 'http' ? (
                <>
                  This source uses an insecure HTTP connection. Your data may be
                  visible to others. Consider using HTTPS sources when
                  available.
                </>
              ) : (
                <>
                  This source is not verified. Only add sources from providers
                  you trust. Always verify URLs before adding them.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
