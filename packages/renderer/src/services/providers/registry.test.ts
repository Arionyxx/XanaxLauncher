import { describe, it, expect, beforeEach } from 'vitest'
import { providerRegistry } from './registry'
import { Provider, ProviderError } from '@/types/provider'

const createMockProvider = (name: string): Provider => ({
  name,
  startJob: vi.fn(),
  getStatus: vi.fn(),
  cancel: vi.fn(),
  getFileLinks: vi.fn(),
  testConnection: vi.fn(),
})

describe('ProviderRegistry', () => {
  beforeEach(() => {
    providerRegistry.clear()
  })

  describe('registerProvider', () => {
    it('should register a new provider', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      expect(providerRegistry.hasProvider('test-provider')).toBe(true)
      expect(providerRegistry.size).toBe(1)
    })

    it('should throw error if provider name already exists', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      expect(() => {
        providerRegistry.registerProvider('test-provider', provider)
      }).toThrow("Provider 'test-provider' is already registered")
    })

    it('should throw error if provider name mismatch', () => {
      const provider = createMockProvider('provider-a')

      expect(() => {
        providerRegistry.registerProvider('provider-b', provider)
      }).toThrow(
        "Provider name mismatch: expected 'provider-b', got 'provider-a'"
      )
    })
  })

  describe('getProvider', () => {
    it('should return registered provider', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      const result = providerRegistry.getProvider('test-provider')
      expect(result).toBe(provider)
    })

    it('should throw ProviderError if provider not found', () => {
      expect(() => {
        providerRegistry.getProvider('non-existent')
      }).toThrow(ProviderError)

      expect(() => {
        providerRegistry.getProvider('non-existent')
      }).toThrow("Provider 'non-existent' not found")
    })
  })

  describe('hasProvider', () => {
    it('should return true for registered provider', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      expect(providerRegistry.hasProvider('test-provider')).toBe(true)
    })

    it('should return false for unregistered provider', () => {
      expect(providerRegistry.hasProvider('non-existent')).toBe(false)
    })
  })

  describe('listProviders', () => {
    it('should return empty array when no providers', () => {
      expect(providerRegistry.listProviders()).toEqual([])
    })

    it('should return all registered provider names', () => {
      const provider1 = createMockProvider('provider-1')
      const provider2 = createMockProvider('provider-2')

      providerRegistry.registerProvider('provider-1', provider1)
      providerRegistry.registerProvider('provider-2', provider2)

      const names = providerRegistry.listProviders()
      expect(names).toHaveLength(2)
      expect(names).toContain('provider-1')
      expect(names).toContain('provider-2')
    })
  })

  describe('getAllProviders', () => {
    it('should return all registered provider instances', () => {
      const provider1 = createMockProvider('provider-1')
      const provider2 = createMockProvider('provider-2')

      providerRegistry.registerProvider('provider-1', provider1)
      providerRegistry.registerProvider('provider-2', provider2)

      const providers = providerRegistry.getAllProviders()
      expect(providers).toHaveLength(2)
      expect(providers).toContain(provider1)
      expect(providers).toContain(provider2)
    })
  })

  describe('unregisterProvider', () => {
    it('should remove registered provider', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      const result = providerRegistry.unregisterProvider('test-provider')
      expect(result).toBe(true)
      expect(providerRegistry.hasProvider('test-provider')).toBe(false)
    })

    it('should return false for non-existent provider', () => {
      const result = providerRegistry.unregisterProvider('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all providers', () => {
      const provider1 = createMockProvider('provider-1')
      const provider2 = createMockProvider('provider-2')

      providerRegistry.registerProvider('provider-1', provider1)
      providerRegistry.registerProvider('provider-2', provider2)

      providerRegistry.clear()

      expect(providerRegistry.size).toBe(0)
      expect(providerRegistry.listProviders()).toEqual([])
    })
  })

  describe('getAvailableProviders', () => {
    it('should return same as listProviders', () => {
      const provider = createMockProvider('test-provider')
      providerRegistry.registerProvider('test-provider', provider)

      expect(providerRegistry.getAvailableProviders()).toEqual(
        providerRegistry.listProviders()
      )
    })
  })
})
