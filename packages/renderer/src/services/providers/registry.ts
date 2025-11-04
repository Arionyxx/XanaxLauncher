/**
 * Provider Registry
 *
 * Manages available provider instances and provides lookup functionality
 */

import { Provider, ProviderError } from '@/types/provider'

class ProviderRegistry {
  private providers = new Map<string, Provider>()

  /**
   * Register a provider instance
   * @param name - Unique provider name
   * @param instance - Provider implementation
   * @throws Error if provider name already exists
   */
  registerProvider(name: string, instance: Provider): void {
    if (this.providers.has(name)) {
      throw new Error(`Provider '${name}' is already registered`)
    }

    if (instance.name !== name) {
      throw new Error(
        `Provider name mismatch: expected '${name}', got '${instance.name}'`
      )
    }

    this.providers.set(name, instance)
  }

  /**
   * Get a provider by name
   * @param name - Provider name
   * @returns Provider instance
   * @throws ProviderError if provider not found
   */
  getProvider(name: string): Provider {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new ProviderError(
        `Provider '${name}' not found`,
        name,
        'PROVIDER_NOT_FOUND'
      )
    }
    return provider
  }

  /**
   * Check if a provider is registered
   * @param name - Provider name
   * @returns true if provider exists
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name)
  }

  /**
   * List all registered provider names
   * @returns Array of provider names
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Get all provider instances
   * @returns Array of provider instances
   */
  getAllProviders(): Provider[] {
    return Array.from(this.providers.values())
  }

  /**
   * Unregister a provider
   * @param name - Provider name
   * @returns true if provider was removed
   */
  unregisterProvider(name: string): boolean {
    return this.providers.delete(name)
  }

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear()
  }

  /**
   * Get the number of registered providers
   */
  get size(): number {
    return this.providers.size
  }

  /**
   * Get list of available (registered) provider names
   * Alias for listProviders()
   * @returns Array of provider names
   */
  getAvailableProviders(): string[] {
    return this.listProviders()
  }
}

export const providerRegistry = new ProviderRegistry()
