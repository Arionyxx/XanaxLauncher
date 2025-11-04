import { setupServer } from 'msw/node'
import { torboxHandlers } from './torbox'
import { realDebridHandlers } from './realdebrid'

export const server = setupServer(...torboxHandlers, ...realDebridHandlers)
