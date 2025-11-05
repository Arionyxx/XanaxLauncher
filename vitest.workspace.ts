import { defineWorkspace } from 'vitest/config'

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
