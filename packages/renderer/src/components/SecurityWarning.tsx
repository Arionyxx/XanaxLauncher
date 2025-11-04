'use client'

import { motion } from 'framer-motion'
import { Card, CardBody } from '@nextui-org/react'

interface SecurityWarningProps {
  url: string
  type?: 'http' | 'untrusted'
}

export function SecurityWarning({ url, type = 'http' }: SecurityWarningProps) {
  const isHttp = url.startsWith('http:')
  const isHttps = url.startsWith('https:')

  if (!isHttp && type === 'http') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-yellow/10 border border-yellow/30">
        <CardBody className="flex flex-row gap-3 items-start">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow mb-1">
              {type === 'http' ? 'Insecure Connection' : 'Untrusted Source'}
            </h4>
            <p className="text-sm text-subtext0">
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
        </CardBody>
      </Card>
    </motion.div>
  )
}
