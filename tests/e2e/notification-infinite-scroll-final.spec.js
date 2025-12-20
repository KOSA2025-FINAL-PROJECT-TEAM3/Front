import { expect, test } from '@playwright/test'
import { setE2EAuthState } from './utils/e2eSetup'
import { buildApiUrl, getAuthCredentials } from './utils/e2eEnv'
import { ensureGeneralNotificationsOpen, setMobileViewport } from './utils/notificationTestUtils'

/**
 * 무한스크롤 실제 테스트 - 실제 로그인 사용
 */

test.describe('무한스크롤 실제 테스트', () => {
  const authCredentials = getAuthCredentials()
  test.skip(!authCredentials, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run real API tests.')

  let authToken
  let user

  test.beforeAll(async ({ request }) => {
    // 실제 로그인
    const loginResponse = await request.post(buildApiUrl('/api/auth/login'), { data: authCredentials })

    const loginData = await loginResponse.json()
    authToken = loginData.accessToken
    user = {
      ...loginData.user,
      userRole: loginData.user?.userRole || 'ROLE_USER',
      customerRole: loginData.user?.customerRole || 'SENIOR',
    }

    console.log('로그인 성공:', { userId: user?.id, token: authToken?.substring(0, 20) + '...' })
  })

  test('페이지 로드 및 알림 표시', async ({ page }) => {
    // 로그인 상태 설정 (e2eSetup 형식 사용)
    await setMobileViewport(page)
    await setE2EAuthState(page, { user, token: authToken })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 스크린샷
    await page.screenshot({ path: 'test-results/final-notifications.png', fullPage: true })

    // 알림 헤더 확인
    await expect(page.getByRole('heading', { name: '알림' })).toBeVisible()

    console.log('✅ 페이지 로드 성공')
  })

  test('스크롤 시 추가 알림 로드', async ({ page }) => {
    await setMobileViewport(page)
    await setE2EAuthState(page, { user, token: authToken })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 초기 알림 개수 확인
    const initialNotifications = await page.getByLabel('삭제').count()
    console.log('초기 알림 개수:', initialNotifications)

    // 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(3000)

    // 추가 로드 확인
    const afterScrollNotifications = await page.getByLabel('삭제').count()
    console.log('스크롤 후 알림 개수:', afterScrollNotifications)

    // 스크린샷
    await page.screenshot({ path: 'test-results/after-scroll.png', fullPage: true })

    // "더 이상 알림이 없습니다" 또는 추가 알림 확인
    const hasMoreMessage = await page.getByText('더 이상 알림이 없습니다').isVisible().catch(() => false)
    const hasNewNotifications = afterScrollNotifications > initialNotifications

    console.log('더보기 메시지:', hasMoreMessage)
    console.log('추가 로드됨:', hasNewNotifications)

    // 둘 중 하나는 참이어야 함
    expect(hasMoreMessage || hasNewNotifications).toBeTruthy()
  })
})
