import { _electron as electron, ElectronApplication, Page } from 'playwright'
import path from 'path'

export async function launchElectronApp(): Promise<{
  app: ElectronApplication
  page: Page
}> {
  const app = await electron.launch({
    args: [path.join(__dirname, '../packages/main/dist/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  })

  const page = await app.firstWindow()

  await page.waitForLoadState('domcontentloaded')

  return { app, page }
}

export async function closeElectronApp(
  app: ElectronApplication
): Promise<void> {
  await app.close()
}
