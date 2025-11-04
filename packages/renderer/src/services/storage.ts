import { db } from '@/db/db'
import { Setting, Source, Job } from '@/db/schema'

export async function getSetting(key: string): Promise<Setting | undefined> {
  try {
    const setting = await db.settings.get(key)
    return setting
  } catch (error) {
    console.error(`[Storage] Error getting setting "${key}":`, error)
    throw error
  }
}

export async function setSetting(key: string, value: any): Promise<string> {
  try {
    const setting: Setting = {
      key,
      value,
      updatedAt: Date.now(),
    }
    await db.settings.put(setting)
    console.log(`[Storage] Setting "${key}" saved successfully`)
    return key
  } catch (error) {
    console.error(`[Storage] Error setting "${key}":`, error)
    throw error
  }
}

export async function getAllSettings(): Promise<Setting[]> {
  try {
    const settings = await db.settings.toArray()
    return settings
  } catch (error) {
    console.error('[Storage] Error getting all settings:', error)
    throw error
  }
}

export async function deleteSetting(key: string): Promise<void> {
  try {
    await db.settings.delete(key)
    console.log(`[Storage] Setting "${key}" deleted successfully`)
  } catch (error) {
    console.error(`[Storage] Error deleting setting "${key}":`, error)
    throw error
  }
}

export async function getSources(): Promise<Source[]> {
  try {
    const sources = await db.sources.toArray()
    return sources
  } catch (error) {
    console.error('[Storage] Error getting sources:', error)
    throw error
  }
}

export async function getSource(id: string): Promise<Source | undefined> {
  try {
    const source = await db.sources.get(id)
    return source
  } catch (error) {
    console.error(`[Storage] Error getting source "${id}":`, error)
    throw error
  }
}

export async function addSource(
  source: Omit<Source, 'id' | 'lastSyncAt' | 'status' | 'entryCount' | 'data'>
): Promise<string> {
  try {
    const id = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSource: Source = {
      ...source,
      id,
      lastSyncAt: null,
      status: 'never_synced',
      entryCount: 0,
      data: null,
    }
    await db.sources.add(newSource)
    console.log(`[Storage] Source "${id}" added successfully`)
    return id
  } catch (error) {
    console.error('[Storage] Error adding source:', error)
    throw error
  }
}

export async function updateSource(
  id: string,
  updates: Partial<Omit<Source, 'id'>>
): Promise<void> {
  try {
    await db.sources.update(id, updates)
    console.log(`[Storage] Source "${id}" updated successfully`)
  } catch (error) {
    console.error(`[Storage] Error updating source "${id}":`, error)
    throw error
  }
}

export async function removeSource(id: string): Promise<void> {
  try {
    await db.sources.delete(id)
    console.log(`[Storage] Source "${id}" removed successfully`)
  } catch (error) {
    console.error(`[Storage] Error removing source "${id}":`, error)
    throw error
  }
}

export async function getJobs(): Promise<Job[]> {
  try {
    const jobs = await db.jobs.toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('[Storage] Error getting jobs:', error)
    throw error
  }
}

export async function getJob(id: string): Promise<Job | undefined> {
  try {
    const job = await db.jobs.get(id)
    return job
  } catch (error) {
    console.error(`[Storage] Error getting job "${id}":`, error)
    throw error
  }
}

export async function addJob(
  job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    const newJob: Job = {
      ...job,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await db.jobs.add(newJob)
    console.log(`[Storage] Job "${id}" added successfully`)
    return id
  } catch (error) {
    console.error('[Storage] Error adding job:', error)
    throw error
  }
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<Job, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const updatedFields = {
      ...updates,
      updatedAt: Date.now(),
    }
    await db.jobs.update(id, updatedFields)
    console.log(`[Storage] Job "${id}" updated successfully`)
  } catch (error) {
    console.error(`[Storage] Error updating job "${id}":`, error)
    throw error
  }
}

export async function removeJob(id: string): Promise<void> {
  try {
    await db.jobs.delete(id)
    console.log(`[Storage] Job "${id}" removed successfully`)
  } catch (error) {
    console.error(`[Storage] Error removing job "${id}":`, error)
    throw error
  }
}

export async function getJobsByStatus(status: string): Promise<Job[]> {
  try {
    const jobs = await db.jobs.where('status').equals(status).toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error(
      `[Storage] Error getting jobs with status "${status}":`,
      error
    )
    throw error
  }
}

export async function getJobsByProvider(provider: string): Promise<Job[]> {
  try {
    const jobs = await db.jobs.where('provider').equals(provider).toArray()
    return jobs.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error(
      `[Storage] Error getting jobs with provider "${provider}":`,
      error
    )
    throw error
  }
}
