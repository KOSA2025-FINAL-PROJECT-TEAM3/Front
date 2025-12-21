import { expect, test } from '@playwright/test'
import { mockApi, setE2EAuth } from './utils/e2eSetup'

test.describe('스모크(시니어)', () => {
  let api

  test.beforeEach(async ({ page }) => {
    await setE2EAuth(page, { customerRole: 'SENIOR' })
    api = await mockApi(page)
  })

  test('대시보드 기본 렌더 + 글자 크기 기본 설정', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('오늘 복약 일정이 없습니다')).toBeVisible()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('20px')

    expect(api.unhandled).toEqual([])
    expect(api.calls.some((c) => c.method === 'GET' && c.path === '/api/notifications')).toBe(true)
  })

  test('설정에서 글자 크기 단계 낮추기', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible()

    const decreaseButton = page.getByLabel('글자 작게')
    await expect(decreaseButton).toBeEnabled()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('20px')

    await decreaseButton.click()
    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('18px')

    await decreaseButton.click()
    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('16px')

    const stored = await page.evaluate(() => localStorage.getItem('amapill-ui-preferences-v1'))
    expect(stored).toContain('"fontScaleLevel":1')
    expect(stored).toContain('"accessibilityMode":false')

    expect(api.unhandled).toEqual([])
  })
})
