import { test, expect } from '@playwright/test'
import { launchElectronApp, closeElectronApp } from './electron-helpers'

test.describe('Onboarding Flow', () => {
  test('should complete onboarding wizard', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 })

      await page.getByRole('button', { name: /next|continue/i }).click()

      await expect(page.getByText(/folder|director/i)).toBeVisible()
      await page.getByRole('button', { name: /next|continue|skip/i }).click()

      await expect(page.getByText(/source/i)).toBeVisible()
      await page.getByRole('button', { name: /next|continue|skip/i }).click()

      await expect(page.getByText(/provider/i)).toBeVisible()
      await page.getByRole('button', { name: /next|continue|skip/i }).click()

      await expect(
        page.getByText(/complete|finish|done/i)
      ).toBeVisible()

      await page.getByRole('button', { name: /finish|get started/i }).click()

      await expect(page.getByRole('main')).toBeVisible()
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should skip onboarding', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 })

      await page.keyboard.press('Escape')

      await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 })
    } finally {
      await closeElectronApp(app)
    }
  })
})
