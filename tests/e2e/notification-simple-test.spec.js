import { expect, test } from '@playwright/test'
import { setE2EAuth, mockApi } from './utils/e2eSetup'

/**
 * 간단한 알림 페이지 테스트 (디버깅용)
 */

test.describe('알림 페이지 기본 테스트', () => {
  test('알림 페이지 기본 렌더링', async ({ page }) => {
    await setE2EAuth(page, { customerRole: 'SENIOR' })

    const api = await mockApi(page)

    await page.goto('/notifications')

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')

    // 스크린샷 찍기
    await page.screenshot({ path: 'test-results/debug-notification-page.png' })

    // 페이지 타이틀/헤더 확인
    await expect(page).toHaveTitle(/front/i)
    await expect(page.getByRole('heading', { name: '알림' })).toBeVisible()

    console.log('Unhandled API calls:', api.unhandled)
  })
})
