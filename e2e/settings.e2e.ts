import { test, expect } from '@playwright/test'
import { launchElectronApp, closeElectronApp } from './electron-helpers'

test.describe('Settings Persistence', () => {
  test('should persist settings across app restarts', async () => {
    let { app, page } = await launchElectronApp()

    try {
      await page.waitForLoadState('domcontentloaded')

      const settingsButton = page.getByRole('link', { name: /settings/i })
      await settingsButton.click()

      await expect(page.getByText(/settings/i)).toBeVisible()

      const languageSelect = page.locator('select').first()
      await languageSelect.selectOption('en')

      await closeElectronApp(app)
      ;({ app, page } = await launchElectronApp())

      await page.waitForLoadState('domcontentloaded')
      await page.getByRole('link', { name: /settings/i }).click()

      const savedLanguage = await page.locator('select').first().inputValue()
      expect(savedLanguage).toBe('en')
    } finally {
      await closeElectronApp(app)
    }
  })
})
