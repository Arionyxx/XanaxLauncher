import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { NextUIProvider } from '@nextui-org/react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

export const waitFor = async (
  callback: () => void | Promise<void>,
  options: { timeout?: number; interval?: number } = {}
) => {
  const { timeout = 5000, interval = 50 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      await callback()
      return
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  throw new Error(`Timeout after ${timeout}ms`)
}

export const mockIndexedDB = () => {
  const store: Record<string, any> = {}

  return {
    get: vi.fn((key: string) => Promise.resolve(store[key])),
    set: vi.fn((key: string, value: any) =>
      Promise.resolve((store[key] = value))
    ),
    delete: vi.fn((key: string) => {
      delete store[key]
      return Promise.resolve()
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
      return Promise.resolve()
    }),
    keys: vi.fn(() => Promise.resolve(Object.keys(store))),
  }
}

export const mockElectronAPI = () => ({
  selectFolder: vi.fn(() => Promise.resolve('/mock/folder')),
  getSettings: vi.fn(() => Promise.resolve({})),
  setSettings: vi.fn(() => Promise.resolve()),
  getAppVersion: vi.fn(() =>
    Promise.resolve({
      version: '0.1.0',
      electronVersion: '28.2.0',
      nodeVersion: '18.0.0',
    })
  ),
})
