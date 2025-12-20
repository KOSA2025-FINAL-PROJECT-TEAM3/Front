import { expect, test } from '@playwright/test'
import { setE2EAuthState } from './utils/e2eSetup'
import { buildApiUrl, getAuthCredentials } from './utils/e2eEnv'
import { ensureGeneralNotificationsOpen, setMobileViewport } from './utils/notificationTestUtils'

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
})

test('실제 백엔드로 무한스크롤 테스트', async ({ page }) => {
  await setMobileViewport(page)
  await setE2EAuthState(page, { user, token: authToken })

  await page.goto('/notifications')

  // 페이지 로드 대기
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await ensureGeneralNotificationsOpen(page)

  // 스크린샷
  await page.screenshot({ path: 'test-results/real-notifications.png' })

  // 알림 헤더 확인
  await expect(page.getByText('알림')).toBeVisible()

  // 하단으로 스크롤
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(2000)

  console.log('Test completed')
})
