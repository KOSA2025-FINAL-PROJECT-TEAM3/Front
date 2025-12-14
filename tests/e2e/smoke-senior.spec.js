import { expect, test } from '@playwright/test'
import { mockApi, setE2EAuth } from './utils/e2eSetup'

test.describe('스모크(시니어)', () => {
  test.beforeEach(async ({ page }) => {
    await setE2EAuth(page, { customerRole: 'SENIOR' })
    await mockApi(page)
  })

  test('대시보드 기본 렌더 + 확대모드 기본 ON', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: '오늘의 복용' })).toBeVisible()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('18px')
  })

  test('설정에서 확대모드 토글 OFF', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible()

    const toggle = page.getByLabel('확대 모드')
    await expect(toggle).toBeChecked()

    await toggle.click()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('16px')

    const stored = await page.evaluate(() => localStorage.getItem('amapill-ui-preferences-v1'))
    expect(stored).toContain('"accessibilityMode":false')
  })
})
