import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'renderer',
      root: './packages/renderer',
      environment: 'jsdom',
    },
  },
])
