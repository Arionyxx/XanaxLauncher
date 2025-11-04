import { MediaManagerDatabase } from './schema'

export const db = new MediaManagerDatabase()

export async function initializeDatabase(): Promise<boolean> {
  try {
    await db.open()
    console.log('[IndexedDB] Database initialized successfully')
    console.log('[IndexedDB] Database name:', db.name)
    console.log('[IndexedDB] Database version:', db.verno)
    return true
  } catch (error) {
    console.error('[IndexedDB] Failed to initialize database:', error)
    return false
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await db.close()
    console.log('[IndexedDB] Database closed successfully')
  } catch (error) {
    console.error('[IndexedDB] Error closing database:', error)
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await db.settings.clear()
    await db.sources.clear()
    await db.jobs.clear()
    console.log('[IndexedDB] All data cleared successfully')
  } catch (error) {
    console.error('[IndexedDB] Error clearing data:', error)
    throw error
  }
}
