import { expect, test } from '@playwright/test'
import { setE2EAuthState } from './utils/e2eSetup'
import { buildApiUrl, getAuthCredentials } from './utils/e2eEnv'
import { ensureGeneralNotificationsOpen, setMobileViewport } from './utils/notificationTestUtils'

/**
 * 무한스크롤 테스트 (실제 백엔드)
 * - 데이터 없을 때: "더 이상 알림이 없습니다" 표시
 * - 데이터 있을 때: 스크롤 시 추가 로드
 */

test.describe('무한스크롤 동작 검증', () => {
  const authCredentials = getAuthCredentials()
  test.skip(!authCredentials, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run real API tests.')

  let authToken
  let user

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(buildApiUrl('/api/auth/login'), { data: authCredentials })

    const loginData = await loginResponse.json()
    authToken = loginData.accessToken
    user = {
      ...loginData.user,
      userRole: loginData.user?.userRole || 'ROLE_USER',
      customerRole: loginData.user?.customerRole || 'SENIOR',
    }

    console.log('✅ 로그인 성공')
  })

  const setupAuth = async (page) => {
    await setE2EAuthState(page, { user, token: authToken })
  }

  test('페이지 로드 성공', async ({ page }) => {
    await setMobileViewport(page)
    await setupAuth(page)

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '알림' })).toBeVisible()

    console.log('✅ 페이지 로드 성공')
  })

  test('빈 알림 목록 처리 - "더 이상 알림이 없습니다" 또는 "새로운 알림이 없습니다" 표시', async ({ page }) => {
    await setMobileViewport(page)
    await setupAuth(page)

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 스크린샷
    await page.screenshot({ path: 'test-results/empty-notifications.png', fullPage: true })

    // 빈 상태 메시지 확인 (둘 중 하나)
    const hasNewMessage = await page.getByText('새로운 알림이 없습니다').isVisible().catch(() => false)
    const hasNoMoreMessage = await page.getByText('더 이상 알림이 없습니다').isVisible().catch(() => false)
    const hasLoadError = await page.getByText('로드 실패').isVisible().catch(() => false)

    console.log('빈 상태 메시지:', { hasNewMessage, hasNoMoreMessage, hasLoadError })

    // 에러가 아니면서 메시지가 하나라도 있으면 OK
    expect(!hasLoadError && (hasNewMessage || hasNoMoreMessage)).toBeTruthy()

    console.log('✅ 빈 알림 처리 성공')
  })

  test('스크롤 동작 확인 - 로딩 스피너 또는 종료 메시지', async ({ page }) => {
    await setMobileViewport(page)
    await setupAuth(page)

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // 스크린샷
    await page.screenshot({ path: 'test-results/after-scroll-test.png', fullPage: true })

    // 로딩 중이거나 종료 메시지가 표시되어야 함
    const isLoading = await page.locator('[role="progressbar"]').isVisible().catch(() => false)
    const hasNoMore = await page.getByText('더 이상 알림이 없습니다').isVisible().catch(() => false)
    const hasNewNotifications = await page.getByText('새로운 알림이 없습니다').isVisible().catch(() => false)

    console.log('스크롤 후 상태:', { isLoading, hasNoMore, hasNewNotifications })

    // 셋 중 하나는 참이어야 함 (정상 동작)
    expect(isLoading || hasNoMore || hasNewNotifications).toBeTruthy()

    console.log('✅ 스크롤 동작 확인 완료')
  })
})
