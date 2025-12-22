import { expect, test } from '@playwright/test'
import { mockApi, setE2EAuth } from './utils/e2eSetup'

test.describe('스모크(보호자)', () => {
  let api

  test.beforeEach(async ({ page }) => {
    await setE2EAuth(page, { customerRole: 'CAREGIVER' })
    api = await mockApi(page)
  })

  test('설정 기본 렌더 + 글자 크기 기본 설정', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible()

    const decreaseButton = page.getByLabel('글자 작게')
    await expect(decreaseButton).toBeDisabled()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('16px')

    await expect.poll(async () => {
      const stored = await page.evaluate(() => localStorage.getItem('amapill-ui-preferences-v1'))
      return stored ?? ''
    }).toContain('"accessibilityMode":false')

    expect(api.unhandled).toEqual([])
  })
})
