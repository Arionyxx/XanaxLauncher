import { dialog, app, shell } from 'electron'
import { promises as fs, Dirent } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { spawn } from 'child_process'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import {
  dialogSelectFolderResponseSchema,
  settingsGetRequestSchema,
  settingsGetResponseSchema,
  settingsSetRequestSchema,
  settingsSetResponseSchema,
  appVersionResponseSchema,
  providerStartJobRequestSchema,
  providerStartJobResponseSchema,
  providerGetStatusRequestSchema,
  providerGetStatusResponseSchema,
  providerCancelJobRequestSchema,
  providerCancelJobResponseSchema,
  providerTestConnectionRequestSchema,
  providerTestConnectionResponseSchema,
  logsGetPathResponseSchema,
  logsOpenFolderResponseSchema,
  updateCheckResponseSchema,
  updateInstallResponseSchema,
  libraryScanRequestSchema,
  libraryScanResponseSchema,
  libraryLaunchRequestSchema,
  libraryLaunchResponseSchema,
  libraryOpenFolderRequestSchema,
  libraryOpenFolderResponseSchema,
  DialogSelectFolderResponse,
  SettingsGetResponse,
  SettingsSetResponse,
  AppVersionResponse,
  ProviderStartJobResponse,
  ProviderGetStatusResponse,
  ProviderCancelJobResponse,
  ProviderTestConnectionResponse,
  LogsGetPathResponse,
  LogsOpenFolderResponse,
  UpdateCheckResponse,
  UpdateInstallResponse,
  LibraryScanResponse,
  LibraryLaunchResponse,
  LibraryOpenFolderResponse,
  LibraryScanEntry,
} from './schemas'

const settings: Map<string, unknown> = new Map()

const manifestCandidates = [
  'xanax-manifest.json',
  'xanax.game.json',
  'manifest.json',
  'game.json',
]

const executableExtensionsByPlatform: Partial<
  Record<NodeJS.Platform, string[]>
> = {
  win32: ['.exe', '.bat', '.cmd'],
  darwin: ['.app'],
  linux: ['', '.sh', '.run', '.AppImage'],
  aix: [''],
  freebsd: ['', '.sh'],
  openbsd: ['', '.sh'],
  android: ['', '.sh'],
  sunos: ['', '.sh'],
  haiku: ['', '.sh'],
  cygwin: ['.exe', '.bat', '.cmd', ''],
  netbsd: ['', '.sh'],
}

function hashPath(value: string): string {
  return crypto.createHash('sha1').update(value).digest('hex')
}

function getDefaultScanDirectories(): string[] {
  const defaults = new Set<string>()
  const home = app.getPath('home')

  defaults.add(path.join(home, 'Games'))
  defaults.add(path.join(home, 'XanaxLauncher', 'Games'))

  switch (process.platform) {
    case 'win32': {
      const programFiles = process.env['PROGRAMFILES']
      const programFilesX86 = process.env['PROGRAMFILES(X86)']
      const localAppData = process.env['LOCALAPPDATA']

      if (programFiles) {
        defaults.add(path.join(programFiles, 'XanaxLauncher'))
      }
      if (programFilesX86) {
        defaults.add(path.join(programFilesX86, 'XanaxLauncher'))
      }
      if (localAppData) {
        defaults.add(path.join(localAppData, 'XanaxLauncher', 'Games'))
      }
      defaults.add(path.join(home, 'AppData', 'Local', 'XanaxLauncher', 'Games'))
      break
    }
    case 'darwin': {
      defaults.add('/Applications')
      defaults.add(path.join(home, 'Applications'))
      defaults.add(path.join(home, 'Library', 'Application Support', 'XanaxLauncher', 'Games'))
      break
    }
    default: {
      defaults.add(path.join(home, '.local', 'share', 'XanaxLauncher', 'games'))
      defaults.add('/usr/local/games')
      defaults.add('/usr/games')
      break
    }
  }

  return Array.from(defaults)
}

async function safeStat(filePath: string) {
  try {
    return await fs.stat(filePath)
  } catch (error) {
    return null
  }
}

async function getDirectorySize(dir: string): Promise<number> {
  let total = 0

  let dirents: Dirent[]
  try {
    dirents = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    log.warn('[Library] Unable to read directory during size calculation:', dir, error)
    return 0
  }

  for (const dirent of dirents) {
    if (dirent.isSymbolicLink()) {
      continue
    }

    const fullPath = path.join(dir, dirent.name)

    try {
      if (dirent.isDirectory()) {
        total += await getDirectorySize(fullPath)
      } else if (dirent.isFile()) {
        const stat = await fs.stat(fullPath)
        total += stat.size
      }
    } catch (error) {
      log.warn('[Library] Failed to stat path during size calculation:', fullPath, error)
    }
  }

  return total
}

async function readManifest(basePath: string): Promise<Record<string, unknown> | null> {
  for (const filename of manifestCandidates) {
    const manifestPath = path.join(basePath, filename)
    try {
      const file = await fs.readFile(manifestPath, 'utf8')
      const parsed = JSON.parse(file)
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, unknown>
      }
    } catch (error) {
      // Ignore parsing errors for missing or invalid manifests
      continue
    }
  }

  return null
}

async function findExecutableCandidate(basePath: string, depth = 0): Promise<string | null> {
  if (depth > 3) {
    return null
  }

  let dirents: Dirent[]
  try {
    dirents = await fs.readdir(basePath, { withFileTypes: true })
  } catch (error) {
    log.debug('[Library] Unable to inspect directory for executables:', basePath, error)
    return null
  }

  for (const dirent of dirents) {
    if (dirent.isSymbolicLink()) {
      continue
    }

    const fullPath = path.join(basePath, dirent.name)

    if (process.platform === 'darwin' && dirent.isDirectory() && dirent.name.endsWith('.app')) {
      return fullPath
    }

    if (dirent.isDirectory()) {
      const lower = dirent.name.toLowerCase()
      if (['bin', 'game', 'games', 'launcher'].includes(lower)) {
        const nested = await findExecutableCandidate(fullPath, depth + 1)
        if (nested) {
          return nested
        }
      }
    }
  }

  const allowed = executableExtensionsByPlatform[process.platform] ?? ['']

  for (const dirent of dirents) {
    if (!dirent.isFile()) {
      continue
    }

    const ext = path.extname(dirent.name)
    if (allowed.includes(ext) || (allowed.includes('') && ext === '')) {
      return path.join(basePath, dirent.name)
    }
  }

  for (const dirent of dirents) {
    if (!dirent.isDirectory() || dirent.isSymbolicLink()) {
      continue
    }

    const nested = await findExecutableCandidate(path.join(basePath, dirent.name), depth + 1)
    if (nested) {
      return nested
    }
  }

  return null
}

async function resolveExecutable(
  basePath: string,
  manifest: Record<string, unknown> | null
): Promise<string | null> {
  const candidates: string[] = []

  const directExecutable = manifest?.executable ?? manifest?.executablePath ?? manifest?.launch
  if (typeof directExecutable === 'string') {
    candidates.push(directExecutable)
  }

  const manifestExecutables = manifest?.executables
  if (Array.isArray(manifestExecutables)) {
    for (const entry of manifestExecutables) {
      if (typeof entry === 'string') {
        candidates.push(entry)
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = path.isAbsolute(candidate)
      ? candidate
      : path.join(basePath, candidate)
    const stat = await safeStat(normalized)
    if (stat && (stat.isFile() || (process.platform === 'darwin' && stat.isDirectory()))) {
      return normalized
    }
  }

  return await findExecutableCandidate(basePath)
}

async function inspectGameDirectory(dir: string): Promise<LibraryScanEntry | null> {
  const stats = await safeStat(dir)
  if (!stats || !stats.isDirectory()) {
    return null
  }

  const manifest = await readManifest(dir)
  const rawTitle = typeof manifest?.title === 'string' ? manifest.title : undefined
  const title = rawTitle?.trim().length ? rawTitle.trim() : path.basename(dir)

  const installDateValue = manifest?.installDate
  let installDate = Date.now()
  if (typeof installDateValue === 'number') {
    installDate = installDateValue
  } else if (typeof installDateValue === 'string') {
    const parsed = Date.parse(installDateValue)
    if (!Number.isNaN(parsed)) {
      installDate = parsed
    }
  } else {
    installDate = stats.birthtimeMs || stats.ctimeMs || Date.now()
  }

  const executablePath = await resolveExecutable(dir, manifest)

  if (!executablePath && !manifest) {
    // Skip directories that have neither manifests nor detectable executables
    return null
  }

  const size = await getDirectorySize(dir)

  const coverCandidate =
    typeof manifest?.cover === 'string'
      ? (manifest.cover as string)
      : typeof manifest?.coverUrl === 'string'
        ? (manifest.coverUrl as string)
        : null

  let lastPlayed: number | null = null
  const lastPlayedRaw = manifest?.lastPlayed
  if (typeof lastPlayedRaw === 'number') {
    lastPlayed = lastPlayedRaw
  } else if (typeof lastPlayedRaw === 'string') {
    const parsed = Date.parse(lastPlayedRaw)
    if (!Number.isNaN(parsed)) {
      lastPlayed = parsed
    }
  }

  return {
    id: hashPath(dir),
    title,
    installPath: dir,
    installDate,
    size,
    coverUrl: coverCandidate,
    lastPlayed,
    executablePath: executablePath ?? null,
    metadata: manifest ?? null,
  }
}

export async function handleDialogSelectFolder(): Promise<DialogSelectFolderResponse> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  const validatedResult = dialogSelectFolderResponseSchema.parse({
    canceled: result.canceled,
    filePaths: result.filePaths,
  })

  return validatedResult
}

export async function handleSettingsGet(
  data: unknown
): Promise<SettingsGetResponse> {
  const validated = settingsGetRequestSchema.parse(data)
  const value = settings.get(validated.key)

  const response = settingsGetResponseSchema.parse({
    key: validated.key,
    value: value ?? null,
  })

  return response
}

export async function handleSettingsSet(
  data: unknown
): Promise<SettingsSetResponse> {
  const validated = settingsSetRequestSchema.parse(data)
  settings.set(validated.key, validated.value)

  const response = settingsSetResponseSchema.parse({
    success: true,
  })

  return response
}

export async function handleAppVersion(): Promise<AppVersionResponse> {
  const response = appVersionResponseSchema.parse({
    version: app.getVersion(),
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  })

  return response
}

export async function handleProviderStartJob(
  data: unknown
): Promise<ProviderStartJobResponse> {
  const validated = providerStartJobRequestSchema.parse(data)

  const response = providerStartJobResponseSchema.parse({
    jobId: validated.provider,
    status: 'QUEUED',
  })

  return response
}

export async function handleProviderGetStatus(
  data: unknown
): Promise<ProviderGetStatusResponse> {
  const validated = providerGetStatusRequestSchema.parse(data)

  const response = providerGetStatusResponseSchema.parse({
    id: validated.jobId,
    status: 'QUEUED',
    progress: 0,
    files: [],
    metadata: {},
  })

  return response
}

export async function handleProviderCancelJob(
  data: unknown
): Promise<ProviderCancelJobResponse> {
  const validated = providerCancelJobRequestSchema.parse(data)

  const response = providerCancelJobResponseSchema.parse({
    success: true,
    message: `Job ${validated.jobId} cancelled`,
  })

  return response
}

export async function handleProviderTestConnection(
  data: unknown
): Promise<ProviderTestConnectionResponse> {
  const validated = providerTestConnectionRequestSchema.parse(data)

  const response = providerTestConnectionResponseSchema.parse({
    success: true,
    message: `Connected to ${validated.provider}`,
  })

  return response
}

export async function handleLogsGetPath(): Promise<LogsGetPathResponse> {
  const logPath = log.transports.file.getFile().path

  const response = logsGetPathResponseSchema.parse({
    path: logPath,
  })

  return response
}

export async function handleLogsOpenFolder(): Promise<LogsOpenFolderResponse> {
  const logPath = log.transports.file.getFile().path
  const logDir = logPath.substring(0, logPath.lastIndexOf('/'))

  await shell.openPath(logDir)

  const response = logsOpenFolderResponseSchema.parse({
    success: true,
  })

  return response
}

export async function handleUpdateCheck(): Promise<UpdateCheckResponse> {
  try {
    const updateCheckResult = await autoUpdater.checkForUpdates()

    const response = updateCheckResponseSchema.parse({
      available: updateCheckResult !== null,
      version: updateCheckResult?.updateInfo.version ?? null,
      releaseDate: updateCheckResult?.updateInfo.releaseDate ?? null,
      releaseNotes: updateCheckResult?.updateInfo.releaseNotes as
        | string
        | null
        | undefined,
    })

    return response
  } catch (error) {
    log.error('Update check failed:', error)

    return updateCheckResponseSchema.parse({
      available: false,
      version: null,
      releaseDate: null,
      releaseNotes: null,
    })
  }
}

export async function handleUpdateInstall(): Promise<UpdateInstallResponse> {
  try {
    autoUpdater.quitAndInstall()

    const response = updateInstallResponseSchema.parse({
      success: true,
    })

    return response
  } catch (error) {
    log.error('Update install failed:', error)

    const response = updateInstallResponseSchema.parse({
      success: false,
    })

    return response
  }
}

export async function handleLibraryScan(data: unknown): Promise<LibraryScanResponse> {
  const start = Date.now()
  const validated = libraryScanRequestSchema.parse(data ?? {})

  const requestedPaths = (validated.paths ?? [])
    .map((scanPath) => path.resolve(scanPath))
    .filter((value, index, array) => array.indexOf(value) === index)

  const fallbackPaths = getDefaultScanDirectories().map((scanPath) =>
    path.resolve(scanPath)
  )

  const scanPaths = Array.from(
    new Set(requestedPaths.length ? requestedPaths : fallbackPaths)
  )

  const entries: LibraryScanEntry[] = []
  const errors: string[] = []

  for (const scanPath of scanPaths) {
    let dirents: Dirent[]

    try {
      dirents = await fs.readdir(scanPath, { withFileTypes: true })
    } catch (error) {
      const message = (error as Error).message ?? 'Unknown error'
      errors.push(`${scanPath}: ${message}`)
      log.warn('[Library] Unable to read scan path:', scanPath, error)
      continue
    }

    for (const dirent of dirents) {
      if (!dirent.isDirectory() || dirent.isSymbolicLink()) {
        continue
      }

      const location = path.join(scanPath, dirent.name)
      try {
        const entry = await inspectGameDirectory(location)
        if (entry) {
          entries.push(entry)
        }
      } catch (error) {
        const message = (error as Error).message ?? 'Unknown error'
        errors.push(`${location}: ${message}`)
        log.warn('[Library] Failed to inspect directory:', location, error)
      }
    }
  }

  const response = libraryScanResponseSchema.parse({
    entries,
    scannedPaths: scanPaths,
    errors: errors.length ? errors : undefined,
    duration: Date.now() - start,
    found: entries.length,
  })

  log.info('[Library] Scan completed', {
    found: response.found,
    scannedPaths: response.scannedPaths,
    duration: response.duration,
  })

  return response
}

export async function handleLibraryLaunch(
  data: unknown
): Promise<LibraryLaunchResponse> {
  const validated = libraryLaunchRequestSchema.parse(data ?? {})

  try {
    const stat = await safeStat(validated.executablePath)
    if (!stat) {
      throw new Error('Launch executable could not be accessed')
    }

    if (process.platform === 'darwin' && validated.executablePath.endsWith('.app')) {
      const child = spawn('open', [validated.executablePath], {
        detached: true,
        stdio: 'ignore',
      })
      child.unref()
    } else {
      const cwd = validated.cwd ?? path.dirname(validated.executablePath)
      const child = spawn(validated.executablePath, [], {
        cwd,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      })
      child.unref()
    }

    return libraryLaunchResponseSchema.parse({ success: true })
  } catch (error) {
    log.error('[Library] Failed to launch game:', validated.executablePath, error)
    return libraryLaunchResponseSchema.parse({
      success: false,
      message: (error as Error).message ?? 'Unable to launch the selected game',
    })
  }
}

export async function handleLibraryOpenFolder(
  data: unknown
): Promise<LibraryOpenFolderResponse> {
  const validated = libraryOpenFolderRequestSchema.parse(data ?? {})

  try {
    const result = await shell.openPath(validated.path)
    if (result) {
      log.warn('[Library] openPath returned a warning:', result)
      return libraryOpenFolderResponseSchema.parse({ success: false })
    }

    return libraryOpenFolderResponseSchema.parse({ success: true })
  } catch (error) {
    log.error('[Library] Failed to open folder:', validated.path, error)
    return libraryOpenFolderResponseSchema.parse({ success: false })
  }
}
